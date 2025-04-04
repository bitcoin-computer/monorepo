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

describe('sync', () => {
  it('Should sync to a counter', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Create on-chain object
    const { tx, effect } = await computer.encode({
      exp: `${Counter} new Counter()`,
    })
    const counter = effect.res as unknown as Counter
    await computer.broadcast(tx)
    const initialCounter = {
      n: 0,
      _id: `${tx.getId()}:0`,
      _rev: `${tx.getId()}:0`,
      _root: `${tx.getId()}:0`,
      _owners: [computer.getPublicKey()],
      _amount: chain === 'LTC' ? 5820n : 582n,
    }
    expect(counter).deep.eq(initialCounter)

    // Update on-chain object
    await counter.inc()

    // Sync to initial revision
    expect(await computer.sync(counter._id)).deep.eq(initialCounter)

    // Sync to latest revision
    expect(await computer.sync(counter._rev)).deep.eq(counter)

    // Sync to initial transaction id
    const initialTxId = counter._id.slice(0, 64)
    expect(await computer.sync(initialTxId)).deep.eq({
      res: initialCounter,
      env: {},
    })

    // Sync to latest transaction id
    const latestTxId = counter._rev.slice(0, 64)
    expect(await computer.sync(latestTxId)).deep.eq({
      res: undefined,
      env: {
        __bc__: counter,
      },
    })
  })
})
