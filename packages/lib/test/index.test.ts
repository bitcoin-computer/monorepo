import chai, { expect } from 'chai'
// @ts-ignore
import { Computer, Contract } from '@bitcoin-computer/lib'
import chaiMatchPattern from 'chai-match-pattern'
import { Transaction as BTransaction } from '@bitcoin-computer/nakamotojs'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

function getTestTxId(i = 0): string {
  if (i === 0) return '0000000000000000000000000000000000000000000000000000000000000000'
  if (i === 1) return '1111111111111111111111111111111111111111111111111111111111111111'
  if (i === 2) return '2222222222222222222222222222222222222222222222222222222222222222'
  if (i === 3) return '3333333333333333333333333333333333333333333333333333333333333333'
  if (i === 4) return '4444444444444444444444444444444444444444444444444444444444444444'
  if (i === 5) return '5555555555555555555555555555555555555555555555555555555555555555'
  throw new Error('getTestTxId is only defined for parameters smaller than 6.')
}

function getTestRev(txId = 0, outNum = 0): string {
  return `${getTestTxId(txId)}:${outNum}`
}

function getTestAmount(i = 0): number {
  return i === 1 ? 5820 : 7860
}

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
  img: string
  _id: string
  _rev: string
  _root: string
  _owners: string[]

  constructor(publicKey: string, img: string) {
    super({ _owners: [publicKey], img })
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

  transfer(amount: number, to: string) {
    if (this.supply < amount) throw new Error()
    this.supply -= amount
    return new Token(to, amount, this.totalSupply)
  }
}

class Swap extends Contract {
  static exec(nft1: NFT, nft2: NFT) {
    const o1Owner = nft1._owners[0]
    const o2Owner = nft2._owners[0]
    nft1.transfer(o2Owner)
    nft2.transfer(o1Owner)
  }
}

class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor(owner: string) {
    this._id = `mock:${getTestRev()}`
    this._rev = `mock:${getTestRev()}`
    this._root = `mock:${getTestRev()}`
    this._owners = [owner]
    this._amount = getTestAmount()
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
    expect(computer.getUrl()).eq('https://node.bitcoincomputer.io')
    expect(computer.getNetwork()).eq('testnet')
    expect(computer.getChain()).eq('LTC')
  })

  it('Should instantiate a computer object', async () => {
    const computer = new Computer(RLTC)
    expect(computer.getUrl()).eq(RLTC.url)
    expect(computer.getNetwork()).eq(RLTC.network)
    expect(computer.getChain()).eq(RLTC.chain)
  })
})

describe('Non-Fungible Token (NFT)', () => {
  let nft: NFT
  let computer = new Computer(RLTC)

  before('Before', async () => {
    await computer.faucet(0.001e8)
  })

  describe('Should mint an NFT', () => {
    before('Before minting an NFT', async () => {
      nft = await computer.new(NFT, [computer.getPublicKey(), 'Test'])
    })

    it('Should create a smart object', () => {
      // @ts-ignore
      expect(nft).to.matchPattern({ img: 'Test', ...meta })
    })

    it('Should initialize _id, _rev, and _root', () => {
      expect(isLocation(nft._id)).eq(true)
      expect(isLocation(nft._rev)).eq(true)
      expect(isLocation(nft._root)).eq(true)

      expect(nft._id).eq(nft._rev)
      expect(nft._id).eq(nft._root)
    })

    it('Should set the _owners', () => {
      expect(nft._owners).deep.eq([computer.getPublicKey()])
    })
  })


  describe('Should transfer an NFT', async () => {
    before('Before transferring an NFT', async () => {
      await nft.transfer('028df471f7539662dacb98bc409785ebee1c7e1147c6529d1175a2a5c3674699e8')
    })

    it('Should update a smart object', () => {
      // @ts-ignore
      expect(nft).to.matchPattern({ img: 'Test', ...meta })
    })

    it('Should update _rev', () => {
      expect(nft._id).not.eq(nft._rev)
      expect(nft._id).eq(nft._root)
    })

    it('Should update the _owners', () => {
      expect(nft._owners).deep.eq(['028df471f7539662dacb98bc409785ebee1c7e1147c6529d1175a2a5c3674699e8'])
    })
  })
})

