import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('encodeCall', async () => {
  it('Should encode a function call', async () => {
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

    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Create an on-chain object from the smart contract
    const counter = await computer.new(Counter, [])

    // Encode a function call
    const { tx } = await computer.encodeCall({
      target: counter,
      property: 'inc',
      args: [],
    })

    // Decode the meta data
    expect(await computer.decode(tx)).to.deep.eq({
      exp: `__bc__.inc()`,
      env: { __bc__: counter._rev },
      mod: undefined,
    })

    // Broadcast the tx to commit the change
    await computer.broadcast(tx)
  })
})
