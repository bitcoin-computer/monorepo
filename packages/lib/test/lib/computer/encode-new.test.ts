import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe('encodeNew', async () => {
  it('Should encode a constructor call', async () => {
    // A smart contract
    class C extends Contract {}

    // Create and wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Encode a constructor call
    const { tx, effect } = await computer.encodeNew({
      constructor: C,
      args: [],
    })

    // Decode transaction
    expect(await computer.decode(tx)).to.deep.eq({
      exp: `${C} new C()`,
      env: {},
      mod: '',
    })

    // Broadcast the tx to create the on-chain object
    const txId = await computer.broadcast(tx)

    // Synchronizing to the transaction id always returns the effect
    expect(await computer.sync(txId)).deep.eq(effect)
  })
})