describe('Fungible Token', () => {
  let token: Token = null
  let sentToken: Token = null
  let computer = new Computer(RLTC)
  let computer2 = new Computer(RLTC)

  before('Before', async () => {
    await computer.faucet(0.01e8)
  })

  describe('Should mint a fungible token', () => {
    before('Before minting', async () => {
      token = await computer.new(Token, [computer.getPublicKey(), 10, 10])
    })

    it('Should create a smart object', () => {
      // @ts-ignore
      expect(token).to.matchPattern({ ...meta, supply: 10, totalSupply: 10 })
    })

    it('Should initialize _id, _rev, and _root', () => {
      expect(token._id).eq(token._rev)
      expect(token._id).eq(token._root)
    })

    it('Should set the _owners', () => {
      expect(token._owners).deep.eq([computer.getPublicKey()])
    })

    it('Should have a unique _root', async () => {
      const token2: Token = await computer.new(Token, [computer.getPublicKey(), 10, 10])
      expect(token2._root).not.eq(token._root)
    })
  })


  describe('Should transfer a token', async () => {
    before('Before transferring a token', async () => {
      sentToken = await token.transfer(2, computer2.getPublicKey())
    })

    it('Should update the token and return a new token with transferred supply', () => {
      // @ts-ignore
      expect(token).to.matchPattern({  supply: 8, totalSupply: 10, ...meta })
      // @ts-ignore
      expect(sentToken).to.matchPattern({ supply: 2, totalSupply: 10, ...meta })
    })

    it('Should update _rev', () => {
      expect(token._id).not.eq(token._rev)
      expect(token._id).eq(token._root)
      expect(token._id).eq(sentToken._root)
      expect(token._id).not.eq(sentToken._rev)
      expect(token._rev).not.eq(sentToken._rev)
    })

    it('Should update the _owners', () => {
      expect(token._owners).deep.eq([computer.getPublicKey()])
      expect(sentToken._owners).deep.eq([computer2.getPublicKey()])
    })

    it('token and token sentToken have the same _root', () => {
      expect(sentToken._root).eq(token._root)
    })
  })
})

describe('Swap', () => {
  let nft1: NFT
  let nft2: NFT
  let nft1After: NFT
  let nft2After: NFT
  let txId: string
  const computer1 = new Computer(RLTC)
  const computer2 = new Computer(RLTC)

  before('Before', async () => {
    await computer1.faucet(0.01e8)
    await computer2.faucet(0.001e8)
  })
  
  describe('Should create two NFTs', () => {
    before('Before creating smart objects for a swap', async () => {
      nft1 = await computer1.new(NFT, [computer1.getPublicKey(), 'NFT1'])
      nft2 = await computer2.new(NFT, [computer2.getPublicKey(), 'NFT2'])
    })

    it('Should create smart objects', () => {
      // @ts-ignore
      expect(nft1).to.matchPattern({ img: 'NFT1', ...meta })
      // @ts-ignore
      expect(nft2).to.matchPattern({ img: 'NFT2', ...meta })
    })

    it('Should initialize the owners', () => {
      expect(nft1._owners).deep.eq([computer1.getPublicKey()])
      expect(nft2._owners).deep.eq([computer2.getPublicKey()])
    })
  })

  describe('Should execute a swap', async () => {
    before('Before executing a swap', async () => {
      const { tx } = await computer1.encode({
        exp: `${Swap} Swap.exec(nft1, nft2)`,
        env: { nft1: nft1._rev, nft2: nft2._rev },
      })
      await computer2.sign(tx)
      txId = await computer2.broadcast(tx)
      expect(txId).not.undefined
      const { env } = await computer1.sync(txId) as { env: { nft1: NFT, nft2: NFT } }
      nft1After = env.nft1
      nft2After = env.nft2
    })

    it('Should update smart objects', () => {
      // @ts-ignore
      expect(nft1After).to.matchPattern({ img: 'NFT1', ...meta })
      // @ts-ignore
      expect(nft2After).to.matchPattern({ img: 'NFT2', ...meta })
    })

    it('Should update the owners', async () => {
      expect(nft1After._owners).deep.eq([computer2.getPublicKey()])
      expect(nft2After._owners).deep.eq([computer1.getPublicKey()])
    })
  })
})

describe('Sell', () => {
  let txId: string
  let nft: NFT
  let payment: Payment
  let mock: PaymentMock
  let tx: any
  const seller = new Computer(RLTC)
  const buyer = new Computer(RLTC)
  const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = BTransaction

  
  before('Before', async () => {
    await seller.faucet(1e7)
    await buyer.faucet(1e7)
  })

  describe('Seller should create an NFT', () => {
    before('Before creating smart objects for a swap', async () => {
      nft = await seller.new(NFT, [seller.getPublicKey(), 'NFT'])
    })

    it('Should create smart objects', () => {
      // @ts-ignore
      expect(nft).to.matchPattern({ img: 'NFT', ...meta })
    })
  })
  
  describe('Seller should create a partially signed Swap transaction', () => {
    before('Before creating smart objects for a swap', async () => {
      mock = new PaymentMock(buyer.getPublicKey())
      ;({ tx } = await seller.encode({
        exp: `${Swap} Swap.exec(nft, payment)`,
        env: { nft: nft._rev, payment: mock._rev },
        mocks: { payment: mock },
        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 0,
        fund: false,
      }))
    })

    it('Should work', () => {
      expect(tx).not.undefined
      expect(tx.ins).to.have.lengthOf(2)
    })
  })

  describe('Buyer should create a payment', () => {
    before('Before creating payment', async () => {
      payment = await buyer.new(Payment, [buyer.getPublicKey()])
    })

    it('Should create a payment object', () => {
      expect(payment).not.undefined
    })
  })

  describe('Buyer should update and broadcast the Swap transaction', () => {
    before('Before broadcasting the Swap transaction', async () => {
      const [paymentTxId, paymentIndex] = payment._id.split(':')
      tx.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })
      tx.updateOutput(1, seller.toScriptPubKey([buyer.getPublicKey()]))

      await buyer.fund(tx)
      await buyer.sign(tx)
      txId = await buyer.broadcast(tx)
    })

    it('Should broadcast a transaction', () => {
      expect(txId).not.undefined
    })
  })
})
