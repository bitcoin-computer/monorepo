import { expect } from 'chai'
import dotenv from 'dotenv'
import { Token } from '@bitcoin-computer/TBC20'
import { Computer } from '@bitcoin-computer/lib'
import { SellOrderHelper } from '../src/sell-order'
import { TxWrapperHelper, PaymentHelper, SaleHelper } from '../src'

dotenv.config({ path: '../../.env' })

describe('SellOrder', () => {
  const nftPrice = 1e8
  const fee = 100000

  describe('Buying a Token', () => {
    it('Should work with helper classes', async () => {
      const p = 10000

      const buyer = new Computer()
      await buyer.faucet(nftPrice + fee)
      const seller = new Computer()
      await seller.faucet(nftPrice + fee)

      // Deploy smart contracts
      const saleHelperS = new SaleHelper(seller)
      const saleMod = await saleHelperS.deploy()
      const txWrapperHelperS = new TxWrapperHelper(seller)
      const txWrapperMod = await txWrapperHelperS.deploy()
      const paymentHelperS = new PaymentHelper(seller)
      const paymentMod = await paymentHelperS.deploy()
      const sellOrderHelperS = new SellOrderHelper(seller, saleMod, txWrapperMod, paymentMod)
      await sellOrderHelperS.deploy()

      // Seller deploys the SellOrder contract and creates an Token
      const t = await seller.new(Token, [seller.getPublicKey(), 100, 'a', 'AAA'])

      // Seller creates an order
      const txId = await sellOrderHelperS.broadcastSellOrder(p, t._rev)
      expect(txId).a('string')

      const { res: txWrapper } = (await seller.sync(txId)) as any
      expect(txWrapper && txWrapper.txHex && typeof txWrapper.txHex === 'string').eq(true)
      expect(await seller.isUnspent(t._rev)).eq(true)

      // Buyer closes the order
      const sellOrderHelperB = new SellOrderHelper(buyer, saleMod, txWrapperMod, paymentMod)
      const res = await sellOrderHelperB.parseSellOrder(`${txId}:0`)
      expect(Object.keys(res)).deep.eq(['saleTx', 'price', 'open', 'token'])
      const { saleTx, price, open, token } = res
      expect(typeof saleTx).eq('object')
      expect(price).eq(p)
      expect(open).eq(true)
      expect(token).deep.eq(t)

      // Seller settles the order
      const saleTxId = await sellOrderHelperS.closeAndSettleSellOrder(price, saleTx)
      expect(saleTxId).a('string')
    })
  })
})
