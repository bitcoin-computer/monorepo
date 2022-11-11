/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Token, Payment, Swap } from '../src/trade'
import Mnemonic from '@bitcoin-computer/bitcore-mnemonic-ltc'

const { Transaction, PrivateKey, Output } = Mnemonic.bitcore

const opts = {
  mnemonic: 'travel upgrade inside soda birth essence junk merit never twenty system opinion',
  chain: 'LTC',
  // url: 'https://node.bitcoincomputer.io',
  // network: 'testnet',
  url: 'http://127.0.0.1:3000',
  network: 'regtest',
}
// n2xDdfpcz7cNtvsngdNb4DnJbFzVNG7s3z
describe('Trade', () => {
  it('should create a Javascript object', async () => {
    const sellerComputer = new Computer(opts)

    const buyerComputer = new Computer({
      ...opts,
      mnemonic: 'toddler hockey salute wheel harvest video narrow riot guitar lake sea call',
    })

    const sellerKey = sellerComputer.getPublicKey()
    const buyerKey = buyerComputer.getPublicKey()

    const tokenCreatedBySeller = await sellerComputer.new(Token, [sellerKey, 'name', 'symbol'])

    const payment = await buyerComputer.new(Payment, [buyerKey, 100000])
    const tokenToBuyByUser = await buyerComputer.sync(tokenCreatedBySeller._rev)
    let tx = null
    try {
      const swap = await buyerComputer.new(Swap, [tokenToBuyByUser, payment])
      console.log(swap)
    } catch (error) {
      console.log('error: ', error.response.data, error.response.data.tx)
      tx = error.response.data.tx
    }

    console.log('private key: ', sellerComputer.getPrivateKey())
    try {
      const transaction = new Transaction().fromString(tx)
      for (const input of transaction.inputs) {
        console.log(input)
        const inputTx = await sellerComputer.db.fromTxId(input.prevTxId.toString('hex'))
        console.log(inputTx)
        if (!input.output) {
          input.output = Transaction.Output.fromObject(inputTx.tx.outputs[input.outputIndex])
        }
      }
      console.log(transaction.toJSON())
      // const privateKey = new PrivateKey(sellerComputer.getPrivateKey())
      // console.log('privateKey: ', privateKey.toJSON())
      const SIGHASH_ALL = 0x01
      transaction.sign(sellerComputer.getPrivateKey(), SIGHASH_ALL)
    } catch (e) {
      console.log(e)
    }
  })
})
