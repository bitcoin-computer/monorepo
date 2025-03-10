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

describe('prev', () => {
  it('Should return the previous revision', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Create on-chain object at counter._id
    const counter = await computer.new(Counter, [])

    // Update on-chain object, the new version is stores at counter._rev
    await counter.inc()

    // Check that the previous revision of counter._rev is counter._id
    expect(await computer.prev(counter._rev)).eq(counter._id)
  })
})
