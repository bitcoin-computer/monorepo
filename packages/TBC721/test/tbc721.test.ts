/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '../src/nft'
import { TBC721 } from '../src/tbc721'
import { mint } from '../src/mint'
import { deploy } from '../src/deploy'

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * To run the tests with the Bitcoin Computer testnet node remove the opts argument.
 */
const computer = new Computer({
  url: 'http://127.0.0.1:1031',
  network: 'regtest' as any,
})

let mod

before(async () => {
  await computer.faucet(1e7)
  mod = await deploy(computer)
})

describe('TBC721', () => {
  describe('Constructor', () => {
    it('Should create a new TBC721 object', async () => {
      const tbc721 = new TBC721(computer, mod)
      expect(tbc721.computer).deep.eq(computer)
    })
  })

  describe('balanceOf', () => {
    it('Should compute the balance', async () => {
      const tbc721 = new TBC721(computer, mod)
      await mint(computer, 'name', 'symbol', mod)
      await sleep(500)
      const balance = await tbc721.balanceOf(computer.getPublicKey())
      expect(balance).to.be.greaterThanOrEqual(1)
    })
  })

  describe('ownerOf', () => {
    it('Should compute the balance', async () => {
      const tbc721 = new TBC721(computer, mod)
      const nft = await mint(computer, 'name', 'symbol', mod)
      await sleep(500)
      const owners = await tbc721.ownersOf(nft._id)
      expect(owners).deep.eq([computer.getPublicKey()])
    })
  })

  describe('transfer', () => {
    it('Should transfer an NFT', async () => {
      const computer2 = new Computer()
      const tbc721 = new TBC721(computer, mod)
      const nft = await mint(computer, 'name', 'symbol', mod)
      const publicKey2 = computer2.getPublicKey()
      await sleep(500)
      await tbc721.transfer(publicKey2, nft._id)
      const res = await tbc721.balanceOf(computer.getPublicKey())
      expect(res).to.be.greaterThanOrEqual(1)
    })
  })
})
