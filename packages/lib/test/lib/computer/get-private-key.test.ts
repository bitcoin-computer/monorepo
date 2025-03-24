import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils'

describe('getPrivateKey', () => {
  it('Should return the private key', async () => {
    const computer = new Computer()
    expect(typeof computer.getPrivateKey()).eq('string')
  })
})
