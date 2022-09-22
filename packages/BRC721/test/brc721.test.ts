/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '../src/nft'
import { BRC721 } from '../src/brc721'

const opts = {
  mnemonic:
    'expect table donate festival slam distance rebuild river tuna funny unable assist float educate above',
  chain: 'LTC',
  url: 'https://node.bitcoincomputer.io',
  network: 'testnet',
  // url: 'http://127.0.0.1:3000',
  // network: 'regtest',
}

describe('BRC721', () => {
  describe('Constructor', () => {
    it('Should create a new BRC721 object', async () => {
      const nft = new NFT('to', 'name', 'symbol')
      expect(nft).not.to.be.undefined
      expect(nft).to.deep.eq({
        name: 'name',
        symbol: 'symbol',
        _owners: ['to'],
      })
    })
  })

  describe('mint', () => {
    it('Should mint tokens', async () => {
      const computer = new Computer(opts)
      const brc721 = new BRC721(computer)
      const publicKey = brc721.computer.getPublicKey()
      const rev = await brc721.mint(publicKey, 'name', 'symbol')
      expect(rev).not.to.be.undefined
      expect(typeof rev).to.eq('object')
    })
  })

  describe('balanceOf', () => {
    it('Should computer the balance', async () => {
      const computer = new Computer(opts)
      const brc721 = new BRC721(computer)
      const publicKey = computer.getPublicKey()
      brc721.mint(publicKey, 'name', 'symbol')
      expect(brc721).not.to.be.undefined
      const balance = await brc721.balanceOf(publicKey)
      expect(balance).to.be.greaterThanOrEqual(1)
    })
  })

  describe('transfer', () => {
    it('Should transfer a token', async () => {
      const computer = new Computer(opts)
      const computer2 = new Computer()
      const brc721 = new BRC721(computer)
      const publicKey = brc721.computer.getPublicKey()
      const token = await brc721.mint(publicKey, 'name', 'symbol')
      const publicKey2 = computer2.getPublicKey()
      await brc721.transfer(publicKey2, token._id)
      const res = await brc721.balanceOf(publicKey)
      expect(res).to.be.greaterThanOrEqual(1)
    })
  })
})
