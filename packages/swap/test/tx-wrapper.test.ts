import { expect, assert } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721'
import dotenv from 'dotenv'
import { StaticSwap } from '../src/static-swap.js'
import { TxWrapperHelper } from '../src/tx-wrapper.js'
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

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

describe('TxWrapper', () => {
  describe('Alice and Bob Creates and swap NFTs', () => {
    let alice: Computer
    let bob: Computer
    let a: NFT
    let b: NFT
    let wrappedTxId: string

    before('Create NFTs and Alice offer', async () => {
      alice = new Computer({ url, chain, network })
      bob = new Computer({ url, chain, network })
      const u1 = await alice.faucet(2e8)
      const u2 = await bob.faucet(2e8)
      await alice.waitForIndexed(u1.txId)
      await bob.waitForIndexed(u2.txId)

      a = await alice.new(NFT, ['A', 'AAA', 'URL'])
      expect(a).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [alice.getPublicKey()],
      })

      b = await bob.new(NFT, ['B', 'BBB', 'URL'])
      expect(b).to.matchPattern({
        ...meta,
        name: 'B',
        artist: 'BBB',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })

      const txWrapperHelper = new TxWrapperHelper(alice)

      const u3 = await alice.faucet(0.1e8)
      await alice.waitForIndexed(u3.txId)
      await txWrapperHelper.deploy()

      const { tx: aliceTx } = await alice.encode({
        exp: `${StaticSwap} StaticSwap.exec(a, b)`,
        env: { a: a._rev, b: b._rev },
      })

      const u4 = await alice.faucet(1e8)
      await alice.waitForIndexed(u4.txId)
      const { tx: wrappedTx } = await txWrapperHelper.createWrappedTx(
        bob.getPublicKey(),
        bob.getUrl(),
        aliceTx,
      )

      wrappedTxId = await alice.broadcast(wrappedTx)
      await alice.waitForIndexed(wrappedTx.txId)
    })

    it('Bob accepts the offer', async () => {
      const u = await bob.faucet(1e8)
      await bob.waitForIndexed(u.txId)
      const txWrapperHelper = new TxWrapperHelper(bob)
      const bobsTx = await txWrapperHelper.decodeTx(wrappedTxId)

      await bob.sign(bobsTx)

      const txId = await bob.broadcast(bobsTx)
      assert.isDefined(txId)

      const { env: envBob } = await bob.sync(txId)
      const aSwapped = envBob.a
      expect(aSwapped).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })

      const { env: envAlice } = await alice.sync(txId)
      const bSwapped = envAlice.b
      expect(bSwapped).to.matchPattern({
        ...meta,
        name: 'B',
        artist: 'BBB',
        url: 'URL',
        _owners: [alice.getPublicKey()],
      })
    })
  })

  describe('Alice and Bob Creates and swap NFTs using addSaleTx', () => {
    let alice: Computer
    let bob: Computer
    let a: NFT
    let b: NFT
    let wrappedTxId: string

    before('Alice creates offer using addSaleTx', async () => {
      alice = new Computer({ url, chain, network })
      bob = new Computer({ url, chain, network })
      const fu1 = await alice.faucet(2e8)
      const fu2 = await bob.faucet(2e8)
      await alice.waitForIndexed(fu1.txId)
      await bob.waitForIndexed(fu2.txId)

      const txWrapperHelper = new TxWrapperHelper(alice)

      a = await alice.new(NFT, ['A', 'AAA', 'URL'])
      expect(a).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [alice.getPublicKey()],
      })

      b = await bob.new(NFT, ['B', 'BBB', 'URL'])
      expect(b).to.matchPattern({
        ...meta,
        name: 'B',
        artist: 'BBB',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })

      const u1 = await alice.faucet(0.1e8)
      await alice.waitForIndexed(u1.txId)
      await txWrapperHelper.deploy()

      // Create the empty wrapper before encoding the sale tx. Otherwise later
      // funding can spend fee inputs already locked into aliceTx.
      const u2 = await alice.faucet(1e8)
      await alice.waitForIndexed(u2.txId)
      const { tx: wrappedTx } = await txWrapperHelper.createWrappedTx(
        alice.getPublicKey(),
        alice.getUrl(),
      )

      wrappedTxId = await alice.broadcast(wrappedTx)
      await alice.waitForIndexed(wrappedTxId)

      const u3 = await alice.faucet(1e8)
      await alice.waitForIndexed(u3.txId)
      const { tx: aliceTx } = await alice.encode({
        exp: `${StaticSwap} StaticSwap.exec(a, b)`,
        env: { a: a._rev, b: b._rev },
      })

      const { tx: offerTxWithAliceTx } = await txWrapperHelper.addSaleTx(wrappedTxId, aliceTx)

      await alice.broadcast(offerTxWithAliceTx)
      await alice.waitForIndexed(offerTxWithAliceTx.txId)
    })

    it('Bob accepts the offer after alice add sale txn', async () => {
      const u = await bob.faucet(1e8)
      await bob.waitForIndexed(u.txId)
      const txWrapperHelper = new TxWrapperHelper(bob)
      const bobsTx = await txWrapperHelper.decodeTx(wrappedTxId)

      await bob.sign(bobsTx)

      const txId = await bob.broadcast(bobsTx)
      expect(txId).not.undefined

      const { env: envBob } = await bob.sync(txId)
      const aSwapped = envBob.a
      expect(aSwapped).to.matchPattern({
        ...meta,
        name: 'A',
        artist: 'AAA',
        url: 'URL',
        _owners: [bob.getPublicKey()],
      })

      const { env: envAlice } = await alice.sync(txId)
      const bSwapped = envAlice.b
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
