import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils/index.js'

describe('getPassphrase', () => {
  it('Should return the default passphrase', async () => {
    const computer = new Computer()
    expect(computer.getPassphrase()).eq('')
  })

  it('Should return a custom passphrase', async () => {
    const c = new Computer({ passphrase: 'passphrase' })
    expect(c.getPassphrase()).eq('passphrase')
  })
})
