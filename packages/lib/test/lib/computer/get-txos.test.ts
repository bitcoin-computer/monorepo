import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe.only('getTxos', () => {
  let computer: Computer

  before('Fund computer1', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)
  })

  it('Should throw for an empty query string', async () => {
    let error
    try {
      await computer.getTxos({})
    } catch (e: any) {
      error = e
    }
    expect(error).to.be.instanceOf(Error)
    expect(error.message).to.eq('At least one query parameter must be provided')
  })

  it('Should return TXOs for an address', async () => {
    const txos = await computer.getTxos({ verbosity: 1, address: computer.getAddress() })
    expect(txos.length).to.be.greaterThan(0)
    txos.forEach((txo) => {
      expect(txo.address).to.eq(computer.getAddress())
    })
  })
})
