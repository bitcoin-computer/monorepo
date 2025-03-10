import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe('send', () => {
  it('Should return the previous revision', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Send transaction with payment
    const txId = await computer.send(1e6, computer.getAddress())
    expect(txId).to.be.a('string')
  })
})
