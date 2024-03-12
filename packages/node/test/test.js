import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'

const conf = {
  network: 'regtest',
  url: 'http://127.0.0.1:1031',
  chain: 'LTC'
}

describe('Should work with chai', () => {
  it('Should be able to import the bitcoin computer', () => {
    const computer = new Computer({...conf})
    expect(computer).to.be.an('object')
  })

  it('Should create an smart object with a determined class', async () => {
    class Counter extends Contract {
      constructor() {
        super({ count: 0 })
      }
      inc() {
        this.count += 1
      }
    }

    const computer = new Computer({...conf})

    await computer.faucet(1e7)
    const counter = await computer.new(Counter, [])
    expect(counter).to.be.an('object')
    expect(counter.count).eq(0)

    await counter.inc()
    expect(counter.count).eq(1)
  })
})
