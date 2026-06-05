import { Computer, SmartContract, Contract } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('encode', () => {
  let computer: Computer

  before('Create and fund wallet', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)
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
    const txId1 = await computer.broadcast(tx1!)

    // As above, synchronizing to a transaction id always returns the effect
    expect(await computer.sync(txId1)).deep.eq(e1)

    // The result of effect e1 is a counter
    const counter = e1.res as SmartContract

    // Encode a function call incrementing the counter
    const { effect: e2, tx: tx2 } = await computer.encode({
      // The expression
      exp: `c.inc()`,

      // The value for the counter is stored at counter._rev
      env: { c: counter._rev },
    })

    // As before we can broadcast the transaction to update the on-chain state
    const txId2 = await computer.broadcast(tx2!)

    // The sync function reads the on-chain state
    expect(await computer.sync(txId2)).deep.eq(e2)
  })
})
