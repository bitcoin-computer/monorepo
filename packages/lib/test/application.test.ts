import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer, Transaction, Mock, SmartContract, TxIdString } from '@bitcoin-computer/lib'
import { chain, network, url, expect } from './utils/index.js'
import type { Contract } from '@bitcoin-computer/lib/contract-env'
declare const Contract: Contract

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const randomPublicKey = '023e21361b53bb2e625cc1f41d18b35ae882e88d8d107df1c3711fa8bc54db8fed'
const symbol = ''

const meta = {
  _id: _.isString,
  _rev: _.isString,
  _root: _.isString,
  _owners: _.isArray,
  _satoshis: (x: number) => typeof x === 'bigint',
}

class NFT extends Contract {
  name: string
  symbol: string
  _id: string
  _rev: string
  _root: string
  _owners: string[]

  constructor(publicKey: string, name = '', symbol = '') {
    super({ _owners: [publicKey], name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

class Token extends Contract {
  _id: string
  _rev: string
  _root: string
  supply: bigint
  totalSupply: bigint
  _owners: string[]

  constructor(to: string, supply: bigint, totalSupply: bigint) {
    super({ supply, totalSupply, _owners: [to] })
  }

  transfer(amount: bigint, recipient: string) {
    if (this.supply < amount) throw new Error()
    this.supply -= amount
    return new Token(recipient, amount, this.totalSupply)
  }
}

class Chat extends Contract {
  _id: string
  _rev: string
  _root: string
  messages: string[]
  _owners: string[]
  _readers: string[]

  constructor(publicKeys: string[]) {
    super({ messages: [], _owners: publicKeys, _readers: publicKeys })
  }

  post(message: string) {
    this.messages.push(message)
  }

  remove(publicKey: string) {
    this._readers = this._readers.filter((o) => o !== publicKey)
  }
}

class Swap extends Contract {
  static exec(nftA: NFT, nftB: NFT) {
    const [ownerA] = nftA._owners
    const [ownerB] = nftB._owners
    nftA.transfer(ownerB)
    nftB.transfer(ownerA)
    return [nftB, nftA]
  }
}

class PaymentMock extends Mock {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]

  constructor(amount: bigint) {
    super()
    this._owners = [randomPublicKey]
    this._satoshis = amount
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

class Payment extends Contract {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]

  constructor(_satoshis: bigint) {
    super({ _satoshis })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

describe('Computer', () => {
  it('Should default to public LTC regtest node', async () => {
    const computer = new Computer({ chain, network, url })
    expect(computer.getChain()).eq('LTC')
    expect(computer.getNetwork()).eq('regtest')
    expect(computer.getUrl()).a('string')
  })

  it('Should instantiate a computer object', async () => {
    const chain = 'BTC'
    const network = 'mainnet'
    const mode = 'prod'
    const url = 'https://btc.node.bitcoincomputer.io'
    const computer = new Computer({ chain, network, url, mode })
    expect(computer.getChain()).eq(chain)
    expect(computer.getNetwork()).eq(network)
    expect(computer.getUrl()).eq(url)
  })
})

describe('Non-Fungible Token (NFT)', () => {
  let nft: NFT
  let initialId: string
  let initialRev: string
  let initialRoot: string
  let sender = new Computer({ chain, network, url })
  let receiver = new Computer({ chain, network, url })

  before("Fund sender's wallet", async () => {
    await sender.faucet(1e8)
  })

  describe('Minting an NFT', () => {
    before(async () => {
      nft = await sender.new(NFT, [sender.getPublicKey(), 'Test'])
      initialId = nft._id
      initialRev = nft._rev
      initialRoot = nft._root
    })

    it('Sender mints an NFT', async () => {
      expect(nft).matchPattern({ name: 'Test', symbol, ...meta })
    })

    it('Property _owners is a singleton array with minters public key', () => {
      expect(nft._owners).deep.eq([sender.getPublicKey()])
    })

    it('Properties _id, _rev, and _root have the same value', () => {
      expect(nft._id).eq(nft._rev).eq(nft._root)
    })

    it("The nft is returned when syncing against it's revision", async () => {
      expect(await sender.sync(nft._rev)).deep.eq(nft)
    })
  })

  describe('Transferring an NFT', () => {
    before(async () => {
      nft = await sender.new(NFT, [sender.getPublicKey(), 'Test'])
      initialId = nft._id
      initialRev = nft._rev
      initialRoot = nft._root
      await nft.transfer(receiver.getPublicKey())
    })

    it('Sender transfers the NFT to receiver', async () => {
      expect(nft).to.matchPattern({ name: 'Test', symbol, ...meta })
    })

    it('The id does not change', () => {
      expect(initialId).eq(nft._id)
    })

    it('The revision is updated', () => {
      expect(initialRev).not.eq(nft._rev)
    })

    it('The root does not change', () => {
      expect(initialRoot).eq(nft._root)
    })

    it("The _owners are updated to receiver's public key", () => {
      expect(nft._owners).deep.eq([receiver.getPublicKey()])
    })

    it("Syncing to the NFT's revision returns an object that is equal to the NFT", async () => {
      expect(await receiver.sync(nft._rev)).deep.eq(nft)
    })
  })
})

describe('Fungible Token', () => {
  let token: SmartContract<typeof Token>
  let sentToken: SmartContract<typeof Token>
  let initialId: string
  let initialRev: string
  let initialRoot: string
  let sender = new Computer({ chain, network, url })
  let receiver = new Computer({ chain, network, url })

  before('Fund senders wallet', async () => {
    await sender.faucet(1e8)
  })

  describe('Minting a fungible token', () => {
    before(async () => {
      token = await sender.new(Token, [sender.getPublicKey(), 10n, 10n])
      initialId = token._id
      initialRev = token._rev
      initialRoot = token._root
    })

    it('Sender mints a fungible token with supply 10', () => {
      expect(token).to.matchPattern({ ...meta, supply: 10n, totalSupply: 10n })
    })

    it('Property _owners is a singleton array with minters public key', () => {
      expect(token._owners).deep.eq([sender.getPublicKey()])
    })

    it('Properties _id, _rev, and _root have the same value', () => {
      expect(token._id).eq(token._rev).eq(token._root)
    })

    it("Syncing to the token's revision returns an object equal to the token", async () => {
      expect(await sender.sync(token._rev)).deep.eq(token)
    })
  })

  describe('Transferring a fungible token', () => {
    before(async () => {
      token = await sender.new(Token, [sender.getPublicKey(), 10n, 10n])
      sentToken = await token.transfer(2n, receiver.getPublicKey())
    })

    it('This creates a second smart object with supply 2', () => {
      expect(sentToken).to.matchPattern({
        supply: 2n,
        totalSupply: 10n,
        ...meta,
      })
    })

    it('The second smart object is owned by recipient', () => {
      expect(sentToken._owners).deep.eq([receiver.getPublicKey()])
    })

    it('The first smart object now has a supply of 8', () => {
      expect(token).to.matchPattern({ supply: 8n, totalSupply: 10n, ...meta })
    })

    it('The first smart object is still owned by sender', () => {
      expect(token._owners).deep.eq([sender.getPublicKey()])
    })

    it('Both smart objects have the same _root', () => {
      expect(sentToken._root).eq(token._root)
    })

    it('If Sender mints another token it will have a different root', async () => {
      const fakeToken = await sender.new(Token, [sender.getPublicKey(), 10n, 10n])
      expect(fakeToken._root).not.eq(token._root)
      expect(fakeToken._root).not.eq(sentToken._root)
    })

    it("Syncing to any smart objects's revision returns an object equal to that smart object", async () => {
      expect(await sender.sync(token._rev)).deep.eq(token)
      expect(await sender.sync(sentToken._rev)).deep.eq(sentToken)
    })
  })
})

describe('Chat', () => {
  const alice = new Computer({ chain, network, url })
  const bob = new Computer({ chain, network, url })
  const eve = new Computer({ chain, network, url })
  const publicKeys = [alice.getPublicKey(), bob.getPublicKey()].sort()

  before('Fund alice and bob', async () => {
    await alice.faucet(1e8)
    await bob.faucet(1e8)
  })

  describe('Creating a chat', () => {
    it('Alice creates a chat and invites Bob', async () => {
      const alicesChat = await alice.new(Chat, [publicKeys])
      expect(alicesChat).to.matchPattern({
        messages: [],
        _readers: publicKeys,
        ...meta,
      })
      expect(alicesChat._owners).deep.eq(publicKeys)
    })
  })

  describe('Posting messages and reading', () => {
    let alicesChat: Chat

    before(async () => {
      alicesChat = await alice.new(Chat, [publicKeys])
      await alicesChat.post('Hi')
    })

    it('Alice posts a message to the chat', async () => {
      expect(alicesChat).to.matchPattern({
        messages: ['Hi'],
        _readers: publicKeys,
        ...meta,
      })
    })

    it('Bob can read the content of the chat', async () => {
      const bobsChat = await bob.sync<typeof Chat>(alicesChat._rev)
      expect(bobsChat).matchPattern({
        messages: ['Hi'],
        _readers: publicKeys,
        ...meta,
      })
    })

    it('Bob can write to the chat', async () => {
      const bobsChat = await bob.sync<typeof Chat>(alicesChat._rev)
      await bobsChat.post('Yo')
      expect(bobsChat).matchPattern({
        messages: ['Hi', 'Yo'],
        _readers: publicKeys,
        ...meta,
      })
    })
  })

  describe('Access control', () => {
    let alicesChat: Chat

    before(async () => {
      alicesChat = await alice.new(Chat, [publicKeys])
      await alicesChat.post('Hi')
    })

    it('Eve cannot read the content of the chat', async () => {
      try {
        await eve.sync(alicesChat._rev)
        expect(true).eq(false)
      } catch (err) {
        if (err instanceof Error) expect(err.message).eq('Decryption failure')
      }
    })

    it('Alice removes Bob from the chat', async () => {
      const chatForRemove = await alice.new(Chat, [publicKeys])
      await chatForRemove.post('Hi')
      await chatForRemove.remove(bob.getPublicKey())
      expect(chatForRemove._readers).deep.eq([alice.getPublicKey()])

      try {
        await bob.sync(chatForRemove._rev)
        expect(true).eq(false)
      } catch (err) {
        if (err instanceof Error) expect(err.message).eq('Decryption failure')
      }
    })
  })
})

describe('Swap', () => {
  const alice = new Computer({ chain, network, url })
  const bob = new Computer({ chain, network, url })

  before('Fund alice and bob', async () => {
    await alice.faucet(1e8)
    await bob.faucet(1e8)
  })

  describe('Creating two NFTs to be swapped', () => {
    let nftA: NFT
    let nftB: NFT

    before(async () => {
      nftA = await alice.new(NFT, [alice.getPublicKey(), 'nftA'])
      nftB = await bob.new(NFT, [bob.getPublicKey(), 'nftB'])
    })

    it('Alice creates nftA', async () => {
      expect(nftA).to.matchPattern({ name: 'nftA', symbol, ...meta })
      expect(nftA._owners).deep.eq([alice.getPublicKey()])
    })

    it('Bob creates nftB', async () => {
      expect(nftB).to.matchPattern({ name: 'nftB', symbol, ...meta })
      expect(nftB._owners).deep.eq([bob.getPublicKey()])
    })
  })

  describe('Executing a swap', () => {
    let nftA: NFT
    let nftB: NFT
    let tx: any
    let txId: string

    before(async () => {
      nftA = await alice.new(NFT, [alice.getPublicKey(), 'nftA'])
      nftB = await bob.new(NFT, [bob.getPublicKey(), 'nftB'])
      ;({ tx } = await alice.encode({
        exp: `${Swap} Swap.exec(nftA, nftB)`,
        env: { nftA: nftA._rev, nftB: nftB._rev },
      }))
      await bob.sign(tx)
      txId = await bob.broadcast(tx)
    })

    it('Executes the swap between two participants', async () => {
      expect(txId).not.undefined

      const { env } = await bob.sync(txId as TxIdString)
      const nftASwapped = env.nftA!
      expect(nftASwapped).to.matchPattern({ name: 'nftA', symbol, ...meta })
      expect(nftASwapped._owners).deep.eq([bob.getPublicKey()])

      const { env: env2 } = await alice.sync(txId)
      const nftBSwapped = env2.nftB!
      expect(nftBSwapped).to.matchPattern({ name: 'nftB', symbol, ...meta })
      expect(nftBSwapped._owners).deep.eq([alice.getPublicKey()])
    })
  })
})

describe('Sell', () => {
  const nftPrice = BigInt(1e8)
  const fee = 10000
  let sellerPublicKey: string

  describe('Creating an NFT and an offer to sell', () => {
    let nft: NFT
    let tx: any
    let txClone: any
    const seller = new Computer({ chain, network, url })
    sellerPublicKey = seller.getPublicKey()

    before("Fund Seller's wallet generously", async () => {
      await seller.faucet(5e8)
    })

    before(async () => {
      nft = await seller.new(NFT, [seller.getPublicKey(), 'NFT'])
      const mock = new PaymentMock(nftPrice)
      const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction

      ;({ tx } = await seller.encode({
        exp: `${Swap} Swap.exec(nft, payment)`,
        env: { nft: nft._rev, payment: mock._rev },
        mocks: { payment: mock },
        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 0,
        fund: false,
      }))

      txClone = tx.clone()
    })

    it('Seller creates an NFT', async () => {
      expect(nft).to.matchPattern({ name: 'NFT', symbol, ...meta })
    })

    it('The first inputs has been signed by seller, the second input is unsigned', () => {
      expect(tx.ins).to.have.lengthOf(2)
      expect(tx.ins[0].script).to.have.lengthOf.above(0)
      expect(tx.ins[1].script).to.have.lengthOf(0)
    })

    it("The first output's value is nftPrice, the second is min-non-dust amount", () => {
      expect(tx.outs[0].value).eq(nftPrice)
      expect(tx.outs[1].value).greaterThan(0)
    })
  })

  describe('Failing to steal the nft', () => {
    let txClone: any
    const thief = new Computer({ chain, network, url })
    let tooLowPayment: Payment

    before("Fund Thief's wallet generously", async () => {
      await thief.faucet(5e8)
    })

    before(async () => {
      // Re-create the offer setup for independence
      const seller = new Computer({ chain, network, url })
      await seller.faucet(5e8)

      const nft = await seller.new(NFT, [seller.getPublicKey(), 'NFT'])
      const mock = new PaymentMock(nftPrice)
      const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction

      let txSetup: any
      ;({ tx: txSetup } = await seller.encode({
        exp: `${Swap} Swap.exec(nft, payment)`,
        env: { nft: nft._rev, payment: mock._rev },
        mocks: { payment: mock },
        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 0,
        fund: false,
      }))
      txClone = txSetup.clone()

      tooLowPayment = await thief.new(Payment, [nftPrice / 2n])

      const [paymentTxId, paymentIndex] = tooLowPayment._rev.split(':')
      txClone.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })
      txClone.updateOutput(1, { scriptPubKey: thief.toScriptPubKey() })
      txClone.updateOutput(0, { value: tooLowPayment._satoshis })
    })

    it('Thief creates a payment object with half the asking price', async () => {
      expect(tooLowPayment).matchPattern({
        _id: _.isString,
        _rev: _.isString,
        _root: _.isString,
        _owners: [thief.getPublicKey()],
        _satoshis: nftPrice / 2n,
      })
    })

    it('Thief funds the swap transaction', async () => {
      await thief.fund(txClone)
    })

    it('Thief signs the swap transaction', async () => {
      await thief.sign(txClone)
    })

    it('When Thief broadcast the swap transaction an error is thrown', async () => {
      try {
        await thief.broadcast(txClone)
        expect(true).eq(false)
      } catch (err) {
        if (err instanceof Error)
          expect(err.message).contains(
            'mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
          )
      }
    })
  })

  describe('Executing the sale', () => {
    const buyer = new Computer({ chain, network, url })
    const computer = new Computer({ chain, network, url })
    let payment: Payment
    let tx: any
    let txId: string

    before("Fund Buyer's wallet generously", async () => {
      await buyer.faucet(5e8)
    })

    before(async () => {
      // Re-create the offer setup for independence
      const seller = new Computer({ chain, network, url })
      await seller.faucet(5e8)
      sellerPublicKey = seller.getPublicKey()

      const nft = await seller.new(NFT, [seller.getPublicKey(), 'NFT'])
      const mock = new PaymentMock(nftPrice)
      const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction

      ;({ tx } = await seller.encode({
        exp: `${Swap} Swap.exec(nft, payment)`,
        env: { nft: nft._rev, payment: mock._rev },
        mocks: { payment: mock },
        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 0,
        fund: false,
      }))

      payment = await buyer.new(Payment, [nftPrice])

      const [paymentTxId, paymentIndex] = payment._rev.split(':')
      tx.updateInput(1, {
        txId: paymentTxId,
        index: parseInt(paymentIndex, 10),
      })
      tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey() })

      await buyer.fund(tx)
      await buyer.sign(tx)
      txId = await buyer.broadcast(tx)
    })

    it('Executes the sale', async () => {
      expect(txId).not.undefined

      const { env } = (await computer.sync(txId)) as any
      expect(env.payment._owners).deep.eq([sellerPublicKey])

      const { env: env2 } = (await computer.sync(txId)) as any
      expect(env2.nft._owners).deep.eq([buyer.getPublicKey()])
    })
  })
})
