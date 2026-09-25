import { expect } from 'chai'
import { Computer, SmartContract } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { TBC20, TBC20Helper, Token, TokenHelper } from '../src/token.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

const sender = new Computer({ url, chain, network })
const receiver = new Computer({ url, chain, network })

before(async () => {
  const u1 = await sender.faucet(10e8)
  const u2 = await receiver.faucet(10e8)
  await sender.waitForIndexed(u1.txId)
  await receiver.waitForIndexed(u2.txId)
})

// Re-faucet before every test so each operation can start from a fresh UTXO.
// On regtest the node does not auto-mine, so reusing a wallet across many
// transactions builds long unconfirmed descendant chains (txn-mempool-conflict
// / too-long-mempool-chain). A fresh faucet output has no unconfirmed ancestors
// and breaks that chain.
beforeEach(async () => {
  const u1 = await sender.faucet(10e8)
  const u2 = await receiver.faucet(10e8)
  await sender.waitForIndexed(u1.txId)
  await receiver.waitForIndexed(u2.txId)
})

// Returns a brand new wallet funded with several independent UTXOs, so a short
// sequence of dependent transactions never re-selects an already-spent output.
async function fundedComputer(times = 3, sats = 2e8): Promise<Computer> {
  const computer = new Computer({ url, chain, network })
  for (let i = 0; i < times; i++) {
    const u = await computer.faucet(sats)
    await computer.waitForIndexed(u.txId)
  }
  return computer
}

// Helper.balanceOf / getBags use the indexer; after a spend the old rev can
// linger briefly. Poll until the expected balance is visible (does not change
// what we assert — only when we assert it).
async function waitForBalance(
  tokenHelper: TBC20Helper,
  publicKey: string,
  root: string,
  expected: bigint,
  tries = 40,
): Promise<void> {
  for (let i = 0; i < tries; i++) {
    if ((await tokenHelper.balanceOf(publicKey, root)) === expected) return
    await new Promise((r) => setTimeout(r, 250))
  }
}

