/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { StaticSwap } from '../src/static-swap'
import { OfferHelper } from '../src/offer'
import { RLTC, meta } from '../src/utils'

describe('Offer', () => {
  let a: NFT
  let b: NFT
  const alice = new Computer(RLTC)
  const bob = new Computer(RLTC)
  let offerId: string

  before('Before', async () => {
    await alice.faucet(1e8)
    await bob.faucet(0.001e8)
  })

  describe('Alice and Bob create the NFTs they want to swap', () => {
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

    it('Bob creates b', async () => {
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

  describe('Alice creates an offer', async () => {
    let aliceTx: any
    let offerHelper

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
        env: { a: a._rev, b: b._rev },
      }))
    })

    it('Alice creates an offer transaction', async () => {
      await alice.faucet(1e8)
      const { tx: offerTx } = await offerHelper.createOfferTx(
        bob.getPublicKey(),
        bob.getUrl(),
        aliceTx,
      )
      offerId = await alice.broadcast(offerTx)
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
      bobsTx = await offerHelper.decodeOfferTx(offerId)
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
