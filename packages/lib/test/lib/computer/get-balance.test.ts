import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe.only('getBalance', () => {
  it('Should return the balance', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e6)

    // Check wallet
    expect(await computer.getBalance()).to.deep.eq({
      confirmed: 0n,
      unconfirmed: BigInt(1e6),
      balance: BigInt(1e6),
    })
  })
})
