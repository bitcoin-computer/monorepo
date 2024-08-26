/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import { NFT, TBC721 } from '@bitcoin-computer/TBC721/src/nft'
import dotenv from 'dotenv'
import { Sale, SaleHelper } from '../src/sale'
import { Payment, PaymentMock } from '../src/payment'
import { meta } from '../src/utils'

dotenv.config({ path: '../../.env' })

const url = process.env.BCN_URL
const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const sleep = async (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

describe('Sale', () => {
  let tx: Transaction
  let txClone: Transaction
  let sellerPublicKey: string
  const nftPrice = 1e8
  const fee = 100000

  describe('Examples from docs', () => {
    it('Should work without helper classes', async () => {
      // Create and fund wallets
      const seller = new Computer({ url })
      const buyer = new Computer({ url })
      await seller.faucet(1e8)
      await buyer.faucet(2e8)

      // Seller mints an NFT
      const nft = await seller.new(NFT, ['name', 'artist', 'URL'])

      // Seller creates a mock for the eventual payment
      const mock = new PaymentMock(nftPrice)

      // Seller creates partially signed swap as a sale offer
      const { tx: saleTx } = await seller.encode({
        exp: `${Sale} Sale.exec(nft, payment)`,
        env: { nft: nft._rev, payment: mock._rev },
        mocks: { payment: mock },
        // eslint-disable-next-line no-bitwise
        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 0,
        fund: false
      })

      // Buyer creates a payment object with the asking price
      const payment = await buyer.new(Payment, [1e8])
      const [paymentTxId, paymentIndex] = payment._rev.split(':')

      // Buyer set's the payment object as the second input of the swap tx
      saleTx.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })

      // Buyer updates the second output of the swap tx to receive the NFT
      saleTx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey() })

      // Buyer funds, signs, and broadcasts to execute the sale
      await buyer.fund(saleTx)
      await buyer.sign(saleTx)
      await buyer.broadcast(saleTx)
      const { env } = (await buyer.sync(saleTx.getId())) as { env: { nft: NFT; payment: NFT } }
      const { nft: n, payment: p } = env

      expect(p._amount).eq(1e8)
      expect(n._owners).deep.eq([buyer.getPublicKey()])
      expect(p._owners).deep.eq([seller.getPublicKey()])
    })

    it('Should work with helper classes', async () => {
      // Create and fund wallets
      const alice = new Computer({ url })
      const bob = new Computer({ url })
      await alice.faucet(1e5)
      await bob.faucet(nftPrice + 1e5)

      // Alice creates helper objects
      const tbc721A = new TBC721(alice)
      const saleHelperA = new SaleHelper(alice)

      // Alice deploys the smart contracts
      await tbc721A.deploy()
      const saleSpecMod = await saleHelperA.deploy()
      const saleHelperB = new SaleHelper(bob, saleSpecMod)

      // Alice mints an NFT
      const nftA = await tbc721A.mint('a', 'AAA', 'URL')

      // Alice creates a payment mock
      const mock = new PaymentMock(nftPrice)

      // Alice creates a swap transaction
      const { tx: saleTx } = await saleHelperA.createSaleTx(nftA, mock)

      // Bob checks the swap transaction
      expect(await saleHelperB.checkSaleTx(saleTx)).eq(nftPrice)

      // Bob creates the payment and finalizes the transaction
      const payment = await bob.new(Payment, [nftPrice])
      const finalTx = SaleHelper.finalizeSaleTx(saleTx, payment, bob.toScriptPubKey())

      // Bob signs an broadcasts the transaction to execute the swap
      await bob.fund(finalTx)
      await bob.sign(finalTx)
      await bob.broadcast(finalTx)
      await sleep(3000)

      // Bob reads the updated state from the blockchain
      const { env } = (await bob.sync(finalTx.getId())) as { env: { o: any; p: Payment } }
      const { o, p } = env

      expect(p._amount).eq(nftPrice)
      expect(o._owners).deep.eq([bob.getPublicKey()])
      expect(p._owners).deep.eq([alice.getPublicKey()])

      // Alice withdraws her payment object
      const { tx: alicePaymentTx } = await alice.encode({
        exp: `alicePayment.setAmount(7860)`,
        env: { alicePayment: p._rev }
      })

      expect(await alice.broadcast(alicePaymentTx)).a('string')
      expect((await alice.getBalance()).balance).gte(1e8)
    })
  })

  describe('Creating an NFT and an offer to sell', () => {
    let nft: NFT
    const seller = new Computer({ url })
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
      nft = await seller.new(NFT, ['name', 'artist', 'URL'])
      // @ts-ignore
      expect(nft).to.matchPattern({ name: 'name', artist: 'artist', url: 'URL', ...meta })
    })

    it('Seller creates a swap transaction for the NFT with the desired price', async () => {
      const mock = new PaymentMock(nftPrice)
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
    const thief = new Computer({ url })
    let tooLowPayment: Payment

    before("Fund Thief's wallet", async () => {
      await thief.faucet(nftPrice + fee)
    })

    it('Thief creates a payment object with half the asking price', async () => {
      tooLowPayment = await thief.new(Payment, [nftPrice / 2])

      // @ts-ignore
      expect(tooLowPayment).matchPattern({
        _id: _.isString,
        _rev: _.isString,
        _root: _.isString,
        _owners: [thief.getPublicKey()],
        _amount: nftPrice / 2
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
            'mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)'
          )
      }
    })
  })

  describe('Executing the sale', () => {
    const buyer = new Computer({ url })
    const computer = new Computer({ url })
    let payment: Payment
    let txId: string

    before("Fund Buyers's wallet", async () => {
      await buyer.faucet(nftPrice + fee)
    })

    it('Buyer creates a payment object', async () => {
      payment = await buyer.new(Payment, [nftPrice])

      // @ts-ignore
      expect(payment).matchPattern({
        _id: _.isString,
        _rev: _.isString,
        _root: _.isString,
        _owners: [buyer.getPublicKey()],
        _amount: nftPrice
      })
    })

    it("Buyer update's the swap transaction to receive the NFT", () => {
      tx = SaleHelper.finalizeSaleTx(tx, payment, buyer.toScriptPubKey())
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
      expect(env.p._owners).deep.eq([sellerPublicKey])
    })

    it('Buyer now owns the nft', async () => {
      const { env } = (await computer.sync(txId)) as any
      expect(env.o._owners).deep.eq([buyer.getPublicKey()])
    })
  })
})
