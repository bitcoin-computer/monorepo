import { Computer } from 'bitcoin-computer-lib'
import { TokenBag } from '../src/token-bag'

const opts = {
  // seed: 'bright word little amazing coast obvious',
  seed: 'opera deputy attitude upset royal keep',

  // uncomment to run locally
  chain: 'LTC',
  url: 'http://127.0.0.1:3000',
  network: 'regtest',
}

describe('TokenBad', () => {
  describe('Constructor', () => {
    it('should create a Javascript object', () => {
      expect(TokenBag).toBeDefined()
      expect(typeof TokenBag).toBe('function')

      const token = new TokenBag('to', 3, 'test')
      expect(token).toBeDefined()
    })

    it('should create a smart object', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.db.wallet.getPublicKey().toString()

      const token = await computer.new(TokenBag, [publicKeyString, 3, 'test'])
      expect(token).toEqual({
        tokens: 3,
        _owners: [publicKeyString],
        name: 'test',
        symbol: '',
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

      const computer2 = new Computer(opts)
      const publicKeyString2 = computer2.db.wallet.getPublicKey().toString()

      const token = await computer.new(TokenBag, [publicKeyString, 3, 'test'])
      const newToken = await token.transfer(publicKeyString2, 1)
      expect(token).toEqual({
        tokens: 2,
        _owners: [publicKeyString],
        name: 'test',
        symbol: '',
        _id: expect.any(String),
        _rev: expect.any(String),
        _root: expect.any(String),
      })

      expect(newToken).toEqual({
        tokens: 1,
        _owners: [publicKeyString2],
        name: 'test',
        symbol: '',
        _id: expect.any(String),
        _rev: expect.any(String),
        _root: expect.any(String),
      })
    }, 20000)
  })
})
