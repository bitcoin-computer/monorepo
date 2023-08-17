/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { BRC20 } from '../src/brc-20'

/**
 * To run the tests with a local Bitcoin Computer node set "network" to "regtest" and
 * "url" to "http://127.0.0.1:3000" in the "opts" object below.
 */
const opts = {
  mnemonic:
    'machine mean impulse obscure layer prosper glance volume boring title room lesson save garlic hub',
  url: 'https://node.bitcoincomputer.io',
}

function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
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
    const computer = new Computer(opts)
    const brc20 = new BRC20('test', 'TST', computer)
    let mintId: string

    it('Should create the brc20 object', async () => {
      const publicKey = brc20.computer.getPublicKey()
      mintId = await brc20.mint(publicKey, 200)
      expect(mintId).not.to.be.undefined
      expect(typeof mintId).to.eq('string')
      expect(mintId.length).to.be.greaterThan(64)
    })

    it('Should mint a root token', async () => {
      const rootToken: any = await computer.sync(mintId)
      expect(rootToken).not.to.be.undefined
      expect(rootToken._id).to.eq(mintId)
      expect(rootToken._rev).to.eq(mintId)
      expect(rootToken._root).to.eq(mintId)
      expect(rootToken.tokens).to.eq(200)
      expect(rootToken.name).to.eq('test')
      expect(rootToken.symbol).to.eq('TST')
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
      await sleep(200)
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
      await sleep(200)
      await brc20.transfer(computer2.getPublicKey(), 20)
      await sleep(200)
      const res = await brc20.balanceOf(publicKey)
      expect(res).to.eq(180)
    })
  })
})
