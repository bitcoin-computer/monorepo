import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('encode', () => {
  let computer: Computer

  before('Create and fund wallet', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)
  })

  // Basic types
  it('Should encode a basic type', async () => {
    // Encode the expression "1".repeat(1000000)
    const { effect, tx } = await computer.encode({ exp: '"1".repeat(1000000)' })

    // The value returned contains the result
    expect(effect).deep.eq({ res: '1'.repeat(1000000), env: {} })

    // Broadcast transaction to store value on the blockchain
    const txId = await computer.broadcast(tx)

    // Syncing to the transaction always returns the effect
    expect(await computer.sync(txId)).deep.eq(effect)
  })

  // Objects
  it('Should work for a class', async () => {
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

    // Encode a constructor cal
    const { effect: e1, tx: tx1 } = await computer.encode({
      exp: `${Counter} new Counter()`,
    })

    // Broadcast the transaction
    const txId1 = await computer.broadcast(tx1)

    // As above, synchronizing to a transaction id always returns the effect
    expect(await computer.sync(txId1)).deep.eq(e1)

    // The result of effect e1 is a counter
    const counter = e1.res as unknown as Counter

    // Encode a function call incrementing the counter
    const { effect: e2, tx: tx2 } = await computer.encode({
      // The expression
      exp: `c.inc()`,

      // The value for the counter is stored at counter._rev
      env: { c: counter._rev as string },
    })

    // As before we can broadcast the transaction to update the on-chain state
    const txId2 = await computer.broadcast(tx2)

    // The sync function reads the on-chain state
    expect(await computer.sync(txId2)).deep.eq(e2)
  })
})
