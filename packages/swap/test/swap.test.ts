/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT, TBC721 } from '@bitcoin-computer/TBC721/src/nft'
import { Swap, SwapHelper } from '../src/swap'
import { RLTC, meta } from '../src/utils'

describe.only('Swap', () => {
  let nftA: NFT
  let nftB: NFT
  const alice = new Computer(RLTC)
  const bob = new Computer(RLTC)

  before('Before', async () => {
    await alice.faucet(0.01e8)
    await bob.faucet(0.01e8)
  })

  describe('Examples from docs', () => {
    it('Should work without helper classes', async () => {
      // Alice and Bob create one NFT each
      nftA = await alice.new(NFT, ['a', 'AAA'])
      nftB = await bob.new(NFT, ['b', 'BBB'])

      // Alice builds a partially signed swap transaction
      const { tx } = await alice.encode({
        exp: `${Swap} new Swap(nftA, nftB)`,
        env: { nftA: nftA._rev, nftB: nftB._rev },
      })

      // Bob signs and broadcasts the swap transaction
      await bob.sign(tx)
      await bob.broadcast(tx)
    })

    it('Should work with helper classes', async () => {
      // Alice creates helper objects
      const tbc721A = new TBC721(alice)
      const swapHelperA = new SwapHelper(alice)

      // Alice deploys the smart contracts
      await tbc721A.deploy()
      await swapHelperA.deploy()

      // Alice mints an NFT
      nftA = await tbc721A.mint('a', 'AAA')

      // Bob creates helper objects from the module specifiers
      const tbc721B = new TBC721(bob, tbc721A.mod)
      const swapHelperB = new SwapHelper(bob, swapHelperA.mod)

      // Bob mints an NFT to pay for Alice's's NFT
      nftB = await tbc721B.mint('b', 'BBB')

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
      nftA = await alice.new(NFT, ['A', 'AAA'])
      // @ts-ignore
      expect(nftA).to.matchPattern({
        ...meta,
        name: 'A',
        symbol: 'AAA',
        _owners: [alice.getPublicKey()],
      })
    })

    it('Bob creates an NFT', async () => {
      nftB = await bob.new(NFT, ['B', 'BBB'])
      // @ts-ignore
      expect(nftB).to.matchPattern({
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
