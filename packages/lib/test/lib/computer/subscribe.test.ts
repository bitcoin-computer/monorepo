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
  let c: Counter

  let computer: Computer
  let close: () => void

  before('Before Computer', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(10e8)
    c = await computer.new(Counter, [])
  })

  it('Should call a callback when an object is updated', async () => {
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

  it('Should emit an event for address field updates', async () => {
    let eventCount = 0
    const address = computer.getAddress()
    close = await computer.stream('address', address, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })

    await c.inc()
    await c.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= 2) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for address stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should emit an event for satoshis field updates', async () => {
    let eventCount = 0
    const address = computer.getAddress()
    close = await computer.stream('address', address, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })

    await c.inc()
    await c.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= 2) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for address stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should emit events when subscribing to satoshis field', async () => {
    const sats = 50000n

    class Token extends Contract {
      amount: bigint
      constructor(amount: bigint) {
        super({ _satoshis: amount })
      }

      transfer(to: string): Token {
        this._owners = [to]

        return new Token(this.amount)
      }
    }

    const token1 = await computer.new(Token, [sats])
    const token2 = await computer.new(Token, [sats])

    let eventCount = 0
    const expectedEvents = 4 // 2 objects × 2 updates each

    close = await computer.stream('satoshis', Number(sats), ({ rev, hex }) => {
      expect(typeof rev).to.eq('string')
      expect(typeof hex).to.eq('string')
      expect(rev.split(':').length).to.eq(2)

      // The rev can belong to either token1 or token2
      expect(
        rev === token1._rev ||
          rev === token2._rev ||
          rev.startsWith(token1._id) ||
          rev.startsWith(token2._id),
      ).to.be.true

      eventCount += 1
    })

    await token1.transfer(token1._owners[0])
    await token2.transfer(token2._owners[0])

    // Second round
    await token1.transfer(token1._owners[0])
    await token2.transfer(token2._owners[0])

    // Wait for all 4 events
    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= expectedEvents) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 40) {
          // longer timeout because 4 events + ZMQ can be slow in regtest
          clearInterval(interval)
          close()
          reject(
            new Error(
              `Missed SSE for satoshis field. Got ${eventCount}, expected ${expectedEvents}`,
            ),
          )
        }
      }, 300)
    })
    // Final assertion
    close()
  })

  it('Should not emit events for unsubscribed keys', async () => {
    let eventCount = 0
    const nonValidId = 'error:0'
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
