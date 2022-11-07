/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { BRC721 } from '../src/brc721'

const randomOpts = {
  mnemonic:
    'expect table donate festival slam distance rebuild river tuna funny unable assist float educate above',
  chain: 'LTC',
  url: 'https://node.bitcoincomputer.io',
  network: 'testnet',
  // url: 'http://127.0.0.1:3000',
  // network: 'regtest',
}

const opts = {
  mnemonic: 'opera deputy attitude upset royal keep',
  ...randomOpts,
}

describe('BRC721', () => {
  describe('Constructor', () => {
    it('should create a Javascript object', () => {
      expect(BRC721).not.to.be.undefined
      expect(typeof BRC721).to.eq('function')

      const token = new BRC721('to', 'name', 'symbol')
      expect(token).not.to.be.undefined
    })

    it('should create a smart object', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.getPublicKey()

      const nft = await computer.new(BRC721, [publicKeyString, 'name', 'symbol'])
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

      const computer2 = new Computer(randomOpts)
      const publicKeyString2 = computer2.getPublicKey()

      const nft = await computer.new(BRC721, [publicKeyString, 'name', 'symbol'])
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
