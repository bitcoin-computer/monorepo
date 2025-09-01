import { Contract, Computer } from '@bitcoin-computer/lib'
import { chain, network, url, expect } from '../../utils'

describe('prev', () => {
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

  let computer: Computer

  before('Create and fund wallet', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)
  })

  it('Should return the previous revision', async () => {
    // Create and update on chain object
    const counter = await computer.new(Counter, [])
    await counter.inc()

    // The previous revision of counter._id is counter._id
    expect(await computer.prev(counter._id)).eq(undefined)

    // Check that the previous revision of counter._rev is counter._id
    expect(await computer.prev(counter._rev)).eq(counter._id)
  })

  it('Should throw an error with a revision that does not exist', async () => {
    const noOutput = '0'.repeat(64) + ':0'

    // Throws because there is no output with that revision
    await expect(computer.prev(noOutput)).to.be.rejectedWith('Rev not found')
  })

  it('Should throw an error with a revision that does not contain an object', async () => {
    const counter = await computer.new(Counter, [])
    const noObject = counter._id.split(':')[0] + ':1'

    // Throws because there is no object at the output with that revision
    await expect(computer.prev(noObject)).to.be.rejectedWith('Rev not found')
  })
})
