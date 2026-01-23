import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe('getAncestors', () => {
  class Counter extends Contract {
    n: number

    constructor() {
      super({ n: 0 })
    }
    inc() {
      this.n += 1
    }
  }

  it('Should return the ancestor transactions id of a given revision', async () => {
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    const counter = await computer.new(Counter, [])
    await counter.inc()
    await counter.inc()

    const ancestors = await computer.getAncestors(counter._rev)
    expect(ancestors).to.be.an('array').that.has.lengthOf(3)
    expect(ancestors).includes(counter._id.substring(0, 64))
    expect(ancestors).includes(counter._rev.substring(0, 64))
    expect(ancestors).includes((await computer.prev(counter._rev))!.substring(0, 64))
  })
})
