import { Contract, Computer } from '@bitcoin-computer/lib'
import { chain, network, url, expect } from '../../utils'

describe('next', () => {
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

  it('Should return the next revision', async () => {
    // Create and update onchain object
    const counter = await computer.new(Counter, [])
    await counter.inc()

    // The next revision of counter._id is counter._rev
    expect(await computer.next(counter._id)).eq(counter._rev)

    // The next revision of counter._rev is undefined
    expect(await computer.next(counter._rev)).eq(undefined)
  })

  it('Should throw an error with a revision that does not exist', async () => {
    const noOutput = '0'.repeat(64) + ':0'

    // Throws because there is no output with that revision
    await expect(computer.next(noOutput)).to.be.rejectedWith('Rev not found')
  })

  it('Should throw an error with a revision that does not contain an object', async () => {
    const counter = await computer.new(Counter, [])
    const noObject = counter._id.split(':')[0] + ':1'

    // Throws because there is no object at the output with that revision
    await expect(computer.next(noObject)).to.be.rejectedWith('Rev not found')
  })
})
