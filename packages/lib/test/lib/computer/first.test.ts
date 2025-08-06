import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

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

describe('first', () => {
  // Create wallet
  const computer = new Computer({ chain, network, url })

  before('Fund wallet', async () => {
    // Fund wallet
    await computer.faucet(1e8)
  })

  it('Should work if an object is not updated', async () => {
    const counter = await computer.new(Counter, [])

    // The first of an id is the is
    expect(await computer.first(counter._id)).eq(counter._id)
  })

  it('Should work if an object is updated', async () => {
    const counter = await computer.new(Counter, [])
    await counter.inc()

    // The first is the id even if the object is updated
    expect(await computer.first(counter._id)).eq(counter._id)
    expect(await computer.first(counter._rev)).eq(counter._id)
  })

  it('Should throw an error with a revision that does not exist', async () => {
    const noOutput = '0'.repeat(64) + ':0'

    // Throws because there is no output with that revision
    await expect(computer.first(noOutput)).to.be.rejectedWith('Rev not found')
  })

  it('Should throw an error with a revision that does not contain an object', async () => {
    const counter = await computer.new(Counter, [])
    const noObject = counter._id.split(':')[0] + ':1'

    // Throws because there is no object at the output with that revision
    await expect(computer.first(noObject)).to.be.rejectedWith('Rev not found')
  })
})
