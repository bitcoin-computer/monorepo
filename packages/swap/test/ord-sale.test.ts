import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import { NFT, NftHelper } from '@bitcoin-computer/TBC721'
import dotenv from 'dotenv'
import { OrdSale, OrdSaleHelper } from '../src/ord-sale.js'
import { Payment, PaymentMock } from '../src/payment.js'
import { meta } from '../src/utils/index.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

let mockSatoshis = 7860n
if (chain !== 'BTC' && chain !== 'LTC') mockSatoshis *= 10n

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

describe('Ord Sale', () => {
  const nftPrice = BigInt(1e8)

  describe('Examples from docs', () => {
    it('Should work without helper classes', async () => {
      // Create and fund wallets
      const seller = new Computer({ url, chain, network })
      const buyer = new Computer({ url, chain, network })
      await seller.faucet(1e8)
      await buyer.faucet(11e8)

      // Seller creates a special output that contains the ordinal
      const txId = await seller.send(BigInt(1e4), seller.getAddress())
      const ordinalRev = `${txId}:0`

      // Seller mints an NFT
      const { effect, tx: mintTx } = await seller.encode({
        // ensure that the first output of tx with txId is the first input
        include: [ordinalRev],

        // Creates output that contains on-chain object and ordinal
        exp: `${NFT} new NFT('name', 'artist', 'url')`,
      })
      await seller.broadcast(mintTx)
      const nft = effect.res as any

      // Verify that the first input of mintTx is ordinalRev
      expect(mintTx.inputs[0]).eq(ordinalRev)

      // Seller creates partially signed swap as a sale offer
      const paymentMock = new PaymentMock(BigInt(mockSatoshis))
      const b1Mock = new PaymentMock(BigInt(mockSatoshis))
      const b2Mock = new PaymentMock(BigInt(mockSatoshis))

      const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction
      const { tx } = await seller.encode({
        exp: `${OrdSale} OrdSale.exec(b1, b2, nft, payment)`,
        env: {
          b1: b1Mock._rev as string,
          b2: b2Mock._rev as string,
          nft: nft._rev,
          payment: paymentMock._rev as string,
        },
        mocks: { b1: b1Mock, b2: b2Mock, payment: paymentMock },

        sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
        inputIndex: 2,
        fund: false,
      })

      // Buyer creates a payment object with the asking price
      const payment = await buyer.new(Payment, [BigInt(1e8)])
      const b1 = await buyer.new(Payment, [mockSatoshis])
      const b2 = await buyer.new(Payment, [mockSatoshis])

      const [b1TxId, b1Index] = (b1._rev as string).split(':')
      tx.updateInput(0, { txId: b1TxId, index: parseInt(b1Index, 10) })

      const [b2TxId, b2Index] = (b2._rev as string).split(':')
      tx.updateInput(1, { txId: b2TxId, index: parseInt(b2Index, 10) })

      const [paymentTxId, paymentIndex] = (payment._rev as string).split(':')
      tx.updateInput(3, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })

      const scriptPubKey = seller.toScriptPubKey()

      tx.updateOutput(0, { scriptPubKey })
      tx.updateOutput(1, { scriptPubKey })
      tx.updateOutput(3, { scriptPubKey })

      // Buyer funds, signs, and broadcasts to execute the sale
      await buyer.fund(tx)
      await buyer.sign(tx)
      await buyer.broadcast(tx)
    })

    it('Should work with helper classes', async () => {
      // Create and fund wallets
      const alice = new Computer({ url, chain, network })
      const bob = new Computer({ url, chain, network })
      await alice.faucet(1e8)
      await bob.faucet(11e8)

      // Alice creates helper objects
      const nftHelper = new NftHelper(alice)
      const saleHelperA = new OrdSaleHelper(alice)

      // Alice deploys the smart contracts
      await nftHelper.deploy()
      await saleHelperA.deploy()

      // Alice mints an NFT
      const nftA = await nftHelper.mint('a', 'AAA', 'URL')

      // Alice creates a payment mock
      const paymentMock = new PaymentMock(BigInt(nftPrice))
      const b1Mock = new PaymentMock(BigInt(mockSatoshis))
      const b2Mock = new PaymentMock(BigInt(mockSatoshis))

      // Alice creates a swap transaction
      const { tx } = await saleHelperA.createSaleTx(b1Mock, b2Mock, nftA, paymentMock)

      // Bob checks the swap transaction
      OrdSaleHelper.checkSaleTx()

      // Bob creates the payment and finalizes the transaction
      const payment = await bob.new(Payment, [nftPrice])
      const b1 = await bob.new(Payment, [mockSatoshis])
      const b2 = await bob.new(Payment, [mockSatoshis])
      const finalTx = OrdSaleHelper.finalizeSaleTx(tx, b1, b2, payment, bob.toScriptPubKey())

      // Bob signs an broadcasts the transaction to execute the swap
      await bob.fund(finalTx)
      await bob.sign(finalTx)
      await bob.broadcast(finalTx)

      // Bob reads the updated state from the blockchain
      const { env } = (await bob.sync(finalTx.getId())) as { env: { nft: NFT; payment: NFT } }
      const { nft: n, payment: p } = env

      expect(p.getSatoshis()).eq(nftPrice)
      expect(n.getOwners()).deep.eq([bob.getPublicKey()])
      expect(p.getOwners()).deep.eq([alice.getPublicKey()])
    })
  })

  describe('Detailed Tests', () => {
    let tx: any
    const fee = 1e6
    let sellerPublicKey: string

    describe('Creating an NFT and an offer to sell', () => {
      let nft: NFT
      const seller = new Computer({ url, chain, network })
      sellerPublicKey = seller.getPublicKey()
      const saleHelper = new OrdSaleHelper(seller)

      it('Seller deploys the smart contract', async () => {
        await seller.faucet(1e8)
        await saleHelper.deploy()
      })

      it('Seller creates an NFT', async () => {
        nft = await seller.new(NFT, ['name', 'artist', 'URL'])
        expect(nft).to.matchPattern({ name: 'name', artist: 'artist', url: 'URL', ...meta })
      })

      it('Seller creates a swap transaction for the NFT with the desired price', async () => {
        const b1Mock = new PaymentMock(BigInt(mockSatoshis))
        const b2Mock = new PaymentMock(BigInt(mockSatoshis))
        const paymentMock = new PaymentMock(BigInt(nftPrice))
        ;({ tx } = await saleHelper.createSaleTx(b1Mock, b2Mock, nft, paymentMock))
      })

      it('The third input representing the nft has been signed by seller, the other inputs are unsigned', () => {
        expect(tx.ins).to.have.lengthOf(4)
        expect(tx.ins[0].script).to.have.lengthOf(0) // b1 before
        expect(tx.ins[1].script).to.have.lengthOf(0) // b2 before
        expect(tx.ins[2].script).to.have.lengthOf.above(0) // nft before
        expect(tx.ins[3].script).to.have.lengthOf(0) // payment
      })

      it("The third output's value is nftPrice, the others are according to the _satoshis in the returned objects", () => {
        expect(tx.outs[0].value).eq(mockSatoshis * 2n) // b1 after
        expect(tx.outs[1].value).greaterThan(0) // t after
        expect(tx.outs[2].value).eq(nftPrice) // p after
        expect(tx.outs[3].value).eq(mockSatoshis) // b2 after
      })
    })

    describe('Executing the sale', () => {
      const buyer = new Computer({ url, chain, network })
      const computer = new Computer({ url, chain, network })
      let b1: Payment
      let b2: Payment
      let payment: Payment
      let txId: string

      before("Fund Buyers's wallet", async () => {
        await buyer.faucet(Number(nftPrice) + fee + 1e8)
      })

      it('Buyer creates a payment object', async () => {
        b1 = await buyer.new(Payment, [mockSatoshis])
        b2 = await buyer.new(Payment, [mockSatoshis])
        payment = await buyer.new(Payment, [nftPrice])

        expect(payment).matchPattern({
          _id: _.isString,
          _rev: _.isString,
          _root: _.isString,
          _owners: [buyer.getPublicKey()],
          _satoshis: nftPrice,
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
})
