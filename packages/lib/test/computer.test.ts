import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { address, networks, Transaction } from '@bitcoin-computer/nakamotojs'

const { expect } = chai

chai.use(chaiAsPromised)

dotenv.config({ path: '../node/.env' })

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

class C extends Contract {}

class Counter extends Contract {
  n: number

  constructor() {
    super({ n: 0 })
  }
  inc() {
    this.n += 1
  }
}

describe.only('Computer', () => {
  const computer = new Computer({ chain, network, url })

  before('Before each Computer test', async () => {
    await computer.faucet(1e8)
  })

  describe('broadcast', () => {
    it('Should broadcast a transaction', async () => {
      const transition = { exp: `${C} new C()` }
      const { tx } = await computer.encode(transition)
      const txId = await computer.broadcast(tx)
      expect(typeof txId).eq('string')
    })
  })

  describe('decode', () => {
    it('Should broadcast a transaction', async () => {
      const transition = {
        exp: `${C} new ${C.name}()`,
        env: {},
        mod: '',
      }
      const { tx } = await computer.encode(transition)
      const decoded = await computer.decode(tx)

      expect(decoded).to.deep.equal(transition)
    })
  })

  describe('deploy', () => {
    it('Should deploy a module using multisig', async () => {
      const multisigComputer = new Computer({ chain, network, url, moduleStorageType: 'multisig' })
      await multisigComputer.faucet(1730000)
      const big = `x`.repeat(18262) // ~ 18KB

      const rev = await multisigComputer.deploy(big)
      expect(rev).to.not.equal(undefined)
    })

    it('Should deploy a module using taproot', async () => {
      if (['BTC', 'LTC'].includes(chain)) {
        const taprootComputer = new Computer({ chain, network, url, moduleStorageType: 'taproot' })
        await taprootComputer.faucet(436000)
        const veryBig = `x`.repeat(396000) // ~ 400KB

        const rev = await taprootComputer.deploy(veryBig)
        expect(rev).to.not.equal(undefined)
      }
    })

    it('Should deploy a module that depends on another module', async () => {
      const modSpecA = await computer.deploy(`export class A extends Contract {}`)

      const modSpecB = await computer.deploy(`
        import { A } from '${modSpecA}'
        export class B extends A {}
      `)
      const { tx } = await computer.encode({ exp: `new B()`, mod: modSpecB })
      expect(tx.getId()).to.be.a.string
    })

    it('Should deploy a module of arbitrary length', async () => {
      // this function inputs a long string and output a module specifier where it can be obtained
      const store = async (s: string, n: number) => {
        const chunks = []
        for (let i = 0; i < s.length; i += n) {
          chunks.push(s.slice(i, i + n))
        }

        let module = ''
        for (let i = 0; i < s.length / n; i += 1) {
          const mod = await computer.deploy(`export const c${i} = '${chunks[i]}'`)
          module += `import { c${i} } from '${mod}'\n`
        }

        const cs = Array.from({ length: n + 1 }, (_, i) => `c${i}`).join(' + ')
        module += `export const s = ${cs}`
        return computer.deploy(module)
      }

      const longString = '0'.repeat(10)
      const mod = await store(longString, 3)

      const { s } = await computer.load(mod)
      expect(s).eq(longString)
    })
  })

  describe('encode', () => {
    it('Should encode a basic type', async () => {
      const { effect, tx } = await computer.encode({ exp: '1' })
      expect(effect).deep.eq({ res: 1, env: {} })
      const txId = await computer.broadcast(tx)
      expect(await computer.sync(txId)).deep.eq(effect)
    })

    it('Should work for a class', async () => {
      const { effect: e1, tx: tx1 } = await computer.encode({
        exp: `${Counter} new Counter()`,
      })
      const txId1 = await computer.broadcast(tx1)
      expect(await computer.sync(txId1)).deep.eq(e1)

      const { effect: e2, tx: tx2 } = await computer.encode({
        exp: `c.inc()`,
        env: { c: (e1.res as any)._rev },
      })
      const txId2 = await computer.broadcast(tx2)
      expect(await computer.sync(txId2)).deep.eq(e2)
    })
  })

  describe('encodeNew', () => {
    it('Should encode a constructor call', async () => {
      const { tx, effect } = await computer.encodeNew({ constructor: C, args: [] })
      const decoded = await computer.decode(tx)
      expect(decoded).to.deep.eq({
        exp: `${C} new ${C.name}()`,
        env: {},
        mod: '',
      })
      const txId = await computer.broadcast(tx)
      expect(await computer.sync(txId)).deep.eq(effect)
    })
  })

  describe('encodeCall', async () => {
    it('Should encode a constructor call', async () => {
      const counter = await computer.new(Counter, [])
      const { tx } = await computer.encodeCall({
        target: counter,
        property: 'inc',
        args: [1],
      })
      const decoded = await computer.decode(tx)
      expect(decoded).to.deep.eq({
        exp: `__bc__.inc(1)`,
        env: { __bc__: counter._rev },
        mod: '',
      })
    })
  })

  describe('faucet', () => {
    it('Should fund the wallet of the current object', async () => {
      const c = new Computer({ chain, network, url })
      const utxo = await c.faucet(1e8)
      expect(utxo).to.matchPattern({
        txId: (val) => typeof val === 'string',
        vout: (vout) => typeof vout === 'number',
        height: -1,
        satoshis: 1e8,
      })
      const { balance } = await c.getBalance()
      expect(balance).eq(1e8)
    })

    it('Should fund the wallet of the current object', async () => {
      const c1 = new Computer({ chain, network, url })
      const c2 = new Computer({ chain, network, url })
      await c1.faucet(1e8, c2.getAddress())
      const { balance: b1 } = await c1.getBalance()
      const { balance: b2 } = await c2.getBalance()
      expect(b1).eq(0)
      expect(b2).eq(1e8)
    })

    it('Should fund the wallet of the current object', async () => {
      const c = new Computer({ chain, network: 'testnet', url })
      await expect(c.faucet(1e8)).to.be.rejected
    })
  })

  describe('fund', () => {
    it('Should fund a NakamotoJS transaction', async () => {
      const tx = new Transaction()
      const { regtest } = networks
      const outputScript = address.toOutputScript('mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt', regtest)
      tx.addOutput(outputScript, 1e5)
      await computer.fund(tx)
      await computer.sign(tx)
      await computer.broadcast(tx)
    })

    it('Should fund a Bitcoin Computer transaction', async () => {
      const { tx } = await computer.encode({
        exp: `${C} new ${C.name}()`,
        fund: false,
      })

      const computer2 = new Computer({ chain, network, url })
      await computer2.faucet(1e8)
      await computer2.fund(tx)
      await computer2.sign(tx)
      await computer2.broadcast(tx)
    })
  })

  describe('getAddress', () => {
    it('Should default to a p2pkh address', async () => {
      const p2pkhRegex = /^[1LmnM][a-km-zA-HJ-NP-Z1-9]{25,35}$/
      const p2pkhComputer = new Computer({ chain, network, url, addressType: 'p2pkh' })
      expect(p2pkhRegex.test(p2pkhComputer.getAddress())).eq(true)
      expect(p2pkhRegex.test(computer.getAddress())).eq(true)
    })

    it('Should default to a p2wpkh address', async () => {
      const p2wpkhRegex = /^(?:bc|tb|ltc|tltc|rltc)1q[a-z0-9]{38}$/
      const p2wpkhComputer = new Computer({ chain, network, url, addressType: 'p2wpkh' })
      expect(p2wpkhRegex.test(p2wpkhComputer.getAddress())).eq(true)
    })

    it('Should default to a p2tr address', async () => {
      const p2trRegex = /^(?:bc|tb|ltc|tltc|rltc)1p[a-z0-9]{58}$/
      const p2trComputer = new Computer({ chain, network, url, addressType: 'p2tr' })
      expect(p2trRegex.test(p2trComputer.getAddress())).eq(true)
    })
  })

  describe('getBalance', () => {
    it('Should return the balance', async () => {
      expect(await computer.getBalance()).matchPattern({
        confirmed: (c) => typeof c === 'number',
        unconfirmed: (u) => typeof u === 'number',
        balance: (b) => typeof b === 'number',
      })
    })
  })

  describe('getChain', () => {
    it('Should return the balance', async () => {
      expect(computer.getChain()).eq(chain)
    })
  })

  describe('getMnemonic', () => {
    it('Should return the mnemonic', async () => {
      const mnemonic = 'warm almost lobster swim situate hidden tiger ski whale donate sock number'
      const c = new Computer({ mnemonic })
      expect(c.getMnemonic()).eq(mnemonic)
    })
  })

  describe('getNetwork', () => {
    it('Should return the network', async () => {
      expect(computer.getNetwork()).eq(network)
    })
  })

  describe('getPassphrase', () => {
    it('Should return the default passphrase', async () => {
      expect(computer.getPassphrase()).eq('')
    })

    it('Should return a custom passphrase', async () => {
      const c = new Computer({ passphrase: 'passphrase' })
      expect(c.getPassphrase()).eq('passphrase')
    })
  })

  describe('getPrivateKey', () => {
    it('Should return the private key', async () => {
      expect(typeof computer.getPrivateKey()).eq('string')
    })
  })

  describe('getPublicKey', () => {
    it('Should return the public key', async () => {
      expect(typeof computer.getPublicKey()).eq('string')
    })
  })

  describe('getUtxos', () => {
    it('Should return all UTXOs that do not contain on-chain objects', async () => {
      const computer2 = new Computer({ chain, network, url })
      const txId1 = await computer.send(10000, computer2.getAddress())
      const txId2 = await computer.send(10000, computer2.getAddress())

      const utxos = await computer2.getUtxos()
      expect(new Set(utxos)).deep.eq(new Set([`${txId1}:0`, `${txId2}:0`]))
    })

    it('Should not return UTXOs that contain on-chain objects', async () => {
      const c = await computer.new(C, [])
      const utxos = await computer.getUtxos()
      expect(!utxos.some((item) => item === c._id))
    })
  })

  describe('getVersion', () => {
    it('Should return the version', async () => {
      expect(typeof Computer.getVersion()).eq('string')
    })
  })

  describe('load', () => {
    it('Should load a module', async () => {
      const computer = new Computer({ chain, network, url })
      await computer.faucet(1e8)
      const rev = await computer.deploy(`export ${C}`)
      const { C: Loaded } = await computer.load(rev)
      const trim = (Class) => Class.toString().replace(/\s+/g, '')
      expect(trim(Loaded)).eq(trim(C))
    })
  })

  describe('new', () => {
    it('Should create a new on-chain object', async () => {
      const counter = await computer.new(Counter, [])
      expect(counter).to.matchPattern({
        n: 0,
        _id: (id) => typeof id === 'string',
        _rev: (rev) => typeof rev === 'string',
        _root: (root) => typeof root === 'string',
        _amount: (amount) => typeof amount === 'number',
        _owners: [computer.getPublicKey()],
      })

      await counter.inc()
      expect(counter).to.matchPattern({
        n: 1,
        _id: (id) => typeof id === 'string',
        _rev: (rev) => typeof rev === 'string',
        _root: (root) => typeof root === 'string',
        _amount: (amount) => typeof amount === 'number',
        _owners: [computer.getPublicKey()],
      })
    })
  })

  describe('next', () => {
    it('Should return the next revision', async () => {
      const counter = await computer.new(Counter, [])
      await counter.inc()
      expect(await computer.next(counter._id)).eq(counter._rev)
    })
  })

  describe('prev', () => {
    it('Should return the previous revision', async () => {
      const counter = await computer.new(Counter, [])
      await counter.inc()
      expect(await computer.prev(counter._rev)).eq(counter._id)
    })
  })

  describe('query', () => {
    const publicKey = computer.getPublicKey()
    let counter
    let mod

    before('Before tests for query', async () => {
      mod = await computer.deploy(`export ${Counter}`)
      const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
      counter = effect.res
      await computer.broadcast(tx)
      await counter.inc()
    })

    it('Should return the latest revisions for a public key', async () => {
      const revs = await computer.query({ publicKey })
      expect(revs.includes(counter._rev)).to.be.true
    })

    it('Should return the latest revision for an id', async () => {
      const [rev] = await computer.query({ ids: [counter._id] })
      expect(rev).eq(counter._rev)
    })

    it('Should return the latest revisions for a module specifier', async () => {
      const [rev] = await computer.query({ mod })
      expect(rev).eq(counter._rev)
    })

    it('Should return the latest revisions for multiple parameters', async () => {
      const revs = await computer.query({ publicKey, limit: 1 })
      expect(revs.length).eq(1)
    })
  })

  describe('rpcCall', () => {
    it('Should call getBlockchainInfo', async () => {
      const { result } = await computer.rpcCall('getBlockchainInfo', '')
      expect(result.blocks).a('number')
      expect(result.bestblockhash).a('string')
    })

    it('Should call getRawTransaction', async () => {
      const c = await computer.new(C, [])
      const txId = c._id.slice(0, 64)
      const { result } = await computer.rpcCall('getRawTransaction', `${txId} 1`)
      expect(result.txid).eq(txId)
      expect(result.hex).a('string')
    })

    it('Should call getTxOut', async () => {
      const c = await computer.new(C, [])
      const [txId, outNum] = c._id.split(':')
      const { result } = await computer.rpcCall('getTxOut', `${txId} ${outNum} true`)
      expect(result.scriptPubKey.asm).eq(`1 ${computer.getPublicKey()} 1 OP_CHECKMULTISIG`)
      expect(result).to.matchPattern({
        bestblock: (bestblock) => typeof bestblock === 'string',
        confirmations: 0,
        value: (value) => typeof value === 'number',
        scriptPubKey: {
          asm: `1 ${computer.getPublicKey()} 1 OP_CHECKMULTISIG`,
          hex: (hex) => typeof hex === 'string',
          reqSigs: 1,
          type: 'multisig',
          addresses: (addresses) => Array.isArray(addresses),
        },
        coinbase: false,
      })
    })

    it('Should call generateToAddress', async () => {
      const { balance: balanceBefore } = await computer.getBalance()
      await computer.rpcCall('generateToAddress', `1 ${computer.getAddress()}`)
      const randomAddress = new Computer({ chain, network, url }).getAddress()
      await computer.rpcCall('generatetoaddress', `99 ${randomAddress}`)

      const { balance: balanceAfter } = await computer.getBalance()
      expect(balanceAfter - balanceBefore).to.be.closeTo(50e8, 1e5)
    })
  })

  describe('send', () => {
    it('Should return the previous revision', async () => {
      const txId = await computer.send(1e6, computer.getAddress())
      expect(txId).to.be.a('string')
    })
  })

  describe('sign', () => {
    it('Should sign a transaction', async () => {
      const { tx } = await computer.encode({
        exp: `${C} new ${C.name}()`,
        sign: false,
      })
      await computer.sign(tx)
      await computer.broadcast(tx)
    })
  })

  describe('subscribe', () => {
    it('Should call a callback when an object is updated', async () => {
      const c = await computer.new(Counter, [])
      let eventCount = 0
      const close = await computer.subscribe(c._id, ({ rev, hex }) => {
        expect(typeof rev).eq('string')
        expect(typeof hex).eq('string')
        expect(rev.split(':').length).eq(2)
        eventCount += 1
      })
      await c.inc()
      await c.inc()

      await new Promise<void>((resolve, reject) => {
        let retryCount = 0
        const interval = setInterval(() => {
          retryCount += 1

          if (eventCount === 2) {
            clearInterval(interval)
            resolve()
          }

          if (retryCount > 20) {
            clearInterval(interval)
            close()
            reject(new Error('Missed SSE'))
          }
        }, 200)
      })
      close()
    })
  })

  describe('sync', () => {
    it('Should sync to a counter', async () => {
      // Create on-chain object
      const { tx, effect } = await computer.encode({
        exp: `${Counter} new Counter()`,
      })
      const counter = effect.res as any
      await computer.broadcast(tx)
      const initialCounter = {
        n: 0,
        _id: `${tx.getId()}:0`,
        _rev: `${tx.getId()}:0`,
        _root: `${tx.getId()}:0`,
        _owners: [computer.getPublicKey()],
        _amount: chain === 'LTC' ? 5820 : 582,
      }
      expect(counter).deep.eq(initialCounter)

      // Update on-chain object
      await counter.inc()

      // Sync to initial revision
      expect(await computer.sync(counter._id)).deep.eq(initialCounter)

      // Sync to latest revision
      expect(await computer.sync(counter._rev)).deep.eq(counter)

      const initialTxId = counter._id.slice(0, 64)
      expect(await computer.sync(initialTxId)).deep.eq({
        res: initialCounter,
        env: {},
      })

      const latestTxId = counter._rev.slice(0, 64)
      expect(await computer.sync(latestTxId)).deep.eq({
        res: undefined,
        env: {
          __bc__: counter,
        },
      })
    })
  })
})
