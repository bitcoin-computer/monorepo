/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Token, Payment, Swap } from '../src/trade'
import Mnemonic from '@bitcoin-computer/bitcore-mnemonic-ltc'

const { Transaction, PrivateKey, Output } = Mnemonic.bitcore

const opts = {
  mnemonic: 'travel upgrade inside soda birth essence junk merit never twenty system opinion',
  chain: 'LTC',
  url: 'https://node.bitcoincomputer.io',
  network: 'testnet',
  // url: 'http://127.0.0.1:3000',
  // network: 'regtest',
}

describe('Trade', () => {
  it('should create a Javascript object', async () => {
    const sellerComputer = new Computer(opts)

    const buyerComputer = new Computer({
      ...opts,
      mnemonic: 'toddler hockey salute wheel harvest video narrow riot guitar lake sea call',
    })

    const tokenCreatedBySeller = await sellerComputer.new(Token, [
      sellerComputer.getPublicKey(),
      'name',
      'symbol',
    ])

    const payment = await buyerComputer.new(Payment, [buyerComputer.getPublicKey(), 100000])
    const tokenToBuyByUser = await buyerComputer.sync(tokenCreatedBySeller._rev)
    const swapTx = await buyerComputer.getCreateTx(Swap, [tokenToBuyByUser, payment])
    sellerComputer.sign(swapTx)
    await sellerComputer.broadcast(swapTx)
    const tokenRev = await sellerComputer.getLatestRev(tokenCreatedBySeller._id)
    const paymentRev = await sellerComputer.getLatestRev(payment._id)

    const updatedToken = await sellerComputer.sync(tokenRev)
    const updatedPayment = await sellerComputer.sync(paymentRev)
    expect(sellerComputer.getPublicKey()).eq(updatedPayment._owners[0])
    expect(buyerComputer.getPublicKey()).eq(updatedToken._owners[0])
  })
})
