import { Computer } from 'bitcoin-computer-lib'
import { BRC20 } from '../src/brc-20'

const opts = {
  seed: 'bright word little amazing coast obvious',

  // uncomment to run locally
  chain: 'LTC',
  url: 'http://127.0.0.1:3000',
  network: 'regtest',
}

describe('BRC20', () => {
  describe('Constructor', () => {
    it('Should create a new BRC20 object', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      expect(brc20).toBeDefined()
      expect(brc20).toEqual({
        computer: expect.any(Object),
        mintId: undefined,
        name: 'test',
        symbol: 'TST',
      })
    })
  })

  describe('mint', () => {
    it('Should mint tokens', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.db.wallet.getPublicKey().toString()
      const rev = await brc20.mint(publicKey, 200)
      expect(rev).toBeDefined()
      expect(typeof rev).toBe('string')
      expect(rev.length).toBeGreaterThan(64)
    })
  })

  describe('totalSupply', () => {
    it('Should return the supply of tokens', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.db.wallet.getPublicKey().toString()
      await brc20.mint(publicKey, 200)
      const supply = await brc20.totalSupply()
      expect(supply).toBe(200)
    })
  })

  describe.only('balanceOf', () => {
    it('Should throw an error if the mint id is not set', async () => {
      const computer = new Computer(opts)
      const publicKeyString = computer.db.wallet.getPublicKey().toString()

      const brc20 = new BRC20('test', 'TST', computer)
      expect(brc20).toBeDefined()
      try {
        await brc20.balanceOf(publicKeyString)
        expect(true).toBe('false')
      } catch (err) {
        expect(err.message).toBe('Please set a mint id.')
      }
    }, 40000)

    it('Should computer the balance', async () => {
      const computer = new Computer(opts)
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.db.wallet.getPublicKey().toString()
      await brc20.mint(publicKey, 200)
      const res = await brc20.balanceOf(publicKey)
      expect(res).toBe(200)
    }, 40000)
  })

  describe('transfer', () => {
    it('Should transfer a token', async () => {
      const computer = new Computer(opts)
      const computer2 = new Computer()
      const brc20 = new BRC20('test', 'TST', computer)
      const publicKey = brc20.computer.db.wallet.getPublicKey().toString()
      await brc20.mint(publicKey, 200)
      await brc20.transfer(computer2.db.wallet.getPublicKey().toString(), 20)
      const res = await brc20.balanceOf(publicKey)
      expect(res).toBe(180)
    }, 80000)
  })
})
