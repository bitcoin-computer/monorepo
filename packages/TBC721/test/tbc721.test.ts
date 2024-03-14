/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { TBC721 } from '../src/tbc721'

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
  })

/**
 * To run the tests with the Bitcoin Computer testnet node remove the opts argument.
 */
const computer = new Computer({
  url: 'http://127.0.0.1:1031',
  network: 'regtest',
})

let tbc721
let nft

before(async () => {
  await computer.faucet(1e7)
})

describe('TBC721', () => {
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
    it('Should compute the balance', async () => {
      await sleep(500)
      const balance = await tbc721.balanceOf(computer.getPublicKey())
      expect(balance).to.be.greaterThanOrEqual(1)
    })
  })

  describe('ownerOf', () => {
    it('Should compute the balance', async () => {
      const owners = await tbc721.ownersOf(nft._id)
      expect(owners).deep.eq([computer.getPublicKey()])
    })
  })

  describe('transfer', () => {
    it('Should transfer an NFT', async () => {
      const computer2 = new Computer()
      const nft2 = await tbc721.mint('name', 'symbol')
      const publicKey2 = computer2.getPublicKey()
      await sleep(500)
      await tbc721.transfer(publicKey2, nft2._id)
      const res = await tbc721.balanceOf(computer.getPublicKey())
      expect(res).to.be.greaterThanOrEqual(1)
    })
  })
})
