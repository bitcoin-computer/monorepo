import { Computer, Mock } from '@bitcoin-computer/lib'
import { chain, network, url, expect } from '../../utils/index.js'
import { Contract } from '@bitcoin-computer/lib'

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
    // Create smart object first (this is the scenario we want to test)
    const a = await computer.new(A, [])

    // Create mock
    const m = new M()

    // Create transaction in update using the *mock* rev in env
    // (this is required by the current evalMocked implementation)
    const { tx } = await computer.encode({
      // The update expression
      exp: `a.inc()`,

      // Assume value m for variable a during evaluation
      mocks: { a: m },

      // env must contain the mock rev (not the real one)
      // – this is what makes the current cache + two-phase apply happy
      env: { a: m._rev },

      // The transaction can only be funded and signed once it is finalized
      fund: false,
      sign: false,
    })
    const incTx = tx!

    // Patch the outpoint of the first input to point to the real on-chain object
    // (this is the exact same technique used in the passing test)
    const [txId, i] = a._rev.split(':')
    const index = parseInt(i, 10)
    incTx.updateInput(0, { txId, index })

    // Fund, sign and send transaction
    await computer.fund(incTx)
    await computer.sign(incTx)
    await computer.broadcast(incTx)
  })

  it('Should spend a mocked object if the mock is created first', async () => {
    // Create mock
    const m = new M()

    // Create transaction in update off-chain object
    const { tx } = await computer.encode({
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
    const incTx = tx!

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
