/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Token, Payment, Swap } from '../src/trade'

const opts = {
  mnemonic: 'travel upgrade inside soda birth essence junk merit never twenty system opinion',
  chain: 'LTC',
  // url: 'https://node.bitcoincomputer.io',
  // network: 'testnet',
  url: 'http://127.0.0.1:3000',
  network: 'regtest',
}

describe('Trade', () => {
  it('should create a Javascript object', async () => {
    try {
      const computer = new Computer(opts)
      const publicKeyString = computer.getPublicKey()
      const newBalance = await computer.getBalance()

      const payment = await computer.new(Payment, [publicKeyString, 1000])
      const tokenCreatedByUser = await computer.new(Token, [publicKeyString, 'name', 'symbol'])
      // const tokenToBuyByUser = await computer.sync(tokenCreatedByUser._rev)
      // console.log(tokenCreatedByUser, payment)
    } catch (error) {
      console.log('error occurred: ', error.message)
    }
  })
})
