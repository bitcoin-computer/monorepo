import { Computer } from '@bitcoin-computer/lib'
import { payments, script, Transaction } from '@bitcoin-computer/nakamotojs'
import { chain, expect, network, sleep, url } from '../../utils'

describe('getTXOs', () => {
  let computer: Computer

  class Counter extends Contract {
    x: number
    constructor() {
      super({ x: 0 })
    }
    inc() {
      this.x += 1
    }
  }
  class Token extends Contract {
    amount: bigint
    constructor(to: string, amount: bigint) {
      super({ _owners: [to], amount })
    }

    transfer(to: string, amount: bigint): Token {
      if (this.amount >= amount) {
        // Send partial amount in a new object
        this.amount -= amount
        return new Token(to, amount)
      }
      throw new Error('Insufficient funds')
    }
  }

  class Payment extends Contract {
    constructor(_satoshis: bigint) {
      super({ _satoshis })
    }
    transfer(to: string) {
      this._owners = [to]
    }
    setSatoshis(a: bigint) {
      this._satoshis = a
    }
  }

  before('Fund computer', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(2e8)
    const c = await computer.new(Counter, [])
    await c.inc()
  })

  describe('Error handling', () => {
    it('Should throw for an empty query string', async () => {
      let error
      try {
        await computer.getTXOs({})
      } catch (e: any) {
        error = e
      }
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.eq('At least one query parameter must be provided')
    })
    it('Should throw when the query string only includes verbosity', async () => {
      let error
      try {
        await computer.getTXOs({ verbosity: 1 })
      } catch (e: any) {
        error = e
      }
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.eq('At least one query parameter must be provided')
      try {
        await computer.getTXOs({ verbosity: 0 })
      } catch (e: any) {
        error = e
      }
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.eq('At least one query parameter must be provided')
    })
  })
  describe('Get by rev', () => {
    it('Should get TXOs by rev', async () => {
      const c3 = await computer.new(Counter, [])
      const txos = await computer.getTXOs({ rev: c3._rev })
      expect(txos.length).to.eq(1)
      expect(txos[0]).to.eq(c3._rev)

      const txosJson = await computer.getTXOs({ rev: c3._rev, verbosity: 1 })
      expect(txosJson.length).to.eq(1)
      expect(txosJson[0].rev).to.eq(c3._rev)
      expect(txosJson[0].isObject).to.eq(true)
      expect(txosJson[0].satoshis).to.be.a('bigint')
      expect(txosJson[0].asm).to.be.a('string')
    })
  })
  describe('Get by address', () => {
    it('Should get TXOs by address and return an array of strings with the default verbosity', async () => {
      const txos = await computer.getTXOs({ address: computer.getAddress() })
      expect(txos.length).to.be.greaterThan(0)
      txos.forEach((txo) => {
        expect(txo.split(':').length).to.eq(2)
        expect(txo.split(':')[0].length).to.eq(64)
      })
    })

    it('Should  get TXOs by address and return all attributes with verbosity 1', async () => {
      const txos = await computer.getTXOs({ verbosity: 1, address: computer.getAddress() })
      expect(txos.length).to.be.greaterThan(0)
      txos.forEach((txo) => {
        expect(txo.address).to.eq(computer.getAddress())
        expect(txo.satoshis).to.be.a('bigint')
        expect(txo.rev).to.be.a('string')
        expect(txo.asm).to.be.a('string')
        expect(txo.isObject).to.be.a('boolean')
      })
    })

    it('Should get TXOs by address and return unpent txos only with spent=false', async () => {
      const allTxos = await computer.getTXOs({ address: computer.getAddress() })
      const unspentTxos = await computer.getTXOs({
        address: computer.getAddress(),
        isSpent: false,
      })
      unspentTxos.forEach((txo) => {
        expect(allTxos).to.include(txo)
      })
    })

    it('Should get TXOs by address and compute the balance for the computer address', async () => {
      const txos = await computer.getTXOs({
        address: computer.getAddress(),
        isSpent: false,
        verbosity: 1,
      })
      const balance: bigint = txos.reduce((acc: bigint, txo) => {
        return acc + txo.satoshis
      }, 0n)

      const computerBalance = await computer.getBalance()
      expect(balance).to.be.a('bigint')
      expect(balance).to.be.greaterThan(0)
      expect(balance).to.eq(computerBalance.balance)
    })

    it('Should get TXOs by address and omit on chain objects', async () => {
      const c2 = await computer.new(Counter, [])
      const txos = await computer.getTXOs({
        address: computer.getAddress(),
      })
      expect(txos.length).to.be.greaterThan(0)
      // On chain objects do not belong to the address query
      expect(txos).to.not.include(c2._rev)
    })
  })
  describe('Get by satoshis', () => {
    it('Should get TXOs by satoshis amount', async () => {
      const c1 = await computer.new(Payment, [1000000n])
      const satoshis = 2_000_000n
      await c1.setSatoshis(satoshis)

      const txos = await computer.getTXOs({ satoshis })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.not.include(c1._id)
      expect(txos).to.include(c1._rev)
    })
  })
  describe('Get by asm', () => {
    it('Should get TXOs by asm substring', async () => {
      class True extends Contract {
        constructor() {
          super({ _owners: 'OP_TRUE' })
        }
      }
      const c2 = await computer.new(True, [])

      const txos = await computer.getTXOs({ asm: 'OP_TRUE' })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.include(c2._rev)
    })
  })
  describe('Get by mod', () => {
    it('Should get TXOs by mod for creation and object function calls', async () => {
      const m = await computer.deploy('')
      const c4 = await computer.new(Counter, [], m)
      await c4.inc()

      const txos = await computer.getTXOs({ mod: m })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.include(c4._id)
      expect(txos).to.include(c4._rev)
    })

    it('Should get TXOs by mod both for the object direct inheritance abd token transfers', async () => {
      const m = await computer.deploy(`export ${Token}`)
      const t = await computer.new(Token, [computer.getPublicKey(), 100n], m)
      const computer2 = new Computer({ chain, network, url })
      const newToken: Token = await t.transfer(computer2.getPublicKey(), 40n)

      const txos = await computer.getTXOs({ mod: m })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.include(t._id)
      expect(txos).to.include(newToken._rev)
    })

    it('Should get TXOs by mod on token transfers with explicit different mod parameter', async () => {
      const m = await computer.deploy(`export ${Token}`)
      const m1 = await computer.deploy(``) // different mod
      const t = await computer.new(Token, [computer.getPublicKey(), 100n], m)
      const computer2 = new Computer({ chain, network, url })
      const transferTx = await computer.encode({
        exp: `a.transfer('${computer2.getPublicKey()}', 40n)`,
        env: { a: t._rev },
        mod: m1, // explicitly specifying the mod here
      })
      await computer.broadcast(transferTx.tx)

      // sync to the new token
      const newToken = (await computer.sync(`${transferTx.tx.getId()}:0`)) as Token

      const txos = await computer.getTXOs({ mod: m1 })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.not.include(t._id)
      expect(txos).to.include(newToken._rev)
    })
  })
  describe('Get by isObject', () => {
    it('Should get TXOs by isObject key', async () => {
      const computer2 = new Computer({ chain, network, url })
      await computer2.faucet(1e8)
      const c2 = await computer2.new(Counter, [])
      const objectTxos = await computer2.getTXOs({ isObject: true })
      expect(objectTxos.length).to.be.greaterThan(0)
      expect(objectTxos).to.include(c2._rev)

      const nonObjectTxos = await computer2.getTXOs({ isObject: false })
      expect(nonObjectTxos.length).to.be.greaterThan(0)
      expect(nonObjectTxos).to.not.include(c2._rev)

      // It is a good practice to combine isObject with publicKey to narrow down the search
      const objectTxosByPubKey = await computer2.getTXOs({
        isObject: true,
        publicKey: computer2.getPublicKey(),
      })
      expect(objectTxosByPubKey.length).to.be.greaterThan(0)
      expect(objectTxosByPubKey).to.include(c2._rev)

      // Lets spend the on chain object to test isObject filter
      await c2.inc()

      const objectTxosAfterSpend = await computer2.getTXOs({
        isObject: true,
        publicKey: computer2.getPublicKey(),
      })

      expect(objectTxosAfterSpend.length).to.greaterThan(0)
      const spent = objectTxosAfterSpend.filter((txo) => txo === c2._id)
      expect(spent.length).to.eq(1)
      const unspent = objectTxosAfterSpend.filter((txo) => txo === c2._rev)
      expect(unspent.length).to.eq(1)
    })
  })
  describe('Get by previous', () => {
    it('Should get TXOs by previous', async () => {
      const c2 = await computer.new(Counter, [])
      await c2.inc()

      const txos = await computer.getTXOs({ previous: c2._id })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.include(c2._rev)
    })
  })
  describe('Get by exp', () => {
    it('Should get TXOs by exp', async () => {
      class C extends Contract {}

      const exp = `${C} new ${C.name}()`
      const { tx } = await computer.encode({ exp })
      await computer.broadcast(tx)

      const txos = await computer.getTXOs({ exp })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.include(`${tx.getId()}:0`)
    })
  })
  describe('Get by blockHash', () => {
    it('Should get TXOs by blockHash', async () => {
      const c2 = await computer.new(Counter, [])
      const computer2 = new Computer({ chain, network, url })

      // mine a block to confirm the transaction
      const blockHex = await computer.rpc('generateToAddress', `1 ${computer2.getAddress()}`)
      await sleep(1500)
      const txos = await computer.getTXOs({ blockHash: blockHex.result[0] })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.include(c2._rev)
    })
  })
  describe('Get by blockHeight', () => {
    it('Should get TXOs by blockHeight', async () => {
      const c2 = await computer.new(Counter, [])
      const computer2 = new Computer({ chain, network, url })

      // mine a block to confirm the transaction
      const blockHex = await computer.rpc('generateToAddress', `1 ${computer2.getAddress()}`)
      await sleep(1500)
      const blockInfo = await computer.rpc('getBlock', `${blockHex.result[0]} 1`)
      const txos = await computer.getTXOs({ blockHeight: blockInfo.result.height })
      expect(txos.length).to.be.greaterThan(0)
      expect(txos).to.include(c2._rev)
    })
  })
  describe('Get TXOs by blockIndex', () => {
    it('Should get TXOs by blockIndex', async () => {
      const c2 = await computer.new(Counter, [])
      await c2.inc()
      const computer2 = new Computer({ chain, network, url })

      // mine a block to confirm the transaction
      const blockHex = await computer.rpc('generateToAddress', `1 ${computer2.getAddress()}`)
      await sleep(2500)
      const blockInfo = await computer.rpc('getBlock', `${blockHex.result[0]} 1`)

      // check tx index 0 and 1
      const txosIdx0 = await computer.getTXOs({ blockIndex: 0, blockHash: blockInfo.result.hash })
      expect(txosIdx0.length).to.be.greaterThan(0)
      expect(txosIdx0).to.include(`${blockInfo.result.tx[0]}:0`)
      const txosIdx1 = await computer.getTXOs({ blockIndex: 1, blockHash: blockInfo.result.hash })
      expect(txosIdx1.length).to.be.greaterThan(0)
      expect(txosIdx1).to.include(`${blockInfo.result.tx[1]}:0`)
    })
  })
  describe('Get by publicKey', () => {
    it('Should get TXOs by public key and include on chain objects', async () => {
      const c2 = await computer.new(Counter, [])
      const txos = await computer.getTXOs({ publicKey: computer.getPublicKey() })
      expect(txos.length).to.be.greaterThan(0)
      // On chain objects belong to the computer's public key
      expect(txos).includes(c2._rev)
    })
  })
  describe('Get by isSpent', () => {
    it('Should get TXOs by isSpent key', async () => {
      const c2 = await computer.new(Counter, [])
      await c2.inc()

      const unspentTxos = await computer.getTXOs({
        isSpent: false,
        publicKey: computer.getPublicKey(),
      })
      expect(unspentTxos.length).to.be.greaterThan(0)
      expect(unspentTxos).to.include(c2._rev)
      expect(unspentTxos).to.not.include(c2._id)

      const spentTxos = await computer.getTXOs({
        isSpent: true,
        publicKey: computer.getPublicKey(),
      })
      expect(spentTxos.length).to.be.greaterThan(0)
      expect(spentTxos).to.include(c2._id)
      expect(spentTxos).to.not.include(c2._rev)
    })
  })
  describe('Get by isConfirmed', () => {
    it('Should get TXOs by isConfirmed key', async () => {
      const computer2 = new Computer({ chain, network, url })
      await computer2.faucet(1e8)
      const c2 = await computer2.new(Counter, [])

      const unconfirmedTxos = await computer2.getTXOs({
        isConfirmed: false,
        publicKey: computer2.getPublicKey(),
      })
      expect(unconfirmedTxos.length).to.be.greaterThan(0)
      expect(unconfirmedTxos).to.include(c2._rev)

      // mine a block to confirm the transaction
      await computer2.rpc('generateToAddress', `1 ${computer2.getAddress()}`)
      await sleep(1500)

      const confirmedTxos = await computer2.getTXOs({
        isConfirmed: true,
        publicKey: computer2.getPublicKey(),
      })
      expect(confirmedTxos.length).to.be.greaterThan(0)
      expect(confirmedTxos).to.include(c2._rev)
    })
  })
  describe('Get by limit, offset and order', () => {
    it('Should get TXOs by limit, offset and order', async () => {
      const txoIds: string[] = []
      for (let i = 0; i < 5; i++) {
        const c = await computer.new(Counter, [])
        txoIds.push(c._rev)
      }

      const allTxos = await computer.getTXOs({
        publicKey: computer.getPublicKey(),
        order: 'DESC',
      })
      const limitedTxos = await computer.getTXOs({
        publicKey: computer.getPublicKey(),
        limit: 2,
        offset: 1,
        order: 'DESC',
      })

      expect(limitedTxos.length).to.eq(2)
      expect(limitedTxos[0]).to.eq(allTxos[1])
      expect(limitedTxos[1]).to.eq(allTxos[2])
    })
  })
  describe('Should work with deletions', () => {
    it('Deleted objects should not be included in utxos', async () => {
      const c2 = await computer.new(Counter, [])
      await c2.inc()
      await computer.delete([c2._rev])

      await sleep(500)
      const utxos = await computer.getTXOs({
        publicKey: computer.getPublicKey(),
        isSpent: false,
      })
      expect(utxos.length).to.be.greaterThan(0)
      expect(utxos).to.not.include(c2._rev)
    })
  })
})
