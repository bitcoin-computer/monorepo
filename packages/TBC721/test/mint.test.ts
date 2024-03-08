import { expect } from 'chai'
import { mint } from '../src/mint'
import { NFT } from '../src/nft'
import { Computer } from '@bitcoin-computer/lib'

let computer = new Computer({
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
})

before(async () => {
  if (computer.getNetwork() === 'regtest')
    // @ts-ignore
    await computer.faucet(0.1e8)
})

describe('mint', () => {
  let nft: NFT
  before('Mint a NFT smart object', async () => {
    nft = await mint(computer, 'name', 'symbol')
  })

  it('Should mint an NFT smart object', () => {
    expect(Object.keys(nft)).deep.eq(['name', 'symbol', '_root', '_rev', '_id', '_amount', '_owners'])
  })

  it('Should set name and symbo', () => {
    expect(nft.name).eq('name')
    expect(nft.symbol).eq('symbol')
  })

  it('Should set the owner', () => {
    expect(nft._owners).deep.eq([computer.getPublicKey()])
  })
})