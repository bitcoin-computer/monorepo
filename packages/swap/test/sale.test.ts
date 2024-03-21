/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { SaleHelper } from '../src/sale'
import { Payment, PaymentMock } from '../src/payment'
import { meta } from '../src/utils'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

describe('Sale', () => {
  let tx: any
  let txClone: any
  let sellerPublicKey: string
  const nftPrice = 0.1e8
  const fee = 100000

  describe('Creating an NFT and an offer to sell', () => {
    let nft: NFT
    const seller = new Computer()
    sellerPublicKey = seller.getPublicKey()
    let saleHelper: SaleHelper

    before("Fund Seller's wallet", async () => {
      await seller.faucet(1e8)
      saleHelper = new SaleHelper(seller)
    })

    it('Seller deploys a sale smart contract', async () => {
      await saleHelper.deploy()
    })

    it('Seller creates an NFT', async () => {
      nft = await seller.new(NFT, ['name', 'symbol'])
      // @ts-ignore
      expect(nft).to.matchPattern({ name: 'name', symbol: 'symbol', ...meta })
    })

    it('Seller creates a swap transaction for the NFT with the desired price', async () => {
      const mock = new PaymentMock(seller.getPublicKey(), nftPrice)
      ;({ tx } = await saleHelper.createSaleTx(nft, mock))
      txClone = tx.clone()
    })

    it('The first inputs has been signed by seller, the second input is unsigned', () => {
      expect(tx.ins).to.have.lengthOf(2)
      expect(tx.ins[0].script).to.have.lengthOf.above(0)
      expect(tx.ins[1].script).to.have.lengthOf(0)
    })

    it("The first output's value is nftPrice, the second is min-non-dust amount", () => {
      expect(tx.outs[0].value).eq(nftPrice)
      expect(tx.outs[1].value).eq(7860)
    })
  })

  describe('Failing to underpay', () => {
    const thief = new Computer()
    let tooLowPayment: Payment

    before("Fund Thief's wallet", async () => {
      await thief.faucet(nftPrice + fee)
    })

    it('Thief creates a payment object with half the asking price', async () => {
      tooLowPayment = await thief.new(Payment, [thief.getPublicKey(), nftPrice / 2])

      // @ts-ignore
      expect(tooLowPayment).matchPattern({
        _id: _.isString,
        _rev: _.isString,
        _root: _.isString,
        _owners: [thief.getPublicKey()],
        _amount: nftPrice / 2,
      })
    })

    it("Thief update's the swap transaction maliciously to receive the NFT at half the price", () => {
      const [paymentTxId, paymentIndex] = tooLowPayment._rev.split(':')
      txClone.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })
      txClone.updateOutput(1, { scriptPubKey: thief.toScriptPubKey() })

      // this is where the thief tries to alter the transaction in order
      // to buy the nft at half the price
      txClone.updateOutput(0, { value: tooLowPayment._amount })
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
          expect(err.message).eq(
            'mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
          )
      }
    })
  })

  describe('Executing the sale', () => {
    const buyer = new Computer()
    const computer = new Computer()
    let saleHelper: SaleHelper
    let payment: Payment
    let txId: string

    before("Fund Buyers's wallet", async () => {
      await buyer.faucet(nftPrice + fee)
      saleHelper = new SaleHelper(buyer)
    })

    it('Buyer creates a payment object', async () => {
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
      tx = saleHelper.finalizeSaleTx(tx, payment, buyer.toScriptPubKey())
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
      const { env } = (await computer.sync(txId)) as any
      expect(env.payment._owners).deep.eq([sellerPublicKey])
    })

    it('Buyer now owns the nft', async () => {
      const { env } = (await computer.sync(txId)) as any
      expect(env.nft._owners).deep.eq([buyer.getPublicKey()])
    })
  })
})
