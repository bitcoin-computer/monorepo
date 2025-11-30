import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('latest', () => {
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

  it('Should work if an object is not updated', async () => {
    const counter = await computer.new(Counter, [])

    expect(await computer.latest(counter._id)).eq(counter._id)
  })

  it('Should work if an object is updated', async () => {
    const counter = await computer.new(Counter, [])
    await counter.inc()

    expect(await computer.latest(counter._id)).eq(counter._rev)
    expect(await computer.latest(counter._rev)).eq(counter._rev)
  })

  it('Should throw an error with a revision that does not exist', async () => {
    const noOutput = '0'.repeat(64) + ':0'

    // Throws because there is no output with that revision
    await expect(computer.latest(noOutput)).to.be.rejectedWith('Rev not found')
  })

  it('Should throw an error with a revision that does not contain an object', async () => {
    const counter = await computer.new(Counter, [])
    const noObject = counter._id.split(':')[0] + ':1'

    // Throws because there is no object at the output with that revision
    await expect(computer.latest(noObject)).to.be.rejectedWith('Rev not found')
  })
})
