/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Token, TokenHelper } from '../src/token'

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
  await sender.faucet(1e8)
  await receiver.faucet(1e8)
})

describe('Token', async () => {
  let token1: Token

  describe('mint', async () => {
    it('Sender mints 3 tokens', async () => {
      token1 = await sender.new(Token, [sender.getPublicKey(), 3, 'test'])
    })

    it('The meta data should be set', async () => {
      expect(token1.amount).to.eq(3)
      expect(token1._owners).deep.equal([sender.getPublicKey()])
      expect(token1.name).to.eq('test')
      expect(token1.symbol).to.eq('')
      expect(token1._id).to.be.a('string')
      expect(token1._rev).to.be.a('string')
      expect(token1._root).to.be.a('string')
    })
  })

  describe('transfer, merge and burn', () => {
    let token2: Token
    let token2After: Token

    it('Sender transfers 1 token to Receiver', async () => {
      token2 = await token1.transfer(receiver.getPublicKey(), 1)
    })

    it('The meta data of token should be set correctly', () => {
      expect(token1.amount).to.eq(2)
      expect(token1._owners).deep.equal([sender.getPublicKey()])
      expect(token1.name).to.eq('test')
      expect(token1.symbol).to.eq('')
      expect(token1._id).to.be.a('string')
      expect(token1._rev).to.be.a('string')
      expect(token1._root).to.be.a('string')
    })

    it('The meta data of newToken should be set correctly', () => {
      expect(token2.amount).to.eq(1)
      expect(token2._owners).deep.equal([receiver.getPublicKey()])
      expect(token2.name).to.eq('test')
      expect(token2.symbol).to.eq('')
      expect(token2._id).to.be.a('string')
      expect(token2._rev).to.be.a('string')
      expect(token2._root).to.be.a('string')
    })

    it('computer.query should return the tokens', async () => {
      const senderRevs = await sender.query({ publicKey: sender.getPublicKey() })
      expect(senderRevs.length).eq(1)
      const senderToken = (await sender.sync(senderRevs[0])) as Token
      expect(senderToken.amount).eq(2)

      const receiverRevs = await receiver.query({ publicKey: receiver.getPublicKey() })
      expect(receiverRevs.length).eq(1)
      const receiverTokens = (await receiver.sync(receiverRevs[0])) as Token
      expect(receiverTokens.amount).eq(1)
    })

    it('Receiver send token2 back to sender', async () => {
      // Here we would like to call
      //
      //   await token2.transfer(sender.getPublicKey())
      //
      // However, the wallet associated with of token2 is sender as token2 was created by
      // token1 which was created by sender. As token2 is owned by receiver the transaction
      // would be rejected as sender cannot spend an output owned by receiver.
      //
      // We could execute the call by creating an object associated with receiver.
      //
      //   const token2Receiver = (await receiver.sync(token2._rev)) as any
      //   await token2Receiver.transfer(sender.getPublicKey())
      //
      // Alternatively we can use encodeCall
      const { tx, effect } = await receiver.encodeCall({
        target: token2,
        property: 'transfer',
        args: [sender.getPublicKey()]
      })
      await receiver.broadcast(tx)

      const { env } = effect
      const { __bc__ } = env
      token2After = __bc__ as unknown as Token

      expect(token1._owners).deep.eq([sender.getPublicKey()])
      expect(token2After._owners).deep.eq([sender.getPublicKey()])

      expect(token2._id).eq(token2After._id)
      expect(token2._rev).not.eq(token2After._rev)

      expect(await sender.query({ ids: [token1._id] })).deep.eq([token1._rev])
      expect(await sender.query({ ids: [token2._id] })).deep.eq([token2After._rev])
    })

    it('Sender merges their two tokens', async () => {
      await token1.merge([token2After])
      expect(token1.amount).eq(3)
      expect(token2After.amount).eq(0)
    })

    it('Should burn a token', async () => {
      await token1.burn()
      expect(token1.amount).eq(0)

      await token2.burn()
      expect(token2.amount).eq(0)

      await token2After.burn()
      expect(token2After.amount).eq(0)
    })

    it('Should update the revisions correctly', async () => {
      const computer = new Computer()
      await computer.faucet(2e8)
      const t1 = await computer.new(Token, [computer.getPublicKey(), 3, 'test'])
      const rev1 = t1._rev
      const t2 = await t1.transfer(computer.getPublicKey(), 1)
      expect(t1!._rev).not.eq(rev1)
      const rev2 = t2!._rev
      await t2!.transfer(computer.getPublicKey())
      expect(t2!._rev).not.eq(rev2)
    })
  })
})

