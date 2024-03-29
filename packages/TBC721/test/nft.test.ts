/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as chai from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import chaiMatchPattern from 'chai-match-pattern'
import { NFT } from '../src/nft'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env'})

const url = process.env.BCN_URL

const { expect } = chai
chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const meta = {
  _id: _.isString,
  _rev: _.isString,
  _root: _.isString,
  _owners: _.isArray,
  _amount: _.isNumber,
}

const symbol = ''

describe('NFT', () => {
  let nft: NFT
  let initialId: string
  let initialRev: string
  let initialRoot: string
  const sender = new Computer({ url })
  const receiver = new Computer({ url })

  before("Fund sender's wallet", async () => {
    await sender.faucet(0.001e8)
  })

  describe('Constructor', () => {
    it('Sender mints an NFT', async () => {
      nft = await sender.new(NFT, ['Test'])
      // @ts-ignore
      expect(nft).matchPattern({ name: 'Test', symbol, ...meta })
    })

    it('Property _owners is a singleton array with minters public key', () => {
      expect(nft._owners).deep.eq([sender.getPublicKey()])
    })

    it('Properties _id, _rev, and _root have the same value', () => {
      expect(nft._id).eq(nft._rev).eq(nft._root)

      initialId = nft._id
      initialRev = nft._rev
      initialRoot = nft._root
    })

    it("The nft is returned when syncing against it's revision", async () => {
      expect(await sender.sync(nft._rev)).deep.eq(nft)
    })
  })

  describe('transfer', async () => {
    it('Sender transfers the NFT to receiver', async () => {
      await nft.transfer(receiver.getPublicKey())
      // @ts-ignore
      expect(nft).to.matchPattern({ name: 'Test', symbol, ...meta })
    })

    it('The id does not change', () => {
      expect(initialId).eq(nft._id)
    })

    it('The revision is updated', () => {
      expect(initialRev).not.eq(nft._rev)
    })

    it('The root does not change', () => {
      expect(initialRoot).eq(nft._root)
    })

    it("The _owners are updated to receiver's public key", () => {
      expect(nft._owners).deep.eq([receiver.getPublicKey()])
    })

    it("Syncing to the NFT's revision returns an object that is equal to the NFT", async () => {
      expect(await receiver.sync(nft._rev)).deep.eq(nft)
    })
  })
})
