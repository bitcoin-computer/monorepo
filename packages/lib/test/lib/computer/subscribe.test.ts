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

describe('subscribe', () => {
  it('Should call a callback when an object is updated', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Create on-chain object
    const c = await computer.new(Counter, [])

    // Subscribe to updates on object c
    let eventCount = 0
    const close = await computer.subscribe(c._id, ({ rev, hex }) => {
      expect(rev).to.be.a('string')
      expect(hex).to.be.a('string')
      eventCount += 1
    })

    // Update on-chain object
    await c.inc()
    await c.inc()

    // Wait for events using a Promise
    await new Promise<void>((resolve, reject) => {
      let retryCount = 0

      // Retry every 200 ms
      const interval = setInterval(() => {
        retryCount += 1

        // if two events have been received the test passes
        if (eventCount === 2) {
          clearInterval(interval)
          resolve()
        }

        // After 4 s the test fails
        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE'))
        }
      }, 200)
    })

    // Close connection to the server
    close()
  })
})