describe('TokenHelper', () => {
  describe('mint', () => {
    const tokenHelper = new TokenHelper(sender)
    let root: string
    it('Should create the tokenHelper object', async () => {
      const publicKey = tokenHelper.computer.getPublicKey()
      root = await tokenHelper.mint(publicKey, 200, 'test', 'TST')
      expect(root).not.to.be.undefined
      expect(typeof root).to.eq('string')
      expect(root.length).to.be.greaterThan(64)
    })

    it('Should mint a root token', async () => {
      const rootToken: any = await sender.sync(root)
      expect(rootToken).not.to.be.undefined
      expect(rootToken._id).to.eq(root)
      expect(rootToken._rev).to.eq(root)
      expect(rootToken._root).to.eq(root)
      expect(rootToken.amount).to.eq(200)
      expect(rootToken.name).to.eq('test')
      expect(rootToken.symbol).to.eq('TST')
    })
  })

  describe('totalSupply', () => {
    it('Should return the supply of tokens', async () => {
      const tokenHelper = new TokenHelper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200, 'test', 'TST')
      const supply = await tokenHelper.totalSupply(root)
      expect(supply).to.eq(200)
    })
  })

  describe('balanceOf', () => {
    it('Should throw an error if the root is not set', async () => {
      const publicKeyString = sender.getPublicKey()

      const tokenHelper = new TokenHelper(sender)
      expect(tokenHelper).not.to.be.undefined
      try {
        await tokenHelper.balanceOf(publicKeyString, undefined)
        expect(true).to.eq(false)
      } catch (err) {
        expect(err.message).to.eq('Please pass a root into balanceOf.')
      }
    })

    it('Should compute the balance', async () => {
      const tokenHelper = new TokenHelper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200, 'test', 'TST')
      await sleep(200)
      const res = await tokenHelper.balanceOf(publicKey, root)
      expect(res).to.eq(200)
    })
  })

  describe('transfer', () => {
    it('Should transfer a token', async () => {
      const computer2 = new Computer()
      const tokenHelper = new TokenHelper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200, 'test', 'TST')
      await sleep(200)
      await tokenHelper.transfer(computer2.getPublicKey(), 20, root)
      await sleep(200)
      const res = await tokenHelper.balanceOf(publicKey, root)
      expect(res).to.eq(180)
    })

    it('Should transfer random amounts to different people', async () => {
      const computer2 = new Computer()
      const computer3 = new Computer()
      const tokenHelper = new TokenHelper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200, 'multiple', 'MULT')
      const amount2 = Math.floor(Math.random() * 100)
      const amount3 = Math.floor(Math.random() * 100)
      await sleep(200)
      await tokenHelper.transfer(computer2.getPublicKey(), amount2, root)
      await sleep(200)
      await tokenHelper.transfer(computer3.getPublicKey(), amount3, root)
      await sleep(200)
      const res = await tokenHelper.balanceOf(publicKey, root)
      expect(res).to.eq(200 - amount2 - amount3)

      const res2 = await tokenHelper.balanceOf(computer2.getPublicKey(), root)
      expect(res2).to.eq(amount2)

      const res3 = await tokenHelper.balanceOf(computer3.getPublicKey(), root)
      expect(res3).to.eq(amount3)
    })

    it('Should fail if the amount is greater than the balance', async () => {
      const computer2 = new Computer()
      const tokenHelper = new TokenHelper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200, 'test', 'TST')
      await sleep(200)
      try {
        await tokenHelper.transfer(computer2.getPublicKey(), 201, root)
        expect(true).to.eq('false')
      } catch (err) {
        expect(err.message).to.eq('Could not send entire amount')
      }
    })
  })
})
