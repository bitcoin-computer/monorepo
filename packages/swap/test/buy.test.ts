/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Token } from '@bitcoin-computer/TBC20'
import { Buy, BuyHelper } from '../src/buy'
import { SwapHelper } from '../src/swap'

dotenv.config({ path: '../../.env' })

describe.only('Sale', () => {
  const nftPrice = 1e8
  const fee = 100000

  describe('Buying a Token', () => {
    it('Should work with helper classes', async () => {
      const buyer = new Computer()
      await buyer.faucet(nftPrice + fee)
      const seller = new Computer()
      await seller.faucet(nftPrice + fee)

      // Seller creates an Token
      const token = await seller.new(Token, [seller.getPublicKey(), 100, 'a', 'AAA'])

      // Buyer creates an order
      const swapHelperB = new SwapHelper(buyer)
      const swapMod = await swapHelperB.deploy()
      const buyHelperB = new BuyHelper(buyer, swapMod)
      await buyHelperB.deploy()
      const buyOrder = await buyHelperB.broadcastBuyOrder(100000, 100, token._root)

      expect(token._owners).deep.eq([seller.getPublicKey()])
      expect(buyOrder._owners).deep.eq([buyer.getPublicKey()])

      // Seller accepts the buy order
      const buyHelperS = new BuyHelper(seller, swapMod, buyHelperB.mod)
      const { tx: swapTx } = (await buyHelperS.acceptBuyOrder(token, buyOrder)) as {
        tx: Transaction
      }

      // Buyer closes the buy order
      const txId = await buyHelperB.settleBuyOrder(swapTx)
      expect(txId).a.string

      const {
        env: { a: tokenAfter, b: buyAfter }
      } = (await seller.sync(txId)) as { env: { a: Token; b: Buy } }
      expect(tokenAfter._owners).deep.eq([buyer.getPublicKey()])
      expect(buyAfter._owners).deep.eq([seller.getPublicKey()])
    })

    it('It should work without helper classes', async () => {
      const buyer = new Computer()
      await buyer.faucet(nftPrice + fee)
      const seller = new Computer()
      await seller.faucet(nftPrice + fee)

      // Seller creates an Token
      const token = await seller.new(Token, [seller.getPublicKey(), 100, 'a', 'AAA'])

      // Buyer creates an order
      const swapHelperB = new SwapHelper(buyer)
      const swapMod = await swapHelperB.deploy()
      const buyMod = await buyer.deploy(`export ${Buy}`)
      const buyOrder = await buyer.new(Buy, [100000, 100, token._root], buyMod)

      expect(token._owners).deep.eq([seller.getPublicKey()])
      expect(buyOrder._owners).deep.eq([buyer.getPublicKey()])

      // Seller accepts the buy order
      const swapHelperS = new SwapHelper(seller, swapMod)
      const { tx: swapTx } = await swapHelperS.createSwapTx(token, buyOrder)

      // Buyer closes the buy order
      await buyer.sign(swapTx)
      const txId = await buyer.broadcast(swapTx)
      expect(txId).a.string

      const {
        env: { a: tokenAfter, b: buyAfter }
      } = (await seller.sync(txId)) as { env: { a: Token; b: Buy } }
      expect(tokenAfter._owners).deep.eq([buyer.getPublicKey()])
      expect(buyAfter._owners).deep.eq([seller.getPublicKey()])
      expect(tokenAfter.tokens).eq(100)
      // @ts-ignore
      expect(typeof buyAfter.tokens).eq('undefined')
    })
  })
})