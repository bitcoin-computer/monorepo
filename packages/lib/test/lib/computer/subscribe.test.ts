import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('subscribe', () => {
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
  let close: () => void

  beforeEach('Before Computer', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(10e8)
  })

  it('Should work when subscribing by id', async () => {
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

        // if at least two events have been received the test passes
        if (eventCount >= 2) {
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

  it('Should not emit events for unsubscribed keys', async () => {
    let eventCount = 0
    const nonValidId = 'error:0'
    const c = await computer.new(Counter, [])
    close = await computer.subscribe(nonValidId, ({}) => {
      eventCount += 1
    })

    await c.inc()
    await c.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (retryCount > 10) {
          clearInterval(interval)
          if (eventCount === 0) {
            resolve() // Success: no events
          } else {
            reject(new Error('Received unexpected SSE for unsubscribed key'))
          }
        }
      }, 200)
    })
    close()
  })
})
