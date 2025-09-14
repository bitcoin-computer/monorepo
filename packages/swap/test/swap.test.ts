import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT, NftHelper } from '@bitcoin-computer/TBC721'
import { Token } from '@bitcoin-computer/TBC20'
import dotenv from 'dotenv'
import { Swap, SwapHelper } from '../src/swap.js'
import { meta } from '../src/utils/index.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

describe('Swap', () => {
  let nftA: NFT
  let nftB: NFT
  const url = process.env.BCN_URL
  const chain = process.env.BCN_CHAIN
  const network = process.env.BCN_NETWORK
  const alice = new Computer({ url, chain, network })
  const bob = new Computer({ url, chain, network })

  before('Before', async () => {
    await alice.faucet(10e8)
    await bob.faucet(10e8)
  })

  describe('Examples from docs', () => {
    it('Should work without helper classes', async () => {
      // Alice and Bob create one NFT each
      nftA = await alice.new(NFT, ['a', 'AAA', 'URL'])
      nftB = await bob.new(NFT, ['b', 'BBB', 'URL'])

      // Alice builds a partially signed swap transaction
      const { tx } = await alice.encode({
        exp: `${Swap} new Swap(nftA, nftB)`,
        env: { nftA: nftA._rev as string, nftB: nftB._rev as string },
      })

      // Bob signs and broadcasts the swap transaction
      await bob.sign(tx)
      await bob.broadcast(tx)
    })

    it('Should work with helper classes', async () => {
      // Alice creates helper objects
      const nftHelperA = new NftHelper(alice)
      const swapHelperA = new SwapHelper(alice)

      // Alice deploys the smart contracts
      await nftHelperA.deploy()
      await swapHelperA.deploy()

      // Alice mints an NFT
      nftA = await nftHelperA.mint('a', 'AAA', 'URL')

      // Bob creates helper objects from the module specifiers
      const nftHelperB = new NftHelper(bob, nftHelperA.mod)
      const swapHelperB = new SwapHelper(bob, swapHelperA.mod)

      // Bob mints an NFT to pay for Alice's's NFT
      nftB = await nftHelperB.mint('b', 'BBB', 'URL')

      // Bob creates a swap transaction
      const { tx } = await swapHelperB.createSwapTx(nftA, nftB)

      // Alice checks the swap transaction
      await swapHelperA.checkSwapTx(tx, alice.getPublicKey(), bob.getPublicKey())

      // Alice signs an broadcasts the transaction to execute the swap
      await alice.sign(tx)
      await alice.broadcast(tx)

      // Bob reads the updated state from the blockchain
      const {
        env: { a, b },
      } = (await bob.sync(tx.getId())) as { env: { a: NFT; b: NFT } }
      expect(a.name).deep.eq('a')
      expect(a.getOwners()).deep.eq([bob.getPublicKey()])
      expect(b.name).deep.eq('b')
      expect(b.getOwners()).deep.eq([alice.getPublicKey()])
    })
  })

  describe('Creating two NFTs to be swapped', () => {
    it('Alice creates an NFT', async () => {
      nftA = await alice.new(NFT, ['A', 'AAA', 'URL'])
      expect(nftA).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [alice.getPublicKey()],
      })
    })

    it('Bob creates an NFT', async () => {
      nftB = await bob.new(NFT, ['B', 'BBB', 'URL'])
      expect(nftB).to.matchPattern({
        ...meta,
        name: 'B',
        artist: 'BBB',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })
    })
  })

  describe('Executing a swap', async () => {
    let tx: any
    let txId: string
    let swapHelper: SwapHelper

    before('Before creating an offer', async () => {
      swapHelper = new SwapHelper(alice)
    })

    it('Alice deploys a swap contract', async () => {
      await swapHelper.deploy()
    })

    it('Alice builds, funds, and signs a swap transaction', async () => {
      ;({ tx } = await swapHelper.createSwapTx(nftA, nftB))
    })

    it('Bob checks the swap transaction', async () => {
      await swapHelper.checkSwapTx(tx, alice.getPublicKey(), bob.getPublicKey())
    })

    it('Bob signs the swap transaction', async () => {
      await bob.sign(tx)
    })

    it('Bob broadcasts the swap transaction', async () => {
      txId = await bob.broadcast(tx)
      expect(txId).not.undefined
    })

    it('a is now owned by Bob', async () => {
      const { env } = (await bob.sync(txId)) as { env: { a: NFT; b: NFT } }
      const aSwapped = env.a
      expect(aSwapped).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })
    })

    it('b is now owned by Alice', async () => {
      const { env } = (await alice.sync(txId)) as { env: { a: NFT; b: NFT } }
      const bSwapped = env.b
      expect(bSwapped).to.matchPattern({
        ...meta,
        name: 'B',
        artist: 'BBB',
        url: 'URL',
        _owners: [alice.getPublicKey()],
      })
    })
  })

  describe('Should work with fungible tokens', async () => {
    it('Should work for tokens', async () => {
      // Alice and Bob create one NFT each
      const tokenA = await alice.new(Token, [alice.getPublicKey(), 10n, 'A'])
      const tokenB = await bob.new(Token, [bob.getPublicKey(), 100n, 'B'])

      // Alice builds a partially signed swap transaction
      const { tx } = await alice.encode({
        exp: `${Swap} new Swap(tA, tB)`,
        env: { tA: tokenA._rev as string, tB: tokenB._rev as string },
      })

      // Bob signs and broadcasts the swap transaction
      await bob.sign(tx)
      const txId = await bob.broadcast(tx)
      expect(txId).a.string

      const {
        env: { tA, tB },
      } = (await alice.sync(txId)) as { env: { tA: Token; tB: Token } }
      // const { tA, tB } = env
      expect(tA._owners).deep.eq([bob.getPublicKey()])
      expect(tB._owners).deep.eq([alice.getPublicKey()])

      expect(tA.amount).eq(10n)
      expect(tB.amount).eq(100n)
    })
  })
})
