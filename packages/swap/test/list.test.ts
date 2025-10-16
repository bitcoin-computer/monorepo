import { expect } from 'chai'
import dotenv from 'dotenv'
import { Computer } from '@bitcoin-computer/lib'
import { List } from '../src/index.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

describe('List', () => {
  it('Should work', async () => {
    const computer = new Computer({ url, chain, network })
    await computer.faucet(1e8)
    const list = await computer.new(List, [])
    expect(list.elements).deep.eq([])
    await list.add('k')
    expect(list.elements).deep.eq(['k'])
    await list.delete('k')
    expect(list.elements).deep.eq([])
  })
})
