import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

// Create wallet
const computer = new Computer({ chain, network, url })

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

describe('query', () => {
  const publicKey = computer.getPublicKey()
  let counter
  let mod

  before('Before tests for query', async () => {
    // Fund wallet
    await computer.faucet(1e8)

    // Deploy module
    mod = await computer.deploy(`export ${Counter}`)

    // Encode on-chain object and create it by broadcasting the transaction
    const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
    await computer.broadcast(tx)

    // Increment on-chain object
    counter = effect.res
    await counter.inc()
  })

  // Query by public key
  it('Should return the latest revisions for a public key', async () => {
    const revs = await computer.query({ publicKey })
    expect(revs.includes(counter._rev)).to.be.true
  })

  // Query by id
  it('Should return the latest revision for an id', async () => {
    const [rev] = await computer.query({ ids: [counter._id] })
    expect(rev).eq(counter._rev)
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
