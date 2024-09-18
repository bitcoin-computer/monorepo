/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import dotenv from 'dotenv'
import { StaticSwap } from '../src/static-swap'
import { OfferHelper } from '../src/offer'
import { meta } from '../src/utils'

dotenv.config({ path: '../../.env' })

const url = process.env.BCN_URL

const sleep = async (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

describe('Offer', () => {
  const alice = new Computer({ url })
  const bob = new Computer({ url })

  before('Before', async () => {
    await alice.faucet(1e8)
    await bob.faucet(0.01e8)
  })

  describe('Alice and Bob Creates and swap NFTs', () => {
    let a: NFT
    let b: NFT
    let offerTxId: string
    describe('Alice and Bob create the NFTs they want to swap', () => {
      it('Alice creates an NFT', async () => {
        a = await alice.new(NFT, ['A', 'AAA', 'URL'])
        // @ts-ignore
        expect(a).to.matchPattern({
          ...meta,
          name: 'A',
          artist: 'AAA',
          url: 'URL',
          _owners: [alice.getPublicKey()]
        })
      })

      it('Bob creates b', async () => {
        b = await bob.new(NFT, ['B', 'BBB', 'URL'])
        // @ts-ignore
        expect(b).to.matchPattern({
          ...meta,
          name: 'B',
          artist: 'BBB',
          url: 'URL',
          _owners: [bob.getPublicKey()]
        })
      })
    })

    describe('Alice creates an offer', async () => {
      let aliceTx: any
      let offerHelper: OfferHelper

      before('Before creating an offer', async () => {
        offerHelper = new OfferHelper(alice)
      })

      it('Alice deploys the offer contract', async () => {
        await alice.faucet(0.1e8)
        await offerHelper.deploy()
      })

      it('Alice builds, funds, and signs a swap transaction', async () => {
        ;({ tx: aliceTx } = await alice.encode({
          exp: `${StaticSwap} StaticSwap.exec(a, b)`,
          env: { a: a._rev, b: b._rev }
        }))
      })

      it('Alice creates an offer transaction', async () => {
        await alice.faucet(1e8)
        const { tx: offerTx } = await offerHelper.createOfferTx(
          bob.getPublicKey(),
          bob.getUrl(),
          aliceTx
        )

        offerTxId = await alice.broadcast(offerTx)
        await sleep(1000)
      })
    })

    describe('Bob accepts the offer', () => {
      let offerHelper
      let bobsTx: any
      let txId: string

      before('Before accepting the offer', () => {
        offerHelper = new OfferHelper(bob)
      })

      it('Bob syncs to the offer transaction and extracts the swap transaction', async () => {
        bobsTx = await offerHelper.decodeOfferTx(offerTxId)
      })

      it('Bob signs the swap transaction', async () => {
        await bob.sign(bobsTx)
      })

      it('Bob broadcasts the swap transaction', async () => {
        txId = await bob.broadcast(bobsTx)
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
          _owners: [bob.getPublicKey()]
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
          _owners: [alice.getPublicKey()]
        })
      })
    })
  })

  describe('Alice and Bob Creates and swap NFTs using addSaleTx', () => {
    let a: NFT
    let b: NFT
    let offerTxId: string
    it('Alice creates an offer and add tx using addSaleTx', async () => {
      let aliceTx: any
      let offerHelper: OfferHelper

      before('Before creating an offer', async () => {
        offerHelper = new OfferHelper(alice)
      })

      it('Alice creates an NFT', async () => {
        a = await alice.new(NFT, ['A', 'AAA', 'URL'])
        // @ts-ignore
        expect(a).to.matchPattern({
          ...meta,
          name: 'A',
          artist: 'AAA',
          url: 'URL',
          _owners: [alice.getPublicKey()]
        })
      })

      it('Bob creates b', async () => {
        b = await bob.new(NFT, ['B', 'BBB', 'URL'])
        // @ts-ignore
        expect(b).to.matchPattern({
          ...meta,
          name: 'B',
          artist: 'BBB',
          url: 'URL',
          _owners: [bob.getPublicKey()]
        })
      })

      it('Alice deploys the offer contract', async () => {
        await alice.faucet(0.1e8)
        await offerHelper.deploy()
      })

      it('Alice builds, funds, and signs a swap transaction', async () => {
        ;({ tx: aliceTx } = await alice.encode({
          exp: `${StaticSwap} StaticSwap.exec(a, b)`,
          env: { a: a._rev, b: b._rev }
        }))
      })

      it('Alice creates an offer transaction', async () => {
        await alice.faucet(1e8)
        const { tx: offerTx } = await offerHelper.createOfferTx(
          alice.getPublicKey(),
          alice.getUrl()
        )

        offerTxId = await alice.broadcast(offerTx)

        const { tx: offerTxWithAliceTx } = await offerHelper.addSaleTx(offerTxId, aliceTx)

        await alice.broadcast(offerTxWithAliceTx)
        await sleep(1000)
      })
    })

    it('Bob accepts the offer after alice add sale txn', () => {
      let offerHelper
      let bobsTx: any
      let txId: string

      before('Before accepting the offer', () => {
        offerHelper = new OfferHelper(bob)
      })

      it('Bob syncs to the offer transaction and extracts the swap transaction', async () => {
        bobsTx = await offerHelper.decodeOfferTx(offerTxId)
      })

      it('Bob signs the swap transaction', async () => {
        await bob.sign(bobsTx)
      })

      it('Bob broadcasts the swap transaction', async () => {
        txId = await bob.broadcast(bobsTx)
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
          _owners: [bob.getPublicKey()]
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
          _owners: [alice.getPublicKey()]
        })
      })
    })
  })
})
