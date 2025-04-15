import { Contract, Computer } from '@bitcoin-computer/lib'
import { chain, network, url, expect } from '../../utils'

// A smart contract
class Counter extends Contract {
  n: number

  constructor() {
    super({ n: 0 })
  }
  inc() {
    this.n += 1
  }
}

describe('new', () => {
  it('Should create a new on-chain object', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Create an on-chain object
    const counter = await computer.new(Counter, [])
    expect(counter).to.matchPattern({
      n: 0,
      _id: (id) => typeof id === 'string',
      _rev: (rev) => typeof rev === 'string',
      _root: (root) => typeof root === 'string',
      _satoshis: (satoshis) => typeof satoshis === 'bigint',
      _owners: [computer.getPublicKey()],
    })

    // Update an on-chain object
    await counter.inc()
    expect(counter).to.matchPattern({
      n: 1,
      _id: (id) => typeof id === 'string',
      _rev: (rev) => typeof rev === 'string',
      _root: (root) => typeof root === 'string',
      _satoshis: (satoshis) => typeof satoshis === 'bigint',
      _owners: [computer.getPublicKey()],
    })
  })
})
