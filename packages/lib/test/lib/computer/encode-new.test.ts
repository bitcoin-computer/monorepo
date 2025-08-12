import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

// A smart contract
class C extends Contract {}

// Create wallet
const computer = new Computer({ chain, network, url })

describe('encodeNew', async () => {
  // Fund wallet
  before('Fund wallet', async () => {
    await computer.faucet(1e8)
  })

  it('Should encode a constructor call', async () => {
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
