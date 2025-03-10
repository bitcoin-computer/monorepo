import { Computer } from '@bitcoin-computer/lib'
import { expect } from '../../utils'

describe('getAddress', () => {
  it('Should default to a p2pkh address', async () => {
    const p2pkhRegex = /^[1LmnM][a-km-zA-HJ-NP-Z1-9]{25,35}$/
    const computer = new Computer()
    expect(p2pkhRegex.test(computer.getAddress())).eq(true)
  })

  it('Should use a p2wpkh address when configured to do so', async () => {
    const p2wpkhRegex = /^(?:bc|tb|ltc|tltc|rltc)1q[a-z0-9]{38}$/
    const computer = new Computer({ addressType: 'p2wpkh' })
    expect(p2wpkhRegex.test(computer.getAddress())).eq(true)
  })

  it('Should use a p2tr address when configured to do so', async () => {
    const p2trRegex = /^(?:bc|tb|ltc|tltc|rltc)1p[a-z0-9]{58}$/
    const computer = new Computer({ addressType: 'p2tr' })
    expect(p2trRegex.test(computer.getAddress())).eq(true)
  })
})
