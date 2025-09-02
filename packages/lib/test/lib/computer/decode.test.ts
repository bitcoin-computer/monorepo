import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('decode', () => {
  it('Should decode a transaction', async () => {
    // A smart contract
    class C extends Contract {}

    // Create and fund a wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // A transition encodes an update to the on-chain state
    const transition = {
      exp: `${C} new C()`,
      env: {},
      mod: '',
    }

    // Encode the transition to a transaction
    const { tx } = await computer.encode(transition)

    // Decode transaction back into transition
    const decoded = await computer.decode(tx)
    expect(decoded).to.deep.equal(transition)
  })
})
