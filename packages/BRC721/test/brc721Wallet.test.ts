/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { BRC721 } from '../src/brc721'
import { BRC721Wallet } from '../src/brc721Wallet'

const opts = {
  mnemonic:
    'expect table donate festival slam distance rebuild river tuna funny unable assist float educate above',
  chain: 'LTC',
  url: 'https://node.bitcoincomputer.io',
  network: 'testnet',
  // url: 'http://127.0.0.1:3000',
  // network: 'regtest',
}

class ExtentedBRC721 {
  name: string
  symbol: string
  url: string
  _owners: string[]
  readonly _id: string
  readonly _rev: string
  readonly _root: string

  constructor(to: string, name: string, symbol: string, url) {
    this._owners = [to]
    this.name = name
    this.symbol = symbol
    this.url = url
  }

  transfer(to: string) {
    this._owners = [to]
  }

  static balanceOf(nfts: ExtentedBRC721[]) {
    return nfts.length
  }
}

describe('BRC721Wallet', () => {
  describe('BRC721 Constructor', () => {
    it('Should create a new BRC721 object', async () => {
      const nft = new BRC721('to', 'name', 'symbol')
      expect(nft).not.to.be.undefined
      expect(nft).to.deep.eq({
        name: 'name',
        symbol: 'symbol',
        _owners: ['to'],
      })
    })
  })

  describe('ExtentedBRC721 Constructor', () => {
    it('Should create a new ExtentedBRC721 object', async () => {
      const nft = new ExtentedBRC721('to', 'name', 'symbol', 'www.test.com')
      expect(nft).not.to.be.undefined
      expect(nft).to.deep.eq({
        name: 'name',
        symbol: 'symbol',
        _owners: ['to'],
        url: 'www.test.com',
      })
    })
  })

  const runs = [
    { contract: BRC721, extendedProps: [] },
    { contract: ExtentedBRC721, extendedProps: ['www.test.com'] },
  ]

  runs.forEach(({ contract, extendedProps }) => {
    describe(`${contract.name} mint`, () => {
      it('Should mint tokens', async () => {
        const computer = new Computer(opts)
        const brc721 = new BRC721Wallet(computer, contract)
        const publicKey = brc721.computer.getPublicKey()
        const rev = await brc721.mint(publicKey, 'name', 'symbol', extendedProps)
        expect(rev).not.to.be.undefined
        expect(typeof rev).to.eq('object')
      })
    })

    describe(`${contract.name} balanceOf`, () => {
      it('Should compute the balance', async () => {
        const computer = new Computer(opts)
        const brc721 = new BRC721Wallet(computer, contract)
        const publicKey = computer.getPublicKey()
        await brc721.mint(publicKey, 'name', 'symbol', extendedProps)
        expect(brc721).not.to.be.undefined
        const balance = await brc721.balanceOf(publicKey)
        expect(balance).to.be.greaterThanOrEqual(1)
      })
    })

    describe(`${contract.name} transfer`, () => {
      it('Should transfer a token', async () => {
        const computer = new Computer(opts)
        const computer2 = new Computer()
        const brc721 = new BRC721Wallet(computer, contract)
        const publicKey = brc721.computer.getPublicKey()
        const token = await brc721.mint(publicKey, 'name', 'symbol', extendedProps)
        const publicKey2 = computer2.getPublicKey()
        await brc721.transferTo(publicKey2, token._id)
        const res = await brc721.balanceOf(publicKey)
        expect(res).to.be.greaterThanOrEqual(1)
      })
    })

    describe(`${contract.name} ownerOf`, () => {
      it('Should computer the owner', async () => {
        const computer = new Computer(opts)
        const brc721 = new BRC721Wallet(computer, contract)
        const publicKey = computer.getPublicKey()
        const token = await brc721.mint(publicKey, 'name', 'symbol', extendedProps)
        expect(brc721).not.to.be.undefined
        const owners = await brc721.ownerOf(token._id)
        expect(owners.length).to.be.greaterThanOrEqual(1)
      })
    })
  })
})
