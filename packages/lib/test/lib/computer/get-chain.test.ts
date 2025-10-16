import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils/index.js'

describe('getChain', () => {
  it('Should return the chain', async () => {
    // Create wallet with a specific chain
    const computer = new Computer({ chain: 'LTC' })

    // Check chain
    expect(computer.getChain()).eq('LTC')
  })
})
