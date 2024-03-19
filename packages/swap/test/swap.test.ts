/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { NFT, TBC721 } from '@bitcoin-computer/TBC721/src/nft'
import { SwapHelper } from '../src/swap'
import { meta } from '../src/utils'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env'})

const url = process.env.BCN_URL

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

describe('Static Swap', () => {
  let a: NFT
  let b: NFT
  const alice = new Computer({ url })
  const bob = new Computer({ url })

  before('Before', async () => {
    await alice.faucet(0.01e8)
    await bob.faucet(0.01e8)
  })

  describe('Example from docs', () => {
    it('Should work', async () => {
      // Alice creates helper objects
      const tbc721A = new TBC721(alice)
      const swapHelperA = new SwapHelper(alice)

      // Alice deploys the smart contracts
      await tbc721A.deploy()
      await swapHelperA.deploy()

      // Alice mints an NFT
      const nftA = await tbc721A.mint('a', 'AAA')

      // Bob creates helper objects from the module specifiers
      const tbc721B = new TBC721(bob, tbc721A.mod)
      const swapHelperB = new SwapHelper(bob, swapHelperA.mod)

      // Bob mints an NFT to pay for Alice's's NFT
      const nftB = await tbc721B.mint('b', 'BBB')

      // Bob creates a swap transaction
      const { tx } = await swapHelperB.createSwapTx(nftA, nftB)

      // Alice checks the swap transaction
      swapHelperA.checkSwapTx(tx, bob.getPublicKey(), alice.getPublicKey())

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
      a = await alice.new(NFT, ['A', 'AAA'])
      // @ts-ignore
      expect(a).to.matchPattern({
        ...meta,
        name: 'A',
        symbol: 'AAA',
        _owners: [alice.getPublicKey()],
      })
    })

    it('Bob creates an NFT', async () => {
      b = await bob.new(NFT, ['B', 'BBB'])
      // @ts-ignore
      expect(b).to.matchPattern({
        ...meta,
        name: 'B',
        symbol: 'BBB',
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
      ;({ tx } = await swapHelper.createSwapTx(a, b))
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
        symbol: 'AAA',
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
        symbol: 'BBB',
        _owners: [alice.getPublicKey()],
      })
    })
  })
})
