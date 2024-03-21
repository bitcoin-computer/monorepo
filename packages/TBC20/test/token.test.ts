/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { TBC20, Token } from '../src/token'

const RLTC = {
  url: 'http://127.0.0.1:1031',
  network: 'regtest' as any,
}

function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

const computer = new Computer(RLTC)
const computer2 = new Computer(RLTC)

before(async () => {
  await computer.faucet(1e7)
  await computer2.faucet(1e7)
})

describe('Token', () => {
  describe('Constructor', () => {
    it('should create a Javascript object', () => {
      expect(Token).not.to.be.undefined
      expect(typeof Token).to.eq('function')

      const token = new Token('to', 3, 'test')
      expect(token).not.to.be.undefined
    })

    it('should create a smart object', async () => {
      const publicKeyString = computer.getPublicKey()

      const token = await computer.new(Token, [publicKeyString, 3, 'test'])
      expect(token.tokens).to.eq(3)
      expect(token._owners).deep.equal([publicKeyString])
      expect(token.name).to.eq('test')
      expect(token.symbol).to.eq('')
      expect(token._id).to.be.a('string')
      expect(token._rev).to.be.a('string')
      expect(token._root).to.be.a('string')
    })
  })

  describe('transfer', () => {
    it('Should update a smart object', async () => {
      const publicKeyString = computer.getPublicKey()
      const publicKeyString2 = computer2.getPublicKey()

      const token = await computer.new(Token, [publicKeyString, 3, 'test'])
      const newToken = await token.transfer(publicKeyString2, 1)
      expect(token.tokens).to.eq(2)
      expect(token._owners).deep.equal([publicKeyString])
      expect(token.name).to.eq('test')
      expect(token.symbol).to.eq('')
      expect(token._id).to.be.a('string')
      expect(token._rev).to.be.a('string')
      expect(token._root).to.be.a('string')

      expect(newToken.tokens).to.eq(1)
      expect(newToken._owners).deep.equal([publicKeyString2])
      expect(newToken.name).to.eq('test')
      expect(newToken.symbol).to.eq('')
      expect(newToken._id).to.be.a('string')
      expect(newToken._rev).to.be.a('string')
      expect(newToken._root).to.be.a('string')
    })
  })
})

describe('TBC20', () => {
  describe('Constructor', () => {
    it('Should create a new TBC20 object', async () => {
      const tbc20 = new TBC20('test', 'TST', computer)
      expect(tbc20).not.to.be.undefined
      expect(tbc20.computer).to.be.a('object')
      expect(tbc20.mintId).to.be.undefined
      expect(tbc20.name).to.eq('test')
      expect(tbc20.symbol).to.eq('TST')
    })
  })

  describe('mint', () => {
    const tbc20 = new TBC20('test', 'TST', computer)
    let mintId: string

    it('Should create the tbc20 object', async () => {
      const publicKey = tbc20.computer.getPublicKey()
      mintId = await tbc20.mint(publicKey, 200)
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
      const tbc20 = new TBC20('test', 'TST', computer)
      const publicKey = tbc20.computer.getPublicKey()
      await tbc20.mint(publicKey, 200)
      const supply = await tbc20.totalSupply()
      expect(supply).to.eq(200)
    })
  })

  describe('balanceOf', () => {
    it('Should throw an error if the mint id is not set', async () => {
      const publicKeyString = computer.getPublicKey()

      const tbc20 = new TBC20('test', 'TST', computer)
      expect(tbc20).not.to.be.undefined
      try {
        await tbc20.balanceOf(publicKeyString)
        expect(true).to.eq('false')
      } catch (err) {
        expect(err.message).to.eq('Please set a mint id.')
      }
    })

    it('Should compute the balance', async () => {
      const tbc20 = new TBC20('test', 'TST', computer)
      const publicKey = tbc20.computer.getPublicKey()
      await tbc20.mint(publicKey, 200)
      await sleep(200)
      const res = await tbc20.balanceOf(publicKey)
      expect(res).to.eq(200)
    })
  })

  describe('transfer', () => {
    it('Should transfer a token', async () => {
      const computer2 = new Computer()
      const tbc20 = new TBC20('test', 'TST', computer)
      const publicKey = tbc20.computer.getPublicKey()
      await tbc20.mint(publicKey, 200)
      await sleep(200)
      await tbc20.transfer(computer2.getPublicKey(), 20)
      await sleep(200)
      const res = await tbc20.balanceOf(publicKey)
      expect(res).to.eq(180)
    })

    it('Should transfer random amounts to different people', async () => {
      const computer2 = new Computer()
      const computer3 = new Computer()
      const tbc20 = new TBC20('multiple', 'MULT', computer)
      const publicKey = tbc20.computer.getPublicKey()
      await tbc20.mint(publicKey, 200)

      const amount2 = Math.floor(Math.random() * 100)
      const amount3 = Math.floor(Math.random() * 100)
      await sleep(200)
      await tbc20.transfer(computer2.getPublicKey(), amount2)
      await sleep(200)
      await tbc20.transfer(computer3.getPublicKey(), amount3)
      await sleep(200)
      const res = await tbc20.balanceOf(publicKey)
      expect(res).to.eq(200 - amount2 - amount3)

      const res2 = await tbc20.balanceOf(computer2.getPublicKey())
      expect(res2).to.eq(amount2)

      const res3 = await tbc20.balanceOf(computer3.getPublicKey())
      expect(res3).to.eq(amount3)
    })

    it('Should fail if the amount is greater than the balance', async () => {
      const computer2 = new Computer()
      const tbc20 = new TBC20('test', 'TST', computer)
      const publicKey = tbc20.computer.getPublicKey()
      await tbc20.mint(publicKey, 200)
      await sleep(200)
      try {
        await tbc20.transfer(computer2.getPublicKey(), 201)
        expect(true).to.eq('false')
      } catch (err) {
        expect(err.message).to.eq('Could not send entire amount')
      }
    })
  })
})
