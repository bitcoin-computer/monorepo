import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils'

describe('getPublicKey', () => {
  it('Should return the public key', async () => {
    const computer = new Computer()
    expect(typeof computer.getPublicKey()).eq('string')
  })
})
