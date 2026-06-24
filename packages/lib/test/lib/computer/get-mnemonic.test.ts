import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils/index.js'

describe('getMnemonic', () => {
  it('Should return the mnemonic', async () => {
    // Create wallet with a specific mnemonic
    const mnemonic = 'warm almost lobster swim situate hidden tiger ski whale donate sock number'
    const c = new Computer({ mnemonic })

    // Check mnemonic
    expect(c.getMnemonic()).eq(mnemonic)
  })
})
