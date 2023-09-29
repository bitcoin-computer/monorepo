/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '../src/nft'

/**
 * To run the tests with the Bitcoin Computer testnet node remove the opts argument.
 */
const opts = {
  url: 'http://127.0.0.1:1031',
  network: 'regtest' as any,
}

const computer = new Computer(opts)
const computer2 = new Computer(opts)

before(async () => {
  // @ts-ignore
  await computer.faucet(1e7)
  // @ts-ignore
  await computer2.faucet(1e7)
})

describe('NFT', () => {
  describe('Constructor', () => {
    it('should create a Javascript object', () => {
      expect(NFT).not.to.be.undefined
      expect(typeof NFT).to.eq('function')

      const token = new NFT('to', 'name', 'symbol')
      expect(token).not.to.be.undefined
    })

    it('should create a smart object', async () => {
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
      const publicKeyString = computer.getPublicKey()

      const publicKeyString2 = computer2.getPublicKey()

      const nft = await computer.new(NFT, [publicKeyString, 'name', 'symbol'])
      expect(nft._owners).deep.equal([publicKeyString])
      expect(nft.name).to.eq('name')
      expect(nft.symbol).to.eq('symbol')
      expect(nft._id).to.be.a('string')
      expect(nft._rev).to.be.a('string')
      expect(nft._root).to.be.a('string')

      await nft.transfer(publicKeyString2)

      expect(nft._owners).deep.equal([publicKeyString2])
      expect(nft.name).to.eq('name')
      expect(nft.symbol).to.eq('symbol')
      expect(nft._id).to.be.a('string')
      expect(nft._rev).to.be.a('string')
      expect(nft._root).to.be.a('string')
    })
  })
})
