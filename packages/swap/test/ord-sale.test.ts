/* eslint-disable max-classes-per-file */

import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { NFT, TBC721 } from '@bitcoin-computer/TBC721/src/nft'
import dotenv from 'dotenv'
import { OrdSaleHelper } from '../src/ord-sale'
import { Payment, PaymentMock } from '../src/payment'
import { meta } from '../src/utils'
import { Valuable, ValuableMock } from '../src/valuable'

dotenv.config({ path: '../../.env' })

const url = process.env.BCN_URL

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

describe('Ord Sale', () => {
  let tx: any
  let sellerPublicKey: string
  const nftPrice = 1e8
  const fee = 1e6

  describe('Example from docs', () => {
    const alice = new Computer(RLTC)
    const bob = new Computer(RLTC)

    before('Before sale example from docs', async () => {
      await alice.faucet(1e8)
      await bob.faucet(1e8)
    })

    it('Should work', async () => {
      // Alice creates helper objects
      const tbc721A = new TBC721(alice)
      const saleHelperA = new OrdSaleHelper(alice)

      // Alice deploys the smart contracts
      await tbc721A.deploy()
      await saleHelperA.deploy()

      // Alice mints an NFT
      const nftA = await tbc721A.mint('a', 'AAA')

      // Alice creates a payment mock
      const paymentMock = new PaymentMock(alice.getPublicKey(), nftPrice)
      const b1Mock = new ValuableMock()
      const b2Mock = new ValuableMock()

      // Alice creates a swap transaction
      const { tx: saleTx } = await saleHelperA.createSaleTx(b1Mock, b2Mock, nftA, paymentMock)

      // Bob checks the swap transaction
      OrdSaleHelper.checkSaleTx()

      // Bob creates the payment and finalizes the transaction
      const payment = await bob.new(Payment, [bob.getPublicKey(), nftPrice])
      const b1 = await bob.new(Valuable, [])
      const b2 = await bob.new(Valuable, [])
      const finalTx = OrdSaleHelper.finalizeSaleTx(saleTx, b1, b2, payment, bob.toScriptPubKey())

      // Bob signs an broadcasts the transaction to execute the swap
      await bob.fund(finalTx)
      await bob.sign(finalTx)
      await bob.broadcast(finalTx)

      // Bob reads the updated state from the blockchain
      const { env } = (await bob.sync(finalTx.getId())) as { env: { nft: NFT; payment: NFT } }
      const { nft: n, payment: p } = env

      expect(p._amount).eq(nftPrice)
      expect(n._owners).deep.eq([bob.getPublicKey()])
      expect(p._owners).deep.eq([alice.getPublicKey()])
    })
  })

  describe('Creating an NFT and an offer to sell', () => {
    let nft: NFT
    const seller = new Computer({ url })
    sellerPublicKey = seller.getPublicKey()
    const saleHelper = new OrdSaleHelper(seller)

    it('Seller deploys the smart contract', async () => {
      await seller.faucet(2e8)
      await saleHelper.deploy()
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
    const buyer = new Computer({ url })
    const computer = new Computer({ url })
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
      tx = OrdSaleHelper.finalizeSaleTx(tx, b1, b2, payment, buyer.toScriptPubKey())
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
