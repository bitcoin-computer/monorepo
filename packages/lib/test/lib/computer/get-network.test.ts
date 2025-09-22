import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils'

describe('getNetwork', () => {
  it('Should return the network', async () => {
    // Create wallet with a specific network
    const computer = new Computer({ network: 'mainnet', mode: 'prod' })

    // Check network
    expect(computer.getNetwork()).eq('mainnet')
  })
})
