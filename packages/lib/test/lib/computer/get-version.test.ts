import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils/index.js'

describe('getVersion', () => {
  it('Should return the version', async () => {
    expect(typeof Computer.getVersion()).eq('string')
  })
})
