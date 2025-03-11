import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils'

describe('getVersion', () => {
  it('Should return the version', async () => {
    expect(typeof Computer.getVersion()).eq('string')
  })
})
