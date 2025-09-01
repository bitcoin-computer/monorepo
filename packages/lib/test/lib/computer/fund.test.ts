import { Computer } from '@bitcoin-computer/lib'
import { address, networks, Transaction } from '@bitcoin-computer/nakamotojs'
import { chain, network, url } from '../../utils'

describe('fund', () => {
  let computer: Computer

  before('Create and fund wallet', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)
  })

  it('Should fund a NakamotoJS transaction', async () => {
    // Build a transaction with NakamotoJS
    const tx = new Transaction()
    const { regtest } = networks
    const outputScript = address.toOutputScript('mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt', regtest)
    tx.addOutput(outputScript, BigInt(1e5))

    // Fund, sign and broadcast transaction
    await computer.fund(tx)
    await computer.sign(tx)
    await computer.broadcast(tx)
  })

  it('Should fund a Bitcoin Computer transaction', async () => {
    // Build a transaction with the Bitcoin Computer library
    const { tx } = await computer.encode({
      exp: `class C extends Contract {}; new C()`,
      fund: false,
    })

    // Fund, sign and broadcast transaction
    await computer.fund(tx)
    await computer.sign(tx)
    await computer.broadcast(tx)
  })
})
