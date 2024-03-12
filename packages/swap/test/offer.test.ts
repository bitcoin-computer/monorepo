/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import chai, { expect } from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { Transaction } from '@bitcoin-computer/nakamotojs'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { Swap } from '../src/swap'
import { Offer } from '../src/offer'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const RLTC: {
  network: 'regtest'
  chain: 'LTC'
  url: string
} = {
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
}

const meta = {
  _id: _.isString,
  _rev: _.isString,
  _root: _.isString,
  _owners: _.isArray,
  _amount: _.isNumber,
}

describe('Offer', () => {
  let a: NFT
  let b: NFT
  const alice = new Computer(RLTC)
  const bob = new Computer(RLTC)
  let offerId: string

  before('Before', async () => {
    // @ts-ignore
    await alice.faucet(1e8)
    // @ts-ignore
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

    it('Alice builds, funds, and signs a swap transaction', async () => {
      // @ts-ignore
      ;({ tx: aliceTx } = await alice.encode({
        exp: `${Swap} Swap.exec(a, b)`,
        env: { a: a._rev, b: b._rev },
      }))
    })

    it('Alice creates an offer transaction', async () => {
      // @ts-ignore
      await alice.faucet(1e8)
      // @ts-ignore
      const { tx: offerTx } = await alice.encode({
        exp: `${Offer} new Offer("${bob.getPublicKey()}", "${(bob as any).getUrl()}", "${aliceTx.serialize()}")`,
        exclude: aliceTx.getInRevs(),
      })
      offerId = await alice.broadcast(offerTx)
    })
  })

  describe('Bob accepts the offer', () => {
    let bobsTx: any
    let txId: string

    it('Bob syncs to the offer transaction and extracts the swap transaction', async () => {
      const { res: syncedOffer } = (await bob.sync(offerId)) as { res: { json: string } }
      const { json } = syncedOffer
      bobsTx = Transaction.deserialize(json)
    })

    it('Bob signs the swap transaction', async () => {
      // @ts-ignore
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
