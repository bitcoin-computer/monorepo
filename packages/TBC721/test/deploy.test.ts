import { deploy } from '../src/deploy'
import chai, { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'

let computer = new Computer({
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
})

describe('deploy', () => {
  let rev: string
  before('Deploying smart contract', async () => {
    rev = await deploy(computer)
  })

  it('Should return a string', async () => {
    expect(rev).a.string
  })

  it('Should point to the correct smart contract', async () => {
    // @ts-ignore
    const { NFT } = await computer.load(rev)
    expect(NFT.toString().startsWith('class        NFT extends Contract {')).eq(true)
  })
})