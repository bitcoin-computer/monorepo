import { Computer, Mock } from '@bitcoin-computer/lib'
import { chain, network, url, expect } from '../../utils/index.js'

// A smart contract
class A extends Contract {
  n: number
  constructor() {
    super({ n: 1 })
  }

  inc() {
    this.n += 1
  }
}

// A mock contract
class M extends Mock {
  n: number
  constructor() {
    super()
    this.n = 1
  }

  inc() {
    this.n += 1
  }
}

describe('Mock', async () => {
  // Create client side wallet on regtest
  const computer = new Computer({ chain, network, url })

  before('Fund client side wallet on regtest', async () => {
    await computer.faucet(3e8)
  })

  it('Should spend a mocked object if the object is created first', async () => {
    // Create mock
    const m = new M()

    // Create smart object
    const a = await computer.new(A, [])

    // Update smart object
    const { tx: incTx } = await computer.encode({
      exp: `a.inc()`,
      env: { a: a._rev },
      mocks: { a: m },
    })
    await computer.broadcast(incTx)
  })

  it('Should spend a mocked object if the mock is created first', async () => {
    // Create mock
    const m = new M()

    // Create transaction in update off-chain object
    const { tx: incTx } = await computer.encode({
      // The update expression
      exp: `a.inc()`,

      // Assume value m for variable a
      mocks: { a: m },

      // Specify that the input that spends a points to m._rev
      env: { a: m._rev },

      // The transaction can only be funded and signed once it is finalized
      fund: false,
      sign: false,
    })

    // Create on-chain object
    const a = await computer.new(A, [])

    // Update the outpoint of the first inputs to point to a._rev
    const [txId, i] = a._rev.split(':')
    const index = parseInt(i, 10)
    incTx.updateInput(0, { txId, index })

    // Fund, sign and send transaction
    await computer.fund(incTx)
    await computer.sign(incTx)
    await computer.broadcast(incTx)
  })
})
