/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721'
import dotenv from 'dotenv'
import { StaticSwap } from '../src/static-swap'
import { TxWrapperHelper } from '../src/tx-wrapper'
import { meta } from '../src/utils'

dotenv.config({ path: '../node/.env' })

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

describe('TxWrapper', () => {
  const alice = new Computer({ url, chain, network })
  const bob = new Computer({ url, chain, network })

  before('Before', async () => {
    await alice.faucet(1e8)
    await bob.faucet(0.01e8)
  })

  describe('Alice and Bob Creates and swap NFTs', () => {
    let a: NFT
    let b: NFT
    let wrappedTxId: string
    describe('Alice and Bob create the NFTs they want to swap', () => {
      it('Alice creates an NFT', async () => {
        a = await alice.new(NFT, ['A', 'AAA', 'URL'])
        // @ts-ignore
        expect(a).to.matchPattern({
          ...meta,
          name: 'A',
          artist: 'AAA',
          url: 'URL',
          _owners: [alice.getPublicKey()],
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
          _owners: [bob.getPublicKey()],
        })
      })
    })

    describe('Alice creates an offer', async () => {
      let aliceTx: any
      let txWrapperHelper: TxWrapperHelper

      before('Before creating an offer', async () => {
        txWrapperHelper = new TxWrapperHelper(alice)
      })

      it('Alice deploys the offer contract', async () => {
        await alice.faucet(0.1e8)
        await txWrapperHelper.deploy()
      })

      it('Alice builds, funds, and signs a swap transaction', async () => {
        ;({ tx: aliceTx } = await alice.encode({
          exp: `${StaticSwap} StaticSwap.exec(a, b)`,
          env: { a: a._rev, b: b._rev },
        }))
      })

      it('Alice creates an offer transaction', async () => {
        await alice.faucet(1e8)
        const { tx: wrappedTx } = await txWrapperHelper.createWrappedTx(
          bob.getPublicKey(),
          bob.getUrl(),
          aliceTx,
        )

        wrappedTxId = await alice.broadcast(wrappedTx)
        await sleep(1000)
      })
    })

    describe('Bob accepts the offer', () => {
      let txWrapperHelper
      let bobsTx: any
      let txId: string

      before('Before accepting the offer', () => {
        txWrapperHelper = new TxWrapperHelper(bob)
      })

      it('Bob syncs to the offer transaction and extracts the swap transaction', async () => {
        bobsTx = await txWrapperHelper.decodeTx(wrappedTxId)
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

  describe('Alice and Bob Creates and swap NFTs using addSaleTx', () => {
    let a: NFT
    let b: NFT
    let wrappedTxId: string
    it('Alice creates an offer and add tx using addSaleTx', async () => {
      let aliceTx: any
      let txWrapperHelper: TxWrapperHelper

      before('Before creating an offer', async () => {
        txWrapperHelper = new TxWrapperHelper(alice)
      })

      it('Alice creates an NFT', async () => {
        a = await alice.new(NFT, ['A', 'AAA', 'URL'])
        // @ts-ignore
        expect(a).to.matchPattern({
          ...meta,
          name: 'A',
          artist: 'AAA',
          url: 'URL',
          _owners: [alice.getPublicKey()],
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
          _owners: [bob.getPublicKey()],
        })
      })

      it('Alice deploys the offer contract', async () => {
        await alice.faucet(0.1e8)
        await txWrapperHelper.deploy()
      })

      it('Alice builds, funds, and signs a swap transaction', async () => {
        ;({ tx: aliceTx } = await alice.encode({
          exp: `${StaticSwap} StaticSwap.exec(a, b)`,
          env: { a: a._rev, b: b._rev },
        }))
      })

      it('Alice creates an offer transaction', async () => {
        await alice.faucet(1e8)
        const { tx: wrappedTx } = await txWrapperHelper.createWrappedTx(
          alice.getPublicKey(),
          alice.getUrl(),
        )

        wrappedTxId = await alice.broadcast(wrappedTx)

        const { tx: offerTxWithAliceTx } = await txWrapperHelper.addSaleTx(wrappedTxId, aliceTx)

        await alice.broadcast(offerTxWithAliceTx)
        await sleep(1000)
      })
    })

    it('Bob accepts the offer after alice add sale txn', () => {
      let txWrapperHelper
      let bobsTx: any
      let txId: string

      before('Before accepting the offer', () => {
        txWrapperHelper = new TxWrapperHelper(bob)
      })

      it('Bob syncs to the offer transaction and extracts the swap transaction', async () => {
        bobsTx = await txWrapperHelper.decodeTx(wrappedTxId)
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
})
