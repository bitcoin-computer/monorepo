// import { Computer } from 'bitcoin-computer-lib'
import { Computer } from 'bitcoin-computer-lib'
import { NFT } from '../src/nft'
import { BRC721 } from '../src/brc721'

const opts = {
  seed: 'bright word little amazing coast obvious',

  // uncomment to run locally
  chain: 'LTC',
  url: 'http://127.0.0.1:3000',
  network: 'regtest',
}

describe('BRC721', () => {
  describe('Constructor', () => {
    it('Should create a new BRC721 object', async () => {
      const nft = new NFT('to', 'name', 'symbol')
      expect(nft).toBeDefined()
      expect(nft).toEqual({
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
      const publicKey = brc721.computer.db.wallet.getPublicKey().toString()
      const rev = await brc721.mint(publicKey, 'name', 'symbol')
      expect(rev).toBeDefined()
      expect(typeof rev).toBe('object')
    })
  })

  describe('balanceOf', () => {
    it('Should computer the balance', async () => {
      const computer = new Computer(opts)
      const brc721 = new BRC721(computer)
      const publicKey = computer.db.wallet.getPublicKey().toString()
      brc721.mint(publicKey, 'name', 'symbol')
      expect(brc721).toBeDefined()
      const balance = await brc721.balanceOf(publicKey)
      expect(balance).toBeGreaterThanOrEqual(1)
    }, 40000)
  })

  describe('transfer', () => {
    it('Should transfer a token', async () => {
      const computer = new Computer(opts)
      const computer2 = new Computer()
      const brc721 = new BRC721(computer)
      const publicKey = brc721.computer.db.wallet.getPublicKey().toString()
      const token = await brc721.mint(publicKey, 'name', 'symbol')
      const publicKey2 = computer2.db.wallet.getPublicKey().toString()
      await brc721.transfer(publicKey2, token._id)
      const res = await brc721.balanceOf(publicKey)
      expect(res).toBeGreaterThanOrEqual(1)
    }, 80000)
  })
})
