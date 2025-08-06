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

describe('next', () => {
  // Create wallet
  const computer = new Computer({ chain, network, url })

  before('Fund wallet', async () => {
    // Fund wallet
    await computer.faucet(1e8)
  })

  it('Should return the next revision', async () => {
    // Create on-chain object at counter._id
    const counter = await computer.new(Counter, [])

    // Update on-chain object, the new version is stores at counter._rev
    await counter.inc()

    // Check that the next revision of counter._id is counter._rev
    expect(await computer.next(counter._id)).eq(counter._rev)
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
