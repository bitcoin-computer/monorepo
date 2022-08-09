import { Computer } from 'bitcoin-computer-lib'
import { NFT } from '../src/nft'

const randomOpts = {
  // uncomment to run locally
  chain: 'LTC',
  url: 'http://127.0.0.1:3000',
  network: 'regtest',
}

const opts = {
  seed: 'opera deputy attitude upset royal keep',
  ...randomOpts,
}

describe('TokenBad', () => {
  describe('Constructor', () => {
    it('should create a Javascript object', () => {
      expect(NFT).toBeDefined()
      expect(typeof NFT).toBe('function')

      const token = new NFT('to', 'name', 'symbol')
      expect(token).toBeDefined()
    })

    it('should create a smart object', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.db.wallet.getPublicKey().toString()

      const nft = await computer.new(NFT, [publicKeyString, 'name', 'symbol'])
      expect(nft).toEqual({
        name: 'name',
        symbol: 'symbol',
        _owners: [publicKeyString],
        _id: expect.any(String),
        _rev: expect.any(String),
        _root: expect.any(String),
      })
    }, 20000)
  })

  describe('transfer', () => {
    it('Should update a smart object', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.db.wallet.getPublicKey().toString()

      const computer2 = new Computer(randomOpts)
      const publicKeyString2 = computer2.db.wallet.getPublicKey().toString()

      const nft = await computer.new(NFT, [publicKeyString, 'name', 'symbol'])
      expect(nft).toEqual({
        name: 'name',
        symbol: 'symbol',
        _owners: [publicKeyString],
        _id: expect.any(String),
        _rev: expect.any(String),
        _root: expect.any(String),
      })

      await nft.transfer(publicKeyString2, 1)

      expect(nft).toEqual({
        name: 'name',
        symbol: 'symbol',
        _owners: [publicKeyString2],
        _id: expect.any(String),
        _rev: expect.any(String),
        _root: expect.any(String),
      })
    }, 20000)
  })
})
