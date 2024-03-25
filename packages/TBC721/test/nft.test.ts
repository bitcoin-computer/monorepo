/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as chai from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import chaiMatchPattern from 'chai-match-pattern'
import { NFT, TBC721 } from '../src/nft'

const { expect } = chai
chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

/**
 * To run the tests with the Bitcoin Computer testnet node remove the opts argument.
 */
const RLTC: {
  network: 'regtest'
  url: string
} = {
  network: 'regtest',
  url: 'http://localhost:1031',
}

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

  describe('Using NFTs without an helper class', () => {
    describe('Minting an NFT', () => {
      const sender = new Computer(RLTC)
      
      before("Fund sender's wallet", async () => {
        await sender.faucet(0.001e8)
      })
  
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
  
    describe('Transferring an NFT', async () => {
      const receiver = new Computer(RLTC)
  
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

  describe('Using NFTs with the TBC721 helper class', () => {
    const computer = new Computer(RLTC)
    
    let tbc721
    let nft
    
    before(async () => {
      await computer.faucet(1e7)
    })
    
    describe('Constructor', () => {
      it('Should create a new TBC721 object', async () => {
        tbc721 = new TBC721(computer)
        expect(tbc721.computer).deep.eq(computer)
      })
    })
  
    describe('deploy', () => {
      it('Should deploy a contract', async () => {
        await tbc721.deploy()
      })
    })
  
    describe('mint', () => {
      it('Should mint an NFT', async () => {
        nft = await tbc721.mint('name', 'symbol')
      })
    })
  
    describe('balanceOf', () => {
      it('Should return the balance', async () => {
        const balance = await tbc721.balanceOf(computer.getPublicKey())
        expect(balance).to.be.greaterThanOrEqual(1)
      })
    })
  
    describe('ownerOf', () => {
      it('Should return the owner', async () => {
        const owners = await tbc721.ownersOf(nft._id)
        expect(owners).deep.eq([computer.getPublicKey()])
      })
    })
  
    describe('transfer', () => {
      it('Should transfer an NFT', async () => {
        const computer2 = new Computer()
        const nft2 = await tbc721.mint('name', 'symbol')
        const publicKey2 = computer2.getPublicKey()
        await tbc721.transfer(nft2._id, publicKey2)
        const res = await tbc721.balanceOf(computer.getPublicKey())
        expect(res).to.be.greaterThanOrEqual(1)
      })
    })
  })

  describe('Examples from docs', () => {
    it('Should work without the TBC721 helper class', async () => {
      // Create the sender wallet
      const sender = new Computer(RLTC)

      // Fund the senders wallet
      await sender.faucet(0.001e8)

      // Create a new NFT
      const nft = await sender.new(NFT, [sender.getPublicKey(), 'Test'])

      // Send the NFT
      await nft.transfer(new Computer().getPublicKey())
    })

    it('Should work with the TBC721 helper class', async () => {
      // Create wallet
      const sender = new Computer(RLTC)

      // Fund wallet
      await sender.faucet(0.001e8)

      // Create helper object
      const tbc721 = new TBC721(sender)

      // Deploy smart contract
      await tbc721.deploy()

      // Mint nft
      nft = await tbc721.mint('name', 'symbol')

      // Transfer NFT
      await tbc721.transfer(nft._id, new Computer().getPublicKey())
    })
  })
})


