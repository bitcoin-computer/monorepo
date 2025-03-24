import { Computer, Contract } from '@bitcoin-computer/lib'
import { chain, network, url } from '../../utils'

// A smart contract
class C extends Contract {}

describe('sign', () => {
  it('Should sign a transaction', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Build transaction
    const { tx } = await computer.encode({
      exp: `${C} new C()`,
      sign: false,
    })

    // Sign transaction
    await computer.sign(tx)

    // Broadcast to see it it worked
    await computer.broadcast(tx)
  })
})
