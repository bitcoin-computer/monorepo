import { expect } from 'chai'
import { Computer, SmartContract } from '@bitcoin-computer/lib'
import { NFT, NftHelper } from '@bitcoin-computer/TBC721'

import dotenv from 'dotenv'
import { StaticSwapHelper } from '../src/static-swap.js'
import { meta } from '../src/utils/index.js'
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

describe('Static Swap', () => {
  let nftA: NFT
  let nftB: NFT
  const alice = new Computer({ url, chain, network })
  const bob = new Computer({ url, chain, network })

  before('Fund Alice and Bob', async () => {
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

      // Bob mints an NFT to pay for Alice's NFT
      nftB = await nftHelperB.mint('b', 'BBB', 'URL')

      // Bob creates a swap transaction
      const { tx } = await swapHelperB.createSwapTx(nftA, nftB)

      // Alice checks the swap transaction
      await swapHelperA.checkSwapTx(tx, alice.getPublicKey(), bob.getPublicKey())

      // Alice signs and broadcasts the transaction to execute the swap
      await alice.sign(tx)
      await alice.broadcast(tx)

      // Bob reads the updated state from the blockchain
      const { env } = await bob.sync(tx.getId())
      const a = env.a as SmartContract<typeof NFT>
      const b = env.b as SmartContract<typeof NFT>
      expect(a.name).deep.eq('a')
      expect(a._owners).deep.eq([bob.getPublicKey()])
      expect(b.name).deep.eq('b')
      expect(b._owners).deep.eq([alice.getPublicKey()])
    })
  })

  describe('Creating two NFTs to be swapped', () => {
    before('Create two NFTs to be swapped', async () => {
      nftA = await alice.new(NFT, ['A', 'AAA', 'URL'])
      nftB = await bob.new(NFT, ['B', 'BBB', 'URL'])
    })

    it('Alice creates an NFT', async () => {
      expect(nftA).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [alice.getPublicKey()],
      })
    })

    it('Bob creates an NFT', async () => {
      expect(nftB).to.matchPattern({
        ...meta,
        name: 'B',
        artist: 'BBB',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })
    })
  })

  describe('Executing a swap', () => {
    let tx: any
    let txId: string
    let swapHelper: StaticSwapHelper

    before('Before creating an offer', async () => {
      swapHelper = new StaticSwapHelper(alice)
      await swapHelper.deploy()
    })

    it('Executes the swap', async () => {
      // Alice builds, funds, and signs a swap transaction
      ;({ tx } = await swapHelper.createSwapTx(nftA, nftB))

      // Bob checks the swap transaction
      await swapHelper.checkSwapTx(tx, alice.getPublicKey(), bob.getPublicKey())

      // Bob signs the swap transaction
      await bob.sign(tx)

      // Bob broadcasts the swap transaction
      txId = await bob.broadcast(tx)
      expect(txId).not.undefined

      // a is now owned by Bob
      const { env } = await bob.sync(txId)
      const aSwapped = env.a
      expect(aSwapped).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })

      // b is now owned by Alice
      const { env: env2 } = await alice.sync(txId)
      const bSwapped = env2.b
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
