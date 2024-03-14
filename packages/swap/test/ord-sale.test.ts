/* eslint-disable max-classes-per-file */

import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { Transaction } from '@bitcoin-computer/nakamotojs'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { Sale } from '../src/ord-sale'
import { Payment, PaymentMock } from '../src/payment'
import { RLTC, meta } from '../src/utils'
import { Valuable, ValuableMock } from '../src/valuable'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

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
