import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe('faucet', () => {
  it('Should fund the wallet of the current object', async () => {
    // Create and fund wallet
    const c = new Computer({ chain, network, url })
    const utxo = await c.faucet(1e8)

    // Check shape of return value
    expect(utxo).to.matchPattern({
      txId: (val) => typeof val === 'string',
      vout: (vout) => typeof vout === 'number',
      height: -1,
      satoshis: BigInt(1e8),
    })

    // Check balance
    const { balance } = await c.getBalance()
    expect(balance).eq(BigInt(1e8))
  })

  it('Should fund the wallet of another object', async () => {
    // Create wallets c1 and c2
    const c1 = new Computer({ chain, network, url })
    const c2 = new Computer({ chain, network, url })

    // fund c2 using c1
    await c1.faucet(1e8, c2.getAddress())

    // Check that c1 did not receive funds
    const { balance: b1 } = await c1.getBalance()
    expect(b1).eq(0n)

    // Check that c2 did receive funds
    const { balance: b2 } = await c2.getBalance()
    expect(b2).eq(BigInt(1e8))
  })

  it('Should throw an error on testnet', async () => {
    // Create wallet on testnet
    const c = new Computer({ chain, network: 'testnet', url })

    // Check that it throws an error
    await expect(c.faucet(1e8)).to.be.rejected
  })
})
