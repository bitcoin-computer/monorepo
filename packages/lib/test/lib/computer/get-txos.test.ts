import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe.only('getTxos', () => {
  let computer: Computer

  before('Fund computer', async () => {
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

  it('Should return all attributes for all txos for the computer address with verbosity 1', async () => {
    const txos = await computer.getTxos({ verbosity: 1, address: computer.getAddress() })
    expect(txos.length).to.be.greaterThan(0)
    txos.forEach((txo) => {
      if (typeof txo === 'object' && txo !== null) {
        expect(txo.address).to.eq(computer.getAddress())
        expect(txo.satoshis).to.be.a('bigint')
        expect(txo.rev).to.be.a('string')
        expect(txo.asm).to.be.a('string')
        expect(txo.isObject).to.be.a('boolean')
        expect(txo.blockHash).eq(null)
      } else {
        throw new Error('Txo is not an object')
      }
    })
  })
})
