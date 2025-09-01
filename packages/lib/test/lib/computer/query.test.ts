import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe('query', () => {
  // A smart contract
  class Counter extends Contract {
    n: number

    constructor() {
      super({ n: 0 })
    }
    inc() {
      this.n += 1
    }
  }

  let computer: Computer
  let publicKey: string
  let counter: Counter
  let mod: string

  before('Before tests for query', async () => {
    computer = new Computer({ chain, network, url })
    publicKey = computer.getPublicKey()
    await computer.faucet(1e8)

    // Deploy module
    mod = await computer.deploy(`export ${Counter}`)

    // Encode on-chain object and create it by broadcasting the transaction
    const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
    await computer.broadcast(tx)

    // Increment on-chain object
    counter = effect.res as unknown as Counter
    await counter.inc()
  })

  // Query by public key
  it('Should return the latest revisions for a public key', async () => {
    const revs = await computer.query({ publicKey })
    expect(revs.includes(counter._rev)).to.be.true
  })

  // Query by module specifier
  it('Should return the latest revisions for a module specifier', async () => {
    const [rev] = await computer.query({ mod })
    expect(rev).eq(counter._rev)
  })

  // Query by multiple parameters
  it('Should return the latest revisions for multiple parameters', async () => {
    const revs = await computer.query({ publicKey, limit: 1 })
    expect(revs.length).eq(1)
  })
})