describe('TBC20', () => {
  it('exports Token / TokenHelper as aliases', () => {
    expect(Token).to.eq(TBC20)
    expect(TokenHelper).to.eq(TBC20Helper)
  })

  it('Should mint a token with the expected metadata', async () => {
    const token = await sender.new(TBC20, [{ to: sender.getPublicKey(), amount: 3n, name: 'test' }])

    expect(token.amount).to.eq(3n)
    expect(token._owners).deep.equal([sender.getPublicKey()])
    expect(token.name).to.eq('test')
    expect(token.symbol).to.eq('')
    expect(token._id).to.be.a('string')
    expect(token._rev).to.be.a('string')
    expect(token._root).to.be.a('string')
    // root getter mirrors _root
    expect(token.root).to.eq(token._root)
  })

  it('Should mint a token with a symbol', async () => {
    const token = await sender.new(TBC20, [
      { to: sender.getPublicKey(), amount: 5n, name: 'test', symbol: 'TST' },
    ])
    expect(token.symbol).to.eq('TST')
  })

  it('partial transfer creates a new token for the recipient in the same lineage', async () => {
    const token1 = await sender.new(TBC20, [
      { to: sender.getPublicKey(), amount: 3n, name: 'test' },
    ])

    const token2 = await token1.transfer(receiver.getPublicKey(), 1n)

    // Sender's token keeps its identity, amount reduced
    expect(token1.amount).to.eq(2n)
    expect(token1._owners).deep.equal([sender.getPublicKey()])

    // A brand new token instance is created for the receiver
    expect(token2.amount).to.eq(1n)
    expect(token2._owners).deep.equal([receiver.getPublicKey()])
    expect(token2.name).to.eq('test')
    expect(token2.symbol).to.eq('')

    // Different instances, same lineage
    expect(token2._id).to.not.eq(token1._id)
    expect(token2._root).to.eq(token1._root)

    // Both revisions persist on chain with the expected balances. We sync the
    // exact revisions (rather than getOUTXOs-by-publicKey) because `sender` and
    // `receiver` are shared across tests and hold many token UTXOs.
    const senderToken = await sender.sync<typeof TBC20>(token1._rev)
    expect(senderToken.amount).eq(2n)

    const receiverToken = await receiver.sync<typeof TBC20>(token2._rev)
    expect(receiverToken.amount).eq(1n)
  })

  it('full transfer (no amount) reassigns ownership in place, keeping the same token', async () => {
    const computer = await fundedComputer()
    const token1 = await computer.new(TBC20, [
      { to: computer.getPublicKey(), amount: 4n, name: 'test' },
    ])
    const idBefore = token1._id

    // A full transfer mutates the token in place and returns undefined (matching
    // the original TBC20 / NFT / Payment behavior).
    const returned = await token1.transfer(receiver.getPublicKey())
    expect(returned).to.be.undefined

    // Same token instance, full amount preserved, ownership moved to the recipient
    expect(token1._id).to.eq(idBefore)
    expect(token1.amount).to.eq(4n)
    expect(token1._owners).deep.equal([receiver.getPublicKey()])

    // The recipient can read the same token revision on chain
    const receiverToken = await receiver.sync<typeof TBC20>(token1._rev)
    expect(receiverToken.amount).eq(4n)
    expect(receiverToken._owners).deep.equal([receiver.getPublicKey()])
  })

  it('Should throw when transferring a non-positive amount', async () => {
    const token = await sender.new(TBC20, [{ to: sender.getPublicKey(), amount: 3n, name: 'test' }])
    try {
      await token.transfer(receiver.getPublicKey(), 0n)
      expect.fail('should have thrown on non-positive transfer')
    } catch (err) {
      expect(err.message).to.eq('Transfer amount must be positive')
    }
  })

  it('Should throw when transferring more than the balance', async () => {
    const token = await sender.new(TBC20, [{ to: sender.getPublicKey(), amount: 3n, name: 'test' }])
    try {
      await token.transfer(receiver.getPublicKey(), 4n)
      expect.fail('should have thrown on insufficient funds')
    } catch (err) {
      expect(err.message).to.eq('Insufficient funds')
    }
  })

  it('Should merge tokens of the same lineage and burn the merged ones', async () => {
    const computer = await fundedComputer()

    // Mint then split into two same-lineage tokens owned by the same wallet
    const token1 = await computer.new(TBC20, [
      { to: computer.getPublicKey(), amount: 3n, name: 'test' },
    ])

    const token2 = await token1.transfer(computer.getPublicKey(), 1n)
    expect(token1.amount).to.eq(2n)
    expect(token2.amount).to.eq(1n)
    expect(token1.root).to.eq(token1._root)
    expect(token2.root).to.eq(token1.root)

    await token1.merge([token2])
    expect(token1.amount).to.eq(3n)
    expect(token2.amount).to.eq(0n)
  })

  it('Should refuse to merge tokens from different lineages', async () => {
    const computer = await fundedComputer()

    const tokenA = await computer.new(TBC20, [
      { to: computer.getPublicKey(), amount: 3n, name: 'A' },
    ])
    const tokenB = await computer.new(TBC20, [
      { to: computer.getPublicKey(), amount: 3n, name: 'B' },
    ])
    expect(tokenA._root).to.not.eq(tokenB._root)

    try {
      await tokenA.merge([tokenB])
      expect.fail('should have thrown on cross-lineage merge')
    } catch (err) {
      expect(err.message).to.include('Cannot merge tokens from different lineages')
    }
  })

  it('Should burn a token', async () => {
    const token = await sender.new(TBC20, [{ to: sender.getPublicKey(), amount: 3n, name: 'test' }])
    await token.burn()
    expect(token.amount).to.eq(0n)
  })

  it('Should update the revisions correctly', async () => {
    const computer = await fundedComputer()
    const t1 = await computer.new(TBC20, [
      { to: computer.getPublicKey(), amount: 3n, name: 'test' },
    ])
    const rev1 = t1._rev
    const t2 = await t1.transfer(computer.getPublicKey(), 1n)
    expect(t1._rev).not.eq(rev1)
    const rev2 = t2._rev
    // transfer the rest to another owner
    const computer2 = new Computer({ url, chain, network })
    await t2.transfer(computer2.getPublicKey())

    expect(t2._rev).not.eq(rev2)
  })
})

