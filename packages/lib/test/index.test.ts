import chai, { expect } from 'chai'
// @ts-ignore
import { Computer, Contract } from '@bitcoin-computer/lib'
import chaiMatchPattern from 'chai-match-pattern'
import { Transaction as BTransaction } from '@bitcoin-computer/nakamotojs'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const randomPublicKey = '023e21361b53bb2e625cc1f41d18b35ae882e88d8d107df1c3711fa8bc54db8fed'
const randomRev = '0000000000000000000000000000000000000000000000000000000000000000:0'
const mockedRev = `mock:${randomRev}`
const symbol = ''

const isLocation = (string: string): boolean => {
  const [txId, num] = string.split(':')
  const float = parseFloat(num)
  return [64, 65].includes(txId.length) && !Number.isNaN(float) && Number.isFinite(float)
}

const RLTC: {
  network: 'regtest',
  chain: 'LTC',
  url: string
} = {
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
}

const meta = {
  _id: _.isString,
  _rev: _.isString,
  _root: _.isString,
  _owners: _.isArray,
  _amount: _.isNumber,
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
  supply: number
  totalSupply: number
  _owners: string[]

  constructor(to: string, supply: number, totalSupply: number) {
    super({ supply, totalSupply,  _owners: [to] })
  }

  transfer(amount: number, recipient: string) {
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
    super({ messages: [],  _owners: publicKeys, _readers: publicKeys })
  }

  post(message) {
    this.messages.push(message)
  }

  remove(publicKey: string) {
    this._readers = this._readers.filter(o => o !== publicKey)
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

class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor() {
    this._id = mockedRev
    this._rev = mockedRev
    this._root = mockedRev
    this._owners = [randomPublicKey]
    this._amount = 7860
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

class Payment extends Contract {
  _id: string
  _rev: string
  _root: string
  _owners: string[]

  constructor(owner: string) {
    super({ _owners: [owner] })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

describe('Computer', () => {
  it('Should default to LTC testnet', async () => {
    const computer = new Computer()
    expect(computer.getChain()).eq('LTC')
    expect(computer.getNetwork()).eq('testnet')
    expect(computer.getUrl()).eq('https://node.bitcoincomputer.io')
  })

  it('Should instantiate a computer object', async () => {
    const computer = new Computer(RLTC)
    expect(computer.getChain()).eq(RLTC.chain)
    expect(computer.getNetwork()).eq(RLTC.network)
    expect(computer.getUrl()).eq(RLTC.url)
  })
})

describe('Non-Fungible Token (NFT)', () => {
  let nft: NFT
  let initialId: string
  let initialRev: string
  let initialRoot: string
  let sender = new Computer(RLTC)
  let receiver = new Computer(RLTC)
  
  before("Fund sender's wallet", async () => {
    await sender.faucet(0.001e8)
  })

  describe('Minting an NFT', () => {
    it('Sender mints an NFT', async () => {
      nft = await sender.new(NFT, [sender.getPublicKey(), 'Test'])
      // @ts-ignore
      expect(nft).matchPattern({ name: 'Test', symbol, ...meta })
    })

    it('Property _owners is a singleton array with minters public key', () => {
      expect(nft._owners).deep.eq([sender.getPublicKey()])
    })

    it('Properties _id, _rev, and _root have the same value', () => {
      expect(nft._id).eq(nft._rev).eq(nft._root)

      initialId = nft._id
      initialRev = nft._rev
      initialRoot = nft._root
    })

    it("The nft is returned when syncing against it's revision", async () => {
      expect(await sender.sync(nft._rev)).deep.eq(nft)
    })
  })


  describe('Transferring an NFT', async () => {
    it('Sender transfers the NFT to receiver', async () => {
      await nft.transfer(receiver.getPublicKey())
      // @ts-ignore
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
  let token: Token = null
  let sentToken: Token = null
  let initialId: string
  let initialRev: string
  let initialRoot: string
  let sender = new Computer(RLTC)
  let receiver = new Computer(RLTC)

  before('Fund senders wallet', async () => {
    await sender.faucet(0.01e8)
  })

  describe('Minting a fungible token', () => {
    it('Sender mints a fungible token with supply 10', async () => {
      token = await sender.new(Token, [sender.getPublicKey(), 10, 10])
    })

    it('This creates a smart object', () => {
      // @ts-ignore
      expect(token).to.matchPattern({ ...meta, supply: 10, totalSupply: 10 })
    })

    it('Property _owners is a singleton array with minters public key', () => {
      expect(token._owners).deep.eq([sender.getPublicKey()])
    })

    it('Properties _id, _rev, and _root have the same value', () => {
      expect(token._id).eq(token._rev).eq(token._root)

      initialId = token._id
      initialRev = token._rev
      initialRoot = token._root
    })

    it("Syncing to the token's revision returns an object equal to the token", async () => {
      expect(await sender.sync(token._rev)).deep.eq(token)
    })
  })

  describe('Transferring a fungible token', async () => {
    it('Sender transfers 2 tokens to receiver', async () => {
      sentToken = await token.transfer(2, receiver.getPublicKey())
    })

    it('This creates a second smart object with supply 2', () => {
      // @ts-ignore
      expect(sentToken).to.matchPattern({ supply: 2, totalSupply: 10, ...meta })
    })

    it('The second smart object is owned by recipient', () => {
      expect(sentToken._owners).deep.eq([receiver.getPublicKey()])
    })

    it('The first smart object now has a supply of 8', () => {
      // @ts-ignore
      expect(token).to.matchPattern({ supply: 8, totalSupply: 10, ...meta })
    })

    it('The first smart object is still owned by sender', () => {
      expect(token._owners).deep.eq([sender.getPublicKey()])
    })

    it('Both smart objects have the same _root', () => {
      expect(sentToken._root).eq(token._root)
    })

    it('If Sender mints another token it will have a different root', async () => {
      const fakeToken = await sender.new(Token, [sender.getPublicKey(), 10, 10])
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
  let alicesChat: Chat
  let bobsChat: Chat
  const alice = new Computer(RLTC)
  const bob = new Computer(RLTC)
  const eve = new Computer(RLTC)
  const publicKeys = [alice.getPublicKey(), bob.getPublicKey()].sort()

  before('Before', async () => {
    await alice.faucet(0.01e8)
    await bob.faucet(0.01e8)
  })

  describe('Creating a chat', () => {
    it("Alice creates a chat and invites Bob", async () => {
      alicesChat = await alice.new(Chat, [publicKeys])
      // @ts-ignore
      expect(alicesChat).to.matchPattern({ messages: [], _readers: publicKeys, ...meta })
      expect(alicesChat._owners).deep.eq(publicKeys)
    })
  })

  describe('Posting a message', () => {
    it('Alice posts a message to the chat', async () => {
      await alicesChat.post('Hi')
      // @ts-ignore
      expect(alicesChat).to.matchPattern({ messages: ['Hi'], _readers: publicKeys, ...meta })
    })
  })

  describe('Invited users can read the chat and post messages', async () => {
    it('Bob can read the content of the chat', async () => {
      bobsChat = await bob.sync(alicesChat._rev) as Chat
      // @ts-ignore
      expect(bobsChat).matchPattern({ messages: ['Hi'], _readers: publicKeys, ...meta })
    })

    it('Bob can write to the chat', async () => {
      await bobsChat.post('Yo')
      // @ts-ignore
      expect(bobsChat).matchPattern({ messages: ['Hi', 'Yo'], _readers: publicKeys, ...meta })
    })
  })

  describe('User that are not invited cannot read the state or post', async () => {
    it('Eve cannot read the content of the chat', async () => {
      try {
        await eve.sync(alicesChat._rev)
        expect(true).eq(false)
      } catch(err) {
        expect(err.message).eq("Cannot read properties of null (reading 'exp')")
      }
    })
  })

  describe('Users can be removed from the chat', () => {
    it('Alice removes Bob from the chat', async () => {
      await alicesChat.remove(bob.getPublicKey())
      expect(alicesChat._readers).deep.eq([alice.getPublicKey()])
    })

    it('Bob cannot read the chat or post to it anymore', async () => {
      try {
        await bob.sync(alicesChat._rev)
        expect(true).eq(false)
      } catch(err) {
        expect(err.message).eq("Cannot read properties of null (reading 'exp')")
      }
    })
  })
})

describe('Swap', () => {
  let nftA: NFT
  let nftB: NFT
  const alice = new Computer(RLTC)
  const bob = new Computer(RLTC)

  before('Before', async () => {
    await alice.faucet(0.01e8)
    await bob.faucet(0.001e8)
  })
  
  describe('Creating two NFTs to be swapped', () => {
    it("Alice creates nftA", async () => {
      nftA = await alice.new(NFT, [alice.getPublicKey(), 'nftA'])
      // @ts-ignore
      expect(nftA).to.matchPattern({ name: 'nftA', symbol, ...meta })
      expect(nftA._owners).deep.eq([alice.getPublicKey()])
    })

    it("Bob creates nftB", async () => {
      nftB = await bob.new(NFT, [bob.getPublicKey(), 'nftB'])
      // @ts-ignore
      expect(nftB).to.matchPattern({ name: 'nftB', symbol, ...meta })
      expect(nftB._owners).deep.eq([bob.getPublicKey()])
    })
  })

  describe('Executing a swap', async () => {
    let tx: any
    let txId: string

    it('Alice builds, funds, and signs a swap transaction', async () => {
      ;({ tx } = await alice.encode({
        exp: `${Swap} Swap.exec(nftA, nftB)`,
        env: { nftA: nftA._rev, nftB: nftB._rev },
      }))
    })

    it('Bob signs the swap transaction', async () => {
      await bob.sign(tx)
    })

    it('Bob broadcasts the swap transaction', async () => {
      txId = await bob.broadcast(tx)
      expect(txId).not.undefined
    })

    it('nftA is now owned by Bob', async () => {
      const { env } = await bob.sync(txId) as { env: { nftA: NFT, nftB: NFT } }
      const nftASwapped = env.nftA
      // @ts-ignore
      expect(nftASwapped).to.matchPattern({ name: 'nftA', symbol, ...meta })
      expect(nftASwapped._owners).deep.eq([bob.getPublicKey()])
    })

    it('nftB is now owned by Alice', async () => {
      const { env } = await alice.sync(txId) as { env: { nftA: NFT, nftB: NFT } }
      const nftBSwapped = env.nftB
      // @ts-ignore
      expect(nftBSwapped).to.matchPattern({ name: 'nftB', symbol, ...meta })
      expect(nftBSwapped._owners).deep.eq([alice.getPublicKey()])
    })
  })
})

describe('Sell', () => {
  let tx: any
  let sellerPublicKey: string
  
  describe('Creating an NFT and an offer to sell', () => {
    let nft: NFT
    const seller = new Computer(RLTC)
    sellerPublicKey = seller.getPublicKey()
    
    before("Fund Seller's wallet", async () => {
      await seller.faucet(1e7)
    })
    
    it('Seller creates an NFT', async () => {
      nft = await seller.new(NFT, [seller.getPublicKey(), 'NFT'])
      // @ts-ignore
      expect(nft).to.matchPattern({ name: 'NFT', symbol, ...meta })
    })

    it('Seller creates a swap transaction for the NFT with the desired price', async () => {
      const mock = new PaymentMock()
      const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = BTransaction

      ;({ tx } = await seller.encode({
        exp: `${Swap} Swap.exec(nft, payment)`,
        env: { nft: nft._rev, payment: mock._rev },
        mocks: { payment: mock },
        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 0,
        fund: false,
      }))
    })

    it('The first inputs has been signed by seller, the second input is unsigned', () => {
      expect(tx.ins).to.have.lengthOf(2)
      expect(tx.ins[0].script).to.have.lengthOf.above(0)
      expect(tx.ins[1].script).to.have.lengthOf(0)
    })
  })

  describe('Executing the sale', () => {
    const buyer = new Computer(RLTC)
    const computer = new Computer(RLTC)
    let payment: Payment
    let txId: string

    before("Fund Buyers's wallet", async () => {
      await buyer.faucet(0.1e8)
    })

    it('Buyer creates a payment object', async () => {
      payment = await buyer.new(Payment, [buyer.getPublicKey()])

      // @ts-ignore
      expect(payment).matchPattern({
        _id: _.isString,
        _rev: _.isString,
        _root: _.isString,
        _owners: [buyer.getPublicKey()],
        _amount: 7860,
      })
    })

    it("Buyer update's the swap transaction to receive the NFT", () => {
      const [paymentTxId, paymentIndex] = payment._rev.split(':')
      tx.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })
      // @ts-ignore
      tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey()})
    })

    it('Buyer funds the swap transaction', async () => {
      await buyer.fund(tx)
    })

    it('Buyer signs the swap transaction', async () => {
      await buyer.sign(tx)
    })

    it('Buyer broadcast the swap transaction to execute the sale', async () => {
      txId = await buyer.broadcast(tx)
      expect(txId).not.undefined
    })

    it('Seller now owns the payment', async () => {
      const { env } = await computer.sync(txId) as any
      expect(env.payment._owners).deep.eq([sellerPublicKey])
    })

    it('Seller should get the payment and buyer should get the nft', async () => {
      const { env } = await computer.sync(txId) as any
      expect(env.nft._owners).deep.eq([buyer.getPublicKey()])
    })
  })
})
