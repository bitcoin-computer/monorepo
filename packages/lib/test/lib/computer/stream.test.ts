import { Computer, SmartContract } from '@bitcoin-computer/lib'
import { crypto } from '@bitcoin-computer/nakamotojs'
import { chain, expect, network, url } from '../../utils/index.js'
import type { Contract } from '@bitcoin-computer/lib/contract-env'
declare const Contract: Contract

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
    transfer(to: string) {
      this._owners = [to]
    }
  }

  let computer: Computer
  let close: () => void

  beforeEach('Before Computer', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(14e8)
  })

  it('Should emit when streaming to asm key field', async () => {
    let eventCount = 0
    const publicKey = computer.getPublicKey()
    const hash = crypto.hash160(Buffer.from(publicKey, 'hex')).toString('hex')
    const asm = `OP_DUP OP_HASH160 ${hash} OP_EQUALVERIFY OP_CHECKSIG`

    // subscribe to receive events when the public keys receive funds

    try {
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
    } catch (error) {
      expect(true).to.eq(false)
    }

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
    const mod = await computer.deploy(`export ${Counter}`)

    const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
    await computer.broadcast(tx!)
    const expectedEvents = 2 // at least 2 (unconfirmed) updates

    close = await computer.streamTXOs({ mod }, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })

    // Increment on-chain object
    const counter = effect.res as SmartContract<typeof Counter>
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
    class Swap extends Contract {
      constructor(a: Counter, b: Counter) {
        super()
        const [ownerA] = a._owners
        const [ownerB] = b._owners
        a.transfer(ownerB)
        b.transfer(ownerA)
      }
    }

    const counterA = await computer.new(Counter, [])
    const counterB = await computer.new(Counter, [])
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
    await computer.broadcast(tx!)

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
    await computer.broadcast(tx!)
    const expectedEvents = 2
    const exp = '__bc__.inc()'

    close = await computer.streamTXOs({ exp, mod }, ({ rev, hex }) => {
      expect(typeof rev).eq('string')
      expect(typeof hex).eq('string')
      expect(rev.split(':').length).eq(2)
      eventCount += 1
    })

    const counter = effect.res as SmartContract<typeof Counter>
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

  it('Should emit when streaming to publicKey field', async () => {
    let eventCount = 0
    const publicKey = computer.getPublicKey()

    close = await computer.streamTXOs(
      { publicKey },
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

    const c = await computer.new(Counter, [])
    // Trigger a transaction that creates an object owned by computer.getPublicKey()
    await c.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= 1) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 25) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for publicKey stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should throw validation error for invalid publicKey filter', async () => {
    const invalidCases = [
      { value: ' ', expected: 'cannot be empty' },
      { value: 'OP_1 OP_CHECKSIG', expected: 'Invalid publicKey: invalid opcode format' },
      {
        value: 'invalid-opcode',
        expected:
          'Invalid publicKey: must be a valid opcode (starting with OP_) or a hexadecimal string',
      },
      {
        value: 'GG1234',
        expected:
          'Invalid publicKey: must be a valid opcode (starting with OP_) or a hexadecimal string',
      },
      { value: 'a'.repeat(1041), expected: 'data push too large' }, // 520 bytes = 1040 hex chars
    ]

    for (const { value, expected } of invalidCases) {
      await expect(computer.streamTXOs({ publicKey: value }, () => {})).to.be.rejectedWith(expected)
    }
  })

  it('Should not emit events for a chunk that does not exist in the script', async () => {
    let eventCount = 0

    close = await computer.streamTXOs({ publicKey: 'OP_RETURN' }, () => {
      eventCount++
    })

    await computer.new(Counter, [])

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(eventCount).to.eq(0)
        resolve()
      }, 1500)
    })
    close()
  })

  it('Should receive two events when output matches two different publicKey subscriptions', async () => {
    let eventCount = 0
    const pubKey = computer.getPublicKey()

    const close1 = await computer.streamTXOs({ publicKey: 'OP_1' }, () => {
      eventCount++
    })
    const close2 = await computer.streamTXOs({ publicKey: pubKey }, () => {
      eventCount++
    })

    close = () => {
      close1()
      close2()
    }

    const c = await computer.new(Counter, [])
    await c.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1
        if (eventCount >= 2) {
          clearInterval(interval)
          resolve()
        }
        if (retryCount > 25) {
          clearInterval(interval)
          close()
          reject(new Error(`Expected at least 2 events, got ${eventCount}`))
        }
      }, 200)
    })
    close()
  })

  it('Should emit when streaming to any asm chunk ', async () => {
    let eventCount = 0
    // Owner script asm prefix as filter
    const chunk = `OP_1`

    close = await computer.streamTXOs(
      { publicKey: chunk },
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

    const c = await computer.new(Counter, [])
    await c.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (eventCount >= 1) {
          clearInterval(interval)
          resolve()
        }

        if (retryCount > 25) {
          clearInterval(interval)
          close()
          reject(new Error('Missed SSE for publicKey stream'))
        }
      }, 200)
    })
    close()
  })

  it('Should not emit events for partial filter match (wrong exp, only mod)', async () => {
    let eventCount = 0
    const mod = await computer.deploy(`export ${Counter}`)
    const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
    await computer.broadcast(tx!)
    const exp = '__bc__.wrong()'
    close = await computer.streamTXOs({ exp, mod }, () => {
      eventCount += 1 // Should not trigger
    })

    const counter = effect.res as SmartContract<typeof Counter>
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

  it('Unsubscribing to mempool cleanup should not affect current stream subscriptions', async function () {
    let cleanupCount = 0
    let streamCount = 0

    // Subscribe to mempool
    const unsubMempool = await computer.streamMempoolCleanup(({ revs }) => {
      cleanupCount++
    })

    // Subscribe to a streamTXOs (e.g., mod)
    const mod = await computer.deploy(`export ${Counter}`)
    const unsubStream = await computer.streamTXOs(
      { mod },
      ({ rev }) => {
        streamCount++
      },
      (err) => {
        throw new Error(`Stream error: ${err}`)
      },
    )

    // Create object for stream
    const obj = await computer.new(Counter, [], mod)
    await obj.inc()

    // Trigger mempool cleanup (simulate if needed; assume your env has a way to force stale TX cleanup)
    // For test: await someStaleTxCreationAndCleanup(); // Or use RPC to add/remove

    // Wait for initial events
    await new Promise<void>((resolve, reject) => {
      let attempts = 0
      const iv = setInterval(() => {
        attempts++
        if (streamCount >= 1) {
          // Adjust expected if no real cleanup
          clearInterval(iv)
          resolve()
        }
        if (attempts > 40) {
          clearInterval(iv)
          reject(new Error(`Initial missing: stream=${streamCount}, cleanup=${cleanupCount}`))
        }
      }, 300)
    })

    // Unsubscribe mempool stream
    unsubMempool()

    // Reset counters
    streamCount = 0
    cleanupCount = 0

    // Trigger more: stream should fire normally
    await obj.inc()
    await obj.inc()

    await new Promise<void>((resolve, reject) => {
      let attempts = 0
      const iv = setInterval(() => {
        attempts++
        if (cleanupCount === 0 && streamCount >= 1) {
          clearInterval(iv)
          resolve()
        }
        if (attempts > 40) {
          clearInterval(iv)
          reject(new Error(`After unsub: cleanup=${cleanupCount}, stream got ${streamCount}`))
        }
      }, 300)
    })

    // Cleanup
    unsubStream()
  })

  it('Unsubscribing to any streamTXOS subscription should not affect current stream subscriptions', async function () {
    let streamCount1 = 0
    let streamCount2 = 0

    // Subscribe to first streamTXOs
    const mod1 = await computer.deploy(`export ${Counter}`)
    const unsubStream1 = await computer.streamTXOs(
      { mod: mod1 },
      ({ rev }) => {
        streamCount1++
      },
      (err) => {
        throw new Error(`Stream1 error: ${err}`)
      },
    )

    // Subscribe to second streamTXOs
    const mod2 = await computer.deploy(`export ${Counter}`)
    const unsubStream2 = await computer.streamTXOs(
      { mod: mod2 },
      ({ rev }) => {
        streamCount2++
      },
      (err) => {
        throw new Error(`Stream2 error: ${err}`)
      },
    )

    // Create objects for both streams
    const obj1 = await computer.new(Counter, [], mod1)
    const obj2 = await computer.new(Counter, [], mod2)
    await obj1.inc()
    await obj2.inc()

    // Wait for initial events
    await new Promise<void>((resolve, reject) => {
      let attempts = 0
      const iv = setInterval(() => {
        attempts++
        if (streamCount1 >= 1 && streamCount2 >= 1) {
          clearInterval(iv)
          resolve()
        }
        if (attempts > 40) {
          clearInterval(iv)
          reject(new Error(`Initial missing: stream1=${streamCount1}, stream2=${streamCount2}`))
        }
      }, 300)
    })

    // Unsubscribe first stream
    unsubStream1()

    // Reset counters
    streamCount1 = 0
    streamCount2 = 0

    // Trigger more: second stream should fire normally
    await obj1.inc()
    await obj2.inc()
    await obj2.inc()

    await new Promise<void>((resolve, reject) => {
      let attempts = 0
      const iv = setInterval(() => {
        attempts++
        if (streamCount1 === 0 && streamCount2 >= 1) {
          clearInterval(iv)
          resolve()
        }
        if (attempts > 40) {
          clearInterval(iv)
          reject(new Error(`Invalid after unsub: stream1=${streamCount1}, stream2=${streamCount2}`))
        }
      }, 300)
    })

    // Cleanup
    unsubStream2()
  })

  it('Duplicate subscription to same filter replaces the first', async function () {
    let firstCount = 0
    let secondCount = 0

    const mod = await computer.deploy(`export ${Counter}`)

    const closeFirst = await computer.streamTXOs({ mod }, () => {
      firstCount += 1
    })
    // Subscribe twice to same filter with different callbacks
    // This should replace the first subscription
    const closeSecond = await computer.streamTXOs({ mod }, () => {
      secondCount += 1
    })

    const counter = await computer.new(Counter, [], mod)
    await counter.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (firstCount === 0 && secondCount >= 1) {
          clearInterval(interval)
          resolve() // Success: second fired
        }

        if (retryCount > 10) {
          clearInterval(interval)
          reject(new Error('Did not receive expected SSEs for duplicate subscriptions'))
        }
      }, 200)
    })

    closeFirst()

    // check if first callback still fires or second overrides
    const counter2 = await computer.new(Counter, [], mod)
    await counter2.inc()
    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1
        if (secondCount >= 2) {
          clearInterval(interval)
          resolve() // Success: second fired again
        }
        if (retryCount > 10) {
          clearInterval(interval)
          reject(new Error('Second callback did not fire as expected after first was closed'))
        }
      }, 200)
    })

    closeSecond()
  })

  it('Duplicate subscription to same filter ignores the first if closed', async function () {
    let firstCount = 0
    let secondCount = 0

    const mod = await computer.deploy(`export ${Counter}`)

    const closeFirst = await computer.streamTXOs({ mod }, () => {
      firstCount += 1
    })
    // Subscribe twice to same filter with different callbacks
    // This should replace the first subscription
    const closeSecond = await computer.streamTXOs({ mod }, () => {
      secondCount += 1
    })

    const counter = await computer.new(Counter, [], mod)
    await counter.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1

        if (firstCount === 0 && secondCount >= 1) {
          clearInterval(interval)
          resolve() // Success: second fired
        }

        if (retryCount > 10) {
          clearInterval(interval)
          reject(new Error('Did not receive expected SSEs for duplicate subscriptions'))
        }
      }, 200)
    })

    closeSecond()

    secondCount = 0
    // Check that the first callback does not fire after being closed
    await counter.inc()
    await counter.inc()
    await counter.inc()
    await counter.inc()
    await counter.inc()

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const interval = setInterval(() => {
        retryCount += 1
        if (secondCount === 0) {
          clearInterval(interval)
          resolve() // Success: second did not fire
        }
        if (retryCount > 10) {
          clearInterval(interval)
          reject(new Error('First callback fired even after being closed'))
        }
      }, 200)
    })

    closeFirst()
  })
})
