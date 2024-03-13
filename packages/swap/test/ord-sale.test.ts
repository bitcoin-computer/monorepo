/* eslint-disable max-classes-per-file */

import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { Transaction } from '@bitcoin-computer/nakamotojs'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { Sale, Valuable } from '../src/ord-sale'
import { Payment } from '../src/payment'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const randomPublicKey = '023e21361b53bb2e625cc1f41d18b35ae882e88d8d107df1c3711fa8bc54db8fed'

const RLTC: {
  network: 'regtest'
  chain: 'LTC'
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

export function getTestTxId(i = 0): string {
  if (i === 0) return 'mock:0000000000000000000000000000000000000000000000000000000000000000'
  if (i === 1) return 'mock:1111111111111111111111111111111111111111111111111111111111111111'
  if (i === 2) return 'mock:2222222222222222222222222222222222222222222222222222222222222222'
  if (i === 3) return 'mock:3333333333333333333333333333333333333333333333333333333333333333'
  if (i === 4) return 'mock:4444444444444444444444444444444444444444444444444444444444444444'
  if (i === 5) return 'mock:5555555555555555555555555555555555555555555555555555555555555555'
  throw new Error('getTestTxId is only defined for parameters smaller than 6.')
}

export function getTestRev(txId = 0, outNum = 0): string {
  return `${getTestTxId(txId)}:${outNum}`
}

class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor(owner: string, amount: number) {
    const r = Math.floor(Math.random() * 1000)
    this._id = getTestRev(0, r)
    this._rev = getTestRev(0, r)
    this._root = getTestRev(0, r)
    this._owners = [owner]
    this._amount = amount
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

class ValuableMock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor() {
    const r = Math.floor(Math.random() * 100000)
    this._id = getTestRev(1, r)
    this._rev = getTestRev(1, r)
    this._root = getTestRev(1, r)
    this._owners = [randomPublicKey]
    this._amount = 7860
  }

  setAmount(amount: number) {
    this._amount = amount
  }
}

describe('Ord Sale', () => {
  let tx: any
  let sellerPublicKey: string
  const nftPrice = 1e8
  const fee = 1e6

  describe('Creating an NFT and an offer to sell', () => {
    let nft: NFT
    const seller = new Computer(RLTC)
    sellerPublicKey = seller.getPublicKey()

    before("Fund Seller's wallet", async () => {
      await seller.faucet(1e8)
    })

    it('Seller creates an NFT', async () => {
      nft = await seller.new(NFT, ['name', 'symbol'])
      // @ts-ignore
      expect(nft).to.matchPattern({ name: 'name', symbol: 'symbol', ...meta })
    })

    it('Seller creates a swap transaction for the NFT with the desired price', async () => {
      const b1Mock = new ValuableMock()
      const b2Mock = new ValuableMock()
      const paymentMock = new PaymentMock(seller.getPublicKey(), nftPrice)
      const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction

      ;({ tx } = await seller.encode({
        exp: `${Sale} Sale.exec(b1, b2, nft, payment)`,
        env: { b1: b1Mock._rev, b2: b2Mock._rev, nft: nft._rev, payment: paymentMock._rev },
        mocks: { b1: b1Mock, b2: b2Mock, payment: paymentMock },
        // eslint-disable-next-line no-bitwise
        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 2,
        fund: false,
      }))
    })

    it('The third input has been signed by seller, the second input is unsigned', () => {
      expect(tx.ins).to.have.lengthOf(4)
      expect(tx.ins[0].script).to.have.lengthOf(0)
      expect(tx.ins[1].script).to.have.lengthOf(0)
      expect(tx.ins[2].script).to.have.lengthOf.above(0)
      expect(tx.ins[3].script).to.have.lengthOf(0)
    })

    it("The first output's value is nftPrice, the second is min-non-dust amount", () => {
      expect(tx.outs[0].value).eq(7860 * 2)
      expect(tx.outs[1].value).eq(7860)
      expect(tx.outs[2].value).eq(nftPrice)
      expect(tx.outs[3].value).eq(7860)
    })
  })

  describe('Executing the sale', () => {
    const buyer = new Computer(RLTC)
    const computer = new Computer(RLTC)
    let b1: Valuable
    let b2: Valuable
    let payment: Payment
    let txId: string

    before("Fund Buyers's wallet", async () => {
      await buyer.faucet(nftPrice + fee + 1e8)
    })

    it('Buyer creates a payment object', async () => {
      b1 = await buyer.new(Valuable, [])
      b2 = await buyer.new(Valuable, [])
      payment = await buyer.new(Payment, [buyer.getPublicKey(), nftPrice])

      // @ts-ignore
      expect(payment).matchPattern({
        _id: _.isString,
        _rev: _.isString,
        _root: _.isString,
        _owners: [buyer.getPublicKey()],
        _amount: nftPrice,
      })
    })

    it("Buyer update's the swap transaction to receive the NFT", () => {
      const [b1TxId, b1Index] = b1._rev.split(':')
      tx.updateInput(0, {
        txId: b1TxId,
        index: parseInt(b1Index, 10),
      })

      const [b2TxId, b2Index] = b2._rev.split(':')
      tx.updateInput(1, {
        txId: b2TxId,
        index: parseInt(b2Index, 10),
      })

      const [paymentTxId, paymentIndex] = payment._rev.split(':')
      tx.updateInput(3, {
        txId: paymentTxId,
        index: parseInt(paymentIndex, 10),
      })

      tx.updateOutput(0, { scriptPubKey: buyer.toScriptPubKey() })
      tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey() })
      tx.updateOutput(3, { scriptPubKey: buyer.toScriptPubKey() })
    })

    it('Buyer funds the swap transaction', async () => {
      await buyer.fund(tx)
    })

    it('Buyer signs the swap transaction', async () => {
      await buyer.sign(tx)
    })

    it('Buyer broadcast the swap transaction to execute the sale', async () => {
      txId = await buyer.broadcast(tx)
      expect(typeof txId).eq('string')
    })

    it('Seller now owns the payment', async () => {
      const { env } = (await computer.sync(txId)) as any
      expect(env.payment._owners).deep.eq([sellerPublicKey])
    })

    it('Buyer now owns the nft', async () => {
      const { env } = (await computer.sync(txId)) as any
      expect(env.nft._owners).deep.eq([buyer.getPublicKey()])
    })
  })
})
