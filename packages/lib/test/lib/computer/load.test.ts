import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

// A smart contract
class C extends Contract {}

describe('load', () => {
  it('Should load a module', async () => {
    // Create and fund wallet
    const computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)

    // Deploy module
    const rev = await computer.deploy(`export ${C}`)

    // Load module
    const { C: Loaded } = await computer.load(rev)

    // The deployed module is always equal to loaded module
    // when white spaces are removed
    const trim = (Class) => Class.toString().replace(/\s+/g, '')
    expect(trim(Loaded)).eq(trim(C))
  })
})
