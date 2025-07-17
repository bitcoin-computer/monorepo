 
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT, NftHelper } from '@bitcoin-computer/TBC721'

import dotenv from 'dotenv'
import { StaticSwapHelper } from '../src/static-swap.js'
import { meta } from '../src/utils/index.js'

dotenv.config({ path: '../node/.env' })

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

describe('Static Swap', () => {
  let nftA: NFT
  let nftB: NFT
  const alice = new Computer({ url, chain, network })
  const bob = new Computer({ url, chain, network })

  before('Before', async () => {
    await alice.faucet(1e8)
    await bob.faucet(1e8)
  })

  describe('Example from docs', () => {
    it('Should work', async () => {
      // Alice creates helper objects
      const nftHelperA = new NftHelper(alice)
      const swapHelperA = new StaticSwapHelper(alice)

      // Alice deploys the smart contracts
      await nftHelperA.deploy()
      await swapHelperA.deploy()

      // Alice mints an NFT
      nftA = await nftHelperA.mint('a', 'AAA', 'URL')

      // Bob creates helper objects from the module specifiers
      const nftHelperB = new NftHelper(bob, nftHelperA.mod)
      const swapHelperB = new StaticSwapHelper(bob, swapHelperA.mod)

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
      expect(a._owners).deep.eq([bob.getPublicKey()])
      expect(b.name).deep.eq('b')
      expect(b._owners).deep.eq([alice.getPublicKey()])
    })
  })

  describe('Creating two NFTs to be swapped', () => {
    it('Alice creates an NFT', async () => {
      nftA = await alice.new(NFT, ['A', 'AAA', 'URL'])
      // @ts-ignore
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
      // @ts-ignore
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
    let swapHelper: StaticSwapHelper

    before('Before creating an offer', async () => {
      swapHelper = new StaticSwapHelper(alice)
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
      // @ts-ignore
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
      // @ts-ignore
      expect(bSwapped).to.matchPattern({
        ...meta,
        name: 'B',
        artist: 'BBB',
        url: 'URL',
        _owners: [alice.getPublicKey()],
      })
    })
  })
})
