/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { TBC20, Token } from '../src/token'

// If you want to connect to your local Bitcoin Computer Node, create a .env file
// in the monorepo root level and add the following line:
// BCN_URL=http://localhost:1031

dotenv.config({ path: '../../.env' })

const url = process.env.BCN_URL

function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

const sender = new Computer({ url })
const receiver = new Computer({ url })

before(async () => {
  await sender.faucet(1e7)
})

describe('Token', () => {
  describe('Using fungible tokens without a helper class', () => {
    let token: Token

    describe('Minting a fungible token', async () => {
      it('Sender mints a token', async () => {
        token = await sender.new(Token, [sender.getPublicKey(), 3, 'test'])
      })

      it('The meta data should be set', async () => {
        expect(token.tokens).to.eq(3)
        expect(token._owners).deep.equal([sender.getPublicKey()])
        expect(token.name).to.eq('test')
        expect(token.symbol).to.eq('')
        expect(token._id).to.be.a('string')
        expect(token._rev).to.be.a('string')
        expect(token._root).to.be.a('string')
      })
    })

    describe('Transferring the NFT', () => {
      let newToken: Token

      it('Sender transfers the NFT to receiver', async () => {
        newToken = await token.transfer(receiver.getPublicKey(), 1)
      })

      it('The meta data of token should be set correctly', () => {
        expect(token.tokens).to.eq(2)
        expect(token._owners).deep.equal([sender.getPublicKey()])
        expect(token.name).to.eq('test')
        expect(token.symbol).to.eq('')
        expect(token._id).to.be.a('string')
        expect(token._rev).to.be.a('string')
        expect(token._root).to.be.a('string')
      })

      it('The meta data of newToken should be set correctly', () => {
        expect(newToken.tokens).to.eq(1)
        expect(newToken._owners).deep.equal([receiver.getPublicKey()])
        expect(newToken.name).to.eq('test')
        expect(newToken.symbol).to.eq('')
        expect(newToken._id).to.be.a('string')
        expect(newToken._rev).to.be.a('string')
        expect(newToken._root).to.be.a('string')
      })
    })
  })

  describe('Using fungible tokens with a helper class', () => {
    describe('mint', () => {
      const tbc20 = new TBC20('test', 'TST', sender)
      let mintId: string
      it('Should create the tbc20 object', async () => {
        const publicKey = tbc20.computer.getPublicKey()
        mintId = await tbc20.mint(publicKey, 200)
        expect(mintId).not.to.be.undefined
        expect(typeof mintId).to.eq('string')
        expect(mintId.length).to.be.greaterThan(64)
      })
      it('Should mint a root token', async () => {
        const rootToken: any = await sender.sync(mintId)
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
        const tbc20 = new TBC20('test', 'TST', sender)
        const publicKey = tbc20.computer.getPublicKey()
        await tbc20.mint(publicKey, 200)
        const supply = await tbc20.totalSupply()
        expect(supply).to.eq(200)
      })
    })

    describe('balanceOf', () => {
      it('Should throw an error if the mint id is not set', async () => {
        const publicKeyString = sender.getPublicKey()

        const tbc20 = new TBC20('test', 'TST', sender)
        expect(tbc20).not.to.be.undefined
        try {
          await tbc20.balanceOf(publicKeyString)
          expect(true).to.eq('false')
        } catch (err) {
          expect(err.message).to.eq('Please set a mint id.')
        }
      })
      it('Should compute the balance', async () => {
        const tbc20 = new TBC20('test', 'TST', sender)
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
        const tbc20 = new TBC20('test', 'TST', sender)
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
        const tbc20 = new TBC20('multiple', 'MULT', sender)
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
        const tbc20 = new TBC20('test', 'TST', sender)
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
})
