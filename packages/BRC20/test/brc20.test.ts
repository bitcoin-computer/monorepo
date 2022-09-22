/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { BRC20 } from '../src/brc-20'

const opts = {
  mnemonic:
    'expect table donate festival slam distance rebuild river tuna funny unable assist float educate above',
  chain: 'LTC',
  url: 'https://node.bitcoincomputer.io',
  network: 'testnet',
  // url: 'http://127.0.0.1:3000',
  // network: 'regtest',
}

describe('BRC20', () => {
  describe('Constructor', () => {
    it('Should create a new BRC20 object', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      expect(brc20).not.to.be.undefined
      expect(brc20.computer).to.be.a('object')
      expect(brc20.mintId).to.be.undefined
      expect(brc20.name).to.eq('test')
      expect(brc20.symbol).to.eq('TST')
    })
  })

  describe('mint', () => {
    it('Should mint tokens', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.getPublicKey()
      const rev = await brc20.mint(publicKey, 200)
      expect(rev).not.to.be.undefined
      expect(typeof rev).to.eq('string')
      expect(rev.length).to.be.greaterThan(64)
    })
  })

  describe('totalSupply', () => {
    it('Should return the supply of tokens', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.getPublicKey()
      await brc20.mint(publicKey, 200)
      const supply = await brc20.totalSupply()
      expect(supply).to.eq(200)
    })
  })

  describe('balanceOf', () => {
    it('Should throw an error if the mint id is not set', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.getPublicKey()

      const brc20 = new BRC20('test', 'TST', computer)
      expect(brc20).not.to.be.undefined
      try {
        await brc20.balanceOf(publicKeyString)
        expect(true).to.eq('false')
      } catch (err) {
        expect(err.message).to.eq('Please set a mint id.')
      }
    })

    it('Should compute the balance', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.getPublicKey()
      await brc20.mint(publicKey, 200)
      const res = await brc20.balanceOf(publicKey)
      expect(res).to.eq(200)
    })
  })

  describe('transfer', () => {
    it('Should transfer a token', async () => {
      const computer = new Computer(opts)
      const computer2 = new Computer()
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.getPublicKey()
      await brc20.mint(publicKey, 200)
      await brc20.transfer(computer2.getPublicKey(), 20)
      const res = await brc20.balanceOf(publicKey)
      expect(res).to.eq(180)
    })
  })
})
