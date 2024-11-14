/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as chai from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import chaiMatchPattern from 'chai-match-pattern'
import { NFT, NftHelper } from '../src/nft'

chai.use(chaiMatchPattern)
const { expect } = chai

// If you want to connect to your local Bitcoin Computer Node, create a .env file
// in the monorepo root level and add the following line:
// BCN_URL=http://localhost:1031

dotenv.config({ path: '../node/.env' })

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

const artist = ''
const imageUrl = ''

const isString = (x: any) => typeof x === 'string'
const isNumber = (x: any) => typeof x === 'number'
const isArray = (x: any) => Array.isArray(x)

export const meta = {
  _id: isString,
  _rev: isString,
  _root: isString,
  _owners: isArray,
  _amount: isNumber
}

describe('NFT', () => {
  let initialId: string
  let initialRev: string
  let initialRoot: string

  describe('Using NFTs without an helper class', () => {
    let nft: NFT

    describe('Minting an NFT', () => {
      const sender = new Computer({ url, chain, network })

      before("Fund sender's wallet", async () => {
        await sender.faucet(0.001e8)
      })

      it('Sender mints an NFT', async () => {
        nft = await sender.new(NFT, ['Test'])
        // @ts-ignore
        expect(nft).matchPattern({ name: 'Test', artist, url: imageUrl, ...meta })
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

    describe('Transferring an NFT', async () => {
      const receiver = new Computer({ url, chain, network })

      it('Sender transfers the NFT to receiver', async () => {
        await nft.transfer(receiver.getPublicKey())
        // @ts-ignore
        expect(nft).to.matchPattern({ name: 'Test', artist, url: imageUrl, ...meta })
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

  describe('Using NFTs with the NftHelper class', () => {
    const computer = new Computer({ url, chain, network })

    let nftHelper: NftHelper
    let nft: NFT

    before(async () => {
      await computer.faucet(1e7)
    })

    describe('Constructor', () => {
      it('Should create a new NftHelper object', async () => {
        nftHelper = new NftHelper(computer)
        expect(nftHelper.computer).deep.eq(computer)
      })
    })

    describe('deploy', () => {
      it('Should deploy a contract', async () => {
        await nftHelper.deploy()
      })
    })

    describe('mint', () => {
      it('Should mint an NFT', async () => {
        nft = await nftHelper.mint('name', 'artist', 'url')
      })
    })

    describe('balanceOf', () => {
      it('Should return the balance', async () => {
        const balance = await nftHelper.balanceOf(computer.getPublicKey())
        expect(balance).to.be.greaterThanOrEqual(1)
      })
    })

    describe('ownerOf', () => {
      it('Should return the owner', async () => {
        const owners = await nftHelper.ownersOf(nft._id)
        expect(owners).deep.eq([computer.getPublicKey()])
      })
    })

    describe('transfer', () => {
      it('Should transfer an NFT', async () => {
        const computer2 = new Computer({ url, chain, network })
        expect(await nftHelper.balanceOf(computer.getPublicKey())).eq(1)
        expect(await nftHelper.balanceOf(computer2.getPublicKey())).eq(0)
        await nftHelper.transfer(computer2.getPublicKey(), nft._id)
        expect(await nftHelper.balanceOf(computer.getPublicKey())).eq(0)
        expect(await nftHelper.balanceOf(computer2.getPublicKey())).eq(1)
      })
    })
  })

  describe('Examples from docs', () => {
    it('Should work without the NftHelper class', async () => {
      // Create the sender wallet
      const sender = new Computer({ url, chain, network })

      // Fund the senders wallet
      await sender.faucet(0.001e8)

      // Create a new NFT
      const nft = await sender.new(NFT, [sender.getPublicKey(), 'Test'])

      // Send the NFT
      await nft.transfer(new Computer().getPublicKey())
    })

    it('Should work with the NftHelper class', async () => {
      // Create wallet
      const sender = new Computer({ url, chain, network })

      // Fund wallet
      await sender.faucet(0.001e8)

      // Create helper object
      const nftHelper = new NftHelper(sender)

      // Deploy smart contract
      await nftHelper.deploy()

      // Mint nft
      const nft = await nftHelper.mint('name', 'artist', 'url')

      // Transfer NFT
      await nftHelper.transfer(new Computer({ url, chain, network }).getPublicKey(), nft._id)
    })
  })
})
