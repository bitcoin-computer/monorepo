import { Computer } from '@bitcoin-computer/lib'
import { chain, network, url } from '../../utils'

describe('broadcast', () => {
  it('Should broadcast a transaction', async () => {
    // A smart contract
    class C extends Contract {}

    // Create and fund client side wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Build transaction
    const transition = { exp: `${C} new C()` }
    const { tx } = await computer.encode(transition)

    // Broadcast transaction
    await computer.broadcast(tx)
  })
})
