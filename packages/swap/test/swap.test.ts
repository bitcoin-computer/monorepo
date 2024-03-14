/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { Swap, SwapHelper } from '../src/swap'

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

describe.only('Static Swap', () => {
  let a: NFT
  let b: NFT
  const alice = new Computer(RLTC)
  const bob = new Computer(RLTC)

  before('Before', async () => {
    await alice.faucet(0.01e8)
    await bob.faucet(0.001e8)
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

    it('Bob checks and signs the swap transaction', async () => {
      const decoded = await bob.decode(tx)
      expect(decoded.exp).eq(`Swap.exec(a, b)`)

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
