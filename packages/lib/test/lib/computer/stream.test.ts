import { Computer } from '@bitcoin-computer/lib'
import { crypto } from '@bitcoin-computer/nakamotojs'
import { chain, expect, network, url } from '../../utils/index.js'

describe('stream', () => {
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

  it('Should emit when streaming to asm key field', async () => {
    let eventCount = 0
    const publicKey = computer.getPublicKey()
    const hash = crypto.hash160(Buffer.from(publicKey, 'hex')).toString('hex')
    const asm = `OP_DUP OP_HASH160 ${hash} OP_EQUALVERIFY OP_CHECKSIG`

    // subscribe to receive events when the public keys receive funds

    close = await computer.streamTXOs(
      { asm },
      ({ rev, hex }) => {
        expect(typeof rev).eq('string')
        expect(typeof hex).eq('string')
        expect(rev.split(':').length).eq(2)
        eventCount += 1
      },
      (error) => {
        throw new Error(`Error ${error} in SSE stream`)
      },
    )

    await computer.send(30000n, computer.getAddress())

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        // expect at least one event (one for the UTXO created and one extra if any change)
        if (eventCount >= 1) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for asm stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should emit when streaming to satoshis field', async () => {
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

    close = await computer.streamTXOs({ satoshis: sats }, ({ rev, hex }) => {
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
    close()
  })

  it('Should emit when streaming to mod field', async () => {
    let eventCount = 0
    class Counter extends Contract {
      n: number

      constructor() {
        super({ n: 0 })
      }
      inc() {
        this.n += 1
      }
    }
    const mod = await computer.deploy(`export ${Counter}`)

    const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
    await computer.broadcast(tx)
    const expectedEvents = 2 // at least 2 (unconfirmed) updates

    close = await computer.streamTXOs({ mod }, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })

    // Increment on-chain object
    const counter = effect.res as unknown as Counter
    await counter.inc()
    await counter.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= expectedEvents) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for mod stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should emit one message for each object involved in the expression', async () => {
    class CounterT extends Contract {
      n: number

      constructor() {
        super({ n: 0 })
      }
      transfer(to: string) {
        this._owners = [to]
      }
    }
    class Swap extends Contract {
      constructor(a: CounterT, b: CounterT) {
        super()
        const [ownerA] = a._owners
        const [ownerB] = b._owners
        a.transfer(ownerB)
        b.transfer(ownerA)
      }
    }

    const counterA = await computer.new(CounterT, [])
    const counterB = await computer.new(CounterT, [])
    let eventCount = 0
    // we expect events for each object passed as parameter + the Swap object
    // all share the same expression in this transaction
    const expectedEvents = 3
    const mod = await computer.deploy(`export ${Swap}`)
    const exp = `new Swap(a, b)`

    close = await computer.streamTXOs({ exp }, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })
    const { tx } = await computer.encode({
      exp: `new Swap(a, b)`,
      env: { a: counterA._rev, b: counterB._rev },
      mod,
    })
    await computer.broadcast(tx)

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= expectedEvents) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for mod stream with multiple owners'))
        }
      }, 200)
    })
    close()
  })

  it('Should emit when streaming to expression field', async () => {
    let eventCount = 0
    const counter = await computer.new(Counter, [])
    const expectedEvents = 2 // 2 updates
    const exp = '__bc__.inc()'

    close = await computer.streamTXOs({ exp }, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })

    // Increment on-chain object
    await counter.inc()
    await counter.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= expectedEvents) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for exp stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should emit events for multiple filter combinations (exp + mod)', async () => {
    let eventCount = 0
    const mod = await computer.deploy(`export ${Counter}`)

    const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
    await computer.broadcast(tx)
    const expectedEvents = 2
    const exp = '__bc__.inc()'

    close = await computer.streamTXOs({ exp, mod }, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })

    const counter = effect.res as unknown as Counter
    await counter.inc()
    await counter.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= expectedEvents) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 20) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for exp + mod stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should not emit events for partial filter match (wrong exp, only mod)', async () => {
    let eventCount = 0
    const mod = await computer.deploy(`export ${Counter}`)
    const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
    await computer.broadcast(tx)
    const exp = '__bc__.wrong()'
    close = await computer.streamTXOs({ exp, mod }, () => {
      eventCount += 1 // Should not trigger
    })

    const counter = effect.res as unknown as Counter
    await counter.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (retryCount > 10) {
          clearInterval(interval)
          if (eventCount === 0) {
            resolve() // Success: no events
          } else {
            reject(new Error('Received unexpected SSE for partial filter match'))
          }
        }
      }, 200)
    })
    close()
  })

  it('Should throw error for invalid keys in stream', async () => {
    const invalidFilter = { invalidField: 'value' } as Partial<any>
    await expect(computer.streamTXOs(invalidFilter, () => {})).to.be.rejectedWith(
      'Invalid subscription field: invalidField',
    )
  })
})
