/* eslint-disable max-classes-per-file */

import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { OrdSaleHelper, Sale } from '../src/ord-sale'
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
    const saleHelper = new OrdSaleHelper(seller)
    
    it('Seller deploys the smart contract', async () => {
      await seller.faucet(2e8)
      saleHelper.deploy()
    })

    it('Seller creates an NFT', async () => {
      await seller.faucet(1e8)
      nft = await seller.new(NFT, ['name', 'symbol'])
      // @ts-ignore
      expect(nft).to.matchPattern({ name: 'name', symbol: 'symbol', ...meta })
    })

    it('Seller creates a swap transaction for the NFT with the desired price', async () => {
      const b1Mock = new ValuableMock()
      const b2Mock = new ValuableMock()
      const paymentMock = new PaymentMock(seller.getPublicKey(), nftPrice)
      ;({ tx } = await saleHelper.createSaleTx(b1Mock, b2Mock, nft, paymentMock))
    })

    it('The third input representing the nft has been signed by seller, the other inputs are unsigned', () => {
      expect(tx.ins).to.have.lengthOf(4)
      expect(tx.ins[0].script).to.have.lengthOf(0) // b1 before
      expect(tx.ins[1].script).to.have.lengthOf(0) // b2 before
      expect(tx.ins[2].script).to.have.lengthOf.above(0) // nft before
      expect(tx.ins[3].script).to.have.lengthOf(0) // payment
    })

    it("The third output's value is nftPrice, the others are according to the _amounts in the returned objects", () => {
      expect(tx.outs[0].value).eq(7860 * 2) // b1 after
      expect(tx.outs[1].value).eq(7860) // t after
      expect(tx.outs[2].value).eq(nftPrice) // p after
      expect(tx.outs[3].value).eq(7860) // b2 after
    })
  })

  describe('Executing the sale', () => {
    const buyer = new Computer(RLTC)
    const computer = new Computer(RLTC)
    let b1: Valuable
    let b2: Valuable
    let payment: Payment
    let txId: string
    let saleHelper = new OrdSaleHelper(buyer)

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
      tx = saleHelper.finalizeSaleTx(tx, b1, b2, payment, buyer.toScriptPubKey())
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