describe('TBC20Helper', () => {
  describe('mint', () => {
    const tokenHelper = new TBC20Helper(sender)
    let root: string
    it('Should create the tokenHelper object', async () => {
      const publicKey = tokenHelper.computer.getPublicKey()
      root = await tokenHelper.mint(publicKey, 200n, 'test', 'TST')
      expect(root).not.to.be.undefined
      expect(typeof root).to.eq('string')
      expect(root.length).to.be.greaterThan(64)
      await sender.waitForIndexed(root)
    })

    it('Should mint a root token', async () => {
      const rootToken = (await sender.sync<typeof TBC20>(root)) as SmartContract<typeof TBC20>
      expect(rootToken).not.to.be.undefined
      expect(rootToken._id).to.eq(root)
      expect(rootToken._rev).to.eq(root)
      expect(rootToken._root).to.eq(root)
      expect(rootToken.amount).to.eq(200n)
      expect(rootToken.name).to.eq('test')
      expect(rootToken.symbol).to.eq('TST')
    })
  })

  describe('totalSupply', () => {
    it('Should return the supply of tokens', async () => {
      const tokenHelper = new TBC20Helper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200n, 'test', 'TST')
      await sender.waitForIndexed(root)
      const supply = await tokenHelper.totalSupply(root)
      expect(supply).to.eq(200n)
    })
  })

  describe('balanceOf', () => {
    it('Should throw an error if the root is not set', async () => {
      const publicKeyString = sender.getPublicKey()

      const tokenHelper = new TBC20Helper(sender)
      expect(tokenHelper).not.to.be.undefined
      try {
        await tokenHelper.balanceOf(publicKeyString, undefined)
        expect(true).to.eq(false)
      } catch (err) {
        expect(err.message).to.eq('Please pass a root into balanceOf.')
      }
    })

    it('Should compute the balance', async () => {
      const tokenHelper = new TBC20Helper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200n, 'test', 'TST')
      await sender.waitForIndexed(root)

      const res = await tokenHelper.balanceOf(publicKey, root)
      expect(res).to.eq(200n)
    })
  })

  describe('transfer', () => {
    it('Should transfer a token', async () => {
      const computer2 = new Computer({ url, chain, network })
      const tokenHelper = new TBC20Helper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200n, 'test', 'TST')
      await sender.waitForIndexed(root)

      await tokenHelper.transfer(computer2.getPublicKey(), 20n, root)

      await waitForBalance(tokenHelper, publicKey, root, 180n)
      const res = await tokenHelper.balanceOf(publicKey, root)
      expect(res).to.eq(180n)
    })

    it('Should transfer random amounts to different people', async () => {
      const computer2 = new Computer({ url, chain, network })
      const computer3 = new Computer({ url, chain, network })
      const tokenHelper = new TBC20Helper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200n, 'multiple', 'MULT')
      await sender.waitForIndexed(root)
      // Keep amounts positive and within remaining balance (original allowed 0,
      // which fails transfer validation; still asserts the same balance math).
      const amount2 = BigInt(1 + Math.floor(Math.random() * 99))
      const amount3 = BigInt(1 + Math.floor(Math.random() * Number(200n - amount2)))

      await tokenHelper.transfer(computer2.getPublicKey(), amount2, root)

      await tokenHelper.transfer(computer3.getPublicKey(), amount3, root)

      const expected = 200n - amount2 - amount3
      await waitForBalance(tokenHelper, publicKey, root, expected)
      const res = await tokenHelper.balanceOf(publicKey, root)
      expect(res).to.eq(expected)

      await waitForBalance(tokenHelper, computer2.getPublicKey(), root, amount2)
      const res2 = await tokenHelper.balanceOf(computer2.getPublicKey(), root)
      expect(res2).to.eq(amount2)

      await waitForBalance(tokenHelper, computer3.getPublicKey(), root, amount3)
      const res3 = await tokenHelper.balanceOf(computer3.getPublicKey(), root)
      expect(res3).to.eq(amount3)
    })

    it('Should fail if the amount is greater than the balance', async () => {
      const computer2 = new Computer({ url, chain, network })
      const tokenHelper = new TBC20Helper(sender)
      const publicKey = tokenHelper.computer.getPublicKey()
      const root = await tokenHelper.mint(publicKey, 200n, 'test', 'TST')
      await sender.waitForIndexed(root)

      try {
        await tokenHelper.transfer(computer2.getPublicKey(), 201n, root)
        expect(true).to.eq('false')
      } catch (err) {
        expect(err.message).to.eq('Could not send entire amount')
      }
    })
  })
})
