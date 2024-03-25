/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Token } from '../src/token'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env'})

const url = process.env.BCN_URL

const computer = new Computer({ url })
const computer2 = new Computer({ url })

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
