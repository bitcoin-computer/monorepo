/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '../src/nft'

/**
 * To run the tests with a local Bitcoin Computer node set "network" to "regtest" and
 * "url" to "http://127.0.0.1:3000" in the "opts" object below.
 */
const opts = {
  mnemonic:
    'expect table donate festival slam distance rebuild river tuna funny unable assist float educate above',
  chain: 'LTC',
  url: 'https://node.bitcoincomputer.io',
  network: 'testnet',
}

describe('NFT', () => {
  describe('Constructor', () => {
    it('should create a Javascript object', () => {
      expect(NFT).not.to.be.undefined
      expect(typeof NFT).to.eq('function')

      const token = new NFT('to', 'name', 'symbol')
      expect(token).not.to.be.undefined
    })

    it('should create a smart object', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.getPublicKey()

      const nft = await computer.new(NFT, [publicKeyString, 'name', 'symbol'])
      expect(nft._owners).deep.equal([publicKeyString])
      expect(nft.name).to.eq('name')
      expect(nft.symbol).to.eq('symbol')
      expect(nft._id).to.be.a('string')
      expect(nft._rev).to.be.a('string')
      expect(nft._root).to.be.a('string')
    })
  })

  describe('transfer', () => {
    it('Should update a smart object', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.getPublicKey()

      const computer2 = new Computer(opts)
      const publicKeyString2 = computer2.getPublicKey()

      const nft = await computer.new(NFT, [publicKeyString, 'name', 'symbol'])
      expect(nft._owners).deep.equal([publicKeyString])
      expect(nft.name).to.eq('name')
      expect(nft.symbol).to.eq('symbol')
      expect(nft._id).to.be.a('string')
      expect(nft._rev).to.be.a('string')
      expect(nft._root).to.be.a('string')

      await nft.transfer(publicKeyString2, 1)

      expect(nft._owners).deep.equal([publicKeyString2])
      expect(nft.name).to.eq('name')
      expect(nft.symbol).to.eq('symbol')
      expect(nft._id).to.be.a('string')
      expect(nft._rev).to.be.a('string')
      expect(nft._root).to.be.a('string')
    })
  })
})
