import { expect } from 'chai'
import { Mock } from '@bitcoin-computer/lib'
import { TestComputer } from './utils/test-computer'

describe('Mock', () => {
  class A extends Contract {
    n: number
    constructor() {
      super({ n: 1 })
    }

    inc() {
      this.n += 1
    }
  }

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

  const computer = new TestComputer()
  console.log(computer.getUrl())
  let a: A & Location
  let m: M

  it('Should spend a mocked object if the object is created first', async () => {
    await computer.faucet(3e8)
    const m = new M()
    const a = await computer.new(A, [])

    const { tx: incTx } = await computer.encode({
      exp: `a.inc()`,
      env: { a: a._rev },
      mocks: { a: m },
    })
    const txId2 = await computer.broadcast(incTx)

    expect(typeof txId2).eq('string')
    expect(txId2.length).eq(64)
  })

  it('Should spend a mocked object if the mock is created first', async () => {
    await computer.faucet(3e8)
    const m = new M()

    const { tx: incTx } = await computer.encode({
      exp: `a.inc()`,
      env: { a: m._rev },
      mocks: { a: m },
      fund: false,
      sign: false,
    })

    const a = await computer.new(A, [])

    const [txId, index] = a._rev.split(':')

    incTx.updateInput(0, { txId, index: parseInt(index, 10) })
    await computer.fund(incTx)
    await computer.sign(incTx)
    const txId2 = await computer.broadcast(incTx)

    expect(typeof txId2).eq('string')
    expect(txId2.length).eq(64)
  })
})
