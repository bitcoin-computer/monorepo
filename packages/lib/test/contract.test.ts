import { expect } from 'chai'
import { Contract, Computer } from '@bitcoin-computer/lib'
import { chain, network, url } from './utils/index.js'

describe('Contract', () => {
  it('Should Throw an Error When Updating Properties Outside of Methods', () => {
    class C extends Contract {
      n: number

      constructor() {
        super({ n: 0 })
      }

      set(n: number) {
        this.n = n
      }
    }

    const c = new C()
    c.set(1)

    expect(() => {
      c.n = 1
    }).to.throw("Cannot set property 'n' directly")
  })

  it('Should Throw an Error When Updating Provenance Properties', () => {
    class C extends Contract {
      _rev: string

      set(rev: string) {
        this._rev = rev
      }
    }

    const c = new C()

    expect(() => {
      c.set('rev')
    }).to.throw('Cannot set _rev')
  })

  it('Should be possible to use the initialization object', () => {
    class C extends Contract {
      n: number

      constructor() {
        super({ n: 0 })
      }
    }

    const c = new C()
    expect(c.n).eq(0)
  })

  it('Will throw an error if this is assigned in a constructor', () => {
    class C extends Contract {
      n: number

      constructor() {
        super()
        this.n = 1
      }
    }

    expect(() => {
      new C()
    }).to.throw("Cannot set property 'n' directly")
  })

  it('Should allow to call prev, first, next and latest inside of a smart contract method', async () => {
    class A extends Contract {
      n!: number
      constructor() {
        super({ n: 0 })
      }

      inc() {
        this.n += 1
      }
    }
    class Query extends Contract {
      async getFirst(location: string): Promise<string> {
        return computer.first(location)
      }
      async getLatest(location: string): Promise<string> {
        return computer.latest(location)
      }
      async getNext(location: string): Promise<string | undefined> {
        return computer.next(location)
      }
      async getPrev(location: string): Promise<string | undefined> {
        return computer.prev(location)
      }
    }

    const comp = new Computer({ chain, network, url })
    await comp.faucet(1e8)
    const c1 = await comp.new(A, [])
    await c1.inc()

    const c2 = await comp.new(Query, [])

    const first = await c2.getFirst(c1._id)
    expect(first).to.eq(c1._id)
    const prev = await c2.getPrev(c1._rev)
    expect(prev).to.eq(c1._id)

    const next = await c2.getNext(c1._rev)
    expect(next).to.eq(undefined)
    const last = await c2.getLatest(c1._id)
    expect(last).to.eq(c1._rev)
  })

  it('Should return latest on state before of the last function call', async () => {
    class A extends Contract {
      n!: number
      constructor() {
        super({ n: 0 })
      }

      inc() {
        this.n += 1
      }
      async getLatest(location: string): Promise<string> {
        return computer.latest(location)
      }
    }
    const comp = new Computer({ chain, network, url })
    await comp.faucet(1e8)
    const c1 = await comp.new(A, [])
    await c1.inc()
    const latest = c1._rev
    const last = await c1.getLatest(c1._rev)
    // after calling a function call the _rev is updated
    // latest should return the last state before the function call
    expect(last).to.eq(latest)
  })

  it('Should getTXOS with default verbosity 0 and verbosity 1', async () => {
    class A extends Contract {
      n!: number
      constructor() {
        super({ n: 0 })
      }

      inc() {
        this.n += 1
      }
    }
    class Query extends Contract {
      constructor() {
        super({})
      }
      async getTxosByPubKey(pubKey: string): Promise<string[]> {
        return computer.getTXOs({ publicKey: pubKey })
      }
      async getSatoshisByPubKey(pubKey: string): Promise<bigint[]> {
        const res = await computer.getTXOs({ publicKey: pubKey, verbosity: 1 })
        return res.map((r) => r.satoshis)
      }
    }
    const comp = new Computer({ chain, network, url })
    await comp.faucet(1e8)
    const c1 = await comp.new(A, [])
    await c1.inc()

    const c2 = await comp.new(Query, [])
    const revs = await c2.getTxosByPubKey(comp.getPublicKey())
    expect(revs.length).to.be.greaterThan(0)
    expect(revs).includes(c1._id)

    // Given that c2._rev is updated in the last call, should not include it
    expect(revs.some((r) => r.includes(c2._rev))).to.be.false

    const revsVerbose = await c2.getSatoshisByPubKey(comp.getPublicKey())
    expect(revsVerbose.length).to.be.greaterThan(0)
    expect(typeof revsVerbose[0]).to.eq('bigint')
  })

  it('Should getTXOS with verbosity 1', async () => {
    class A extends Contract {
      n!: number
      constructor() {
        super({ n: 0 })
      }

      inc() {
        this.n += 1
      }
    }
    class Query extends Contract {
      constructor() {
        super({})
      }
      async getTxosByPubKey(pubKey: string): Promise<string[]> {
        return computer.getTXOs({ publicKey: pubKey })
      }
    }
    const comp = new Computer({ chain, network, url })
    await comp.faucet(1e8)
    const c1 = await comp.new(A, [])
    await c1.inc()

    const c2 = await comp.new(Query, [])
    const revs = await c2.getTxosByPubKey(comp.getPublicKey())
    expect(revs.length).to.be.greaterThan(0)
    expect(revs).includes(c1._id)

    // Given that c2._rev is updated in the last call, should not include it
    expect(revs.some((r) => r.includes(c2._rev))).to.be.false
  })

  it('Should sync inside of a contract method', async () => {
    class A extends Contract {
      n!: number
      constructor() {
        super({ n: 0 })
      }

      inc() {
        this.n += 1
      }
    }
    class Query extends Contract {
      constructor() {
        super({})
      }
      async getN(location: string) {
        const obj = (await computer.sync(location)) as A
        return obj.n
      }

      async forbiddenCall(location: string) {
        const obj = (await computer.sync(location)) as A
        return obj.inc()
      }
    }
    const comp = new Computer({ chain, network, url })
    await comp.faucet(1e8)
    const c1 = await comp.new(A, [])
    await c1.inc()
    await c1.inc()

    const c2 = await comp.new(Query, [])

    const n0 = await c2.getN(c1._id)
    expect(n0).to.eq(0)

    const n2 = await c2.getN(c1._rev)
    expect(n2).to.eq(2)

    try {
      await c2.forbiddenCall(c1._rev)
      expect(true).to.eq(false)
    } catch (error: any) {
      expect(error.message).to.eq('obj.inc is not a function')
    }
  })

  it('Should call getAncestors inside of a contract method', async () => {
    class A extends Contract {
      n!: number
      constructor() {
        super({ n: 0 })
      }

      inc() {
        this.n += 1
      }
    }
    class Query extends Contract {
      constructor() {
        super({})
      }
      async getAncestors(location: string): Promise<string[]> {
        return await computer.getAncestors(location)
      }
    }
    const comp = new Computer({ chain, network, url })
    await comp.faucet(1e8)
    const c1 = await comp.new(A, [])
    await c1.inc()
    await c1.inc()

    const c2 = await comp.new(Query, [])

    const anc0 = await c2.getAncestors(c1._id)
    expect(anc0.length).to.eq(1)
    expect(anc0[0]).to.eq(c1._id.substring(0, 64))

    const prevToLast = await comp.prev(c1._rev)
    const anc2 = await c2.getAncestors(c1._rev)
    expect(anc2.length).to.eq(3)
    expect(anc2).includes(c1._id.substring(0, 64))
    expect(anc2).includes(prevToLast!.substring(0, 64))
    expect(anc2).includes(c1._rev.substring(0, 64))
  })

  it('Should get the balance of an address inside of a contract method', async () => {
    class A extends Contract {
      n!: number
      constructor() {
        super({ n: 0 })
      }

      inc() {
        this.n += 1
      }
    }
    class Query extends Contract {
      constructor() {
        super({})
      }
      async getBalance(address: string): Promise<bigint> {
        const balance = await computer.getBalance(address)
        return balance.balance
      }
    }

    const computer1 = new Computer({ chain, network, url })
    await computer1.faucet(3e8)

    const computer2 = new Computer({ chain, network, url })
    await computer2.faucet(1e8)

    const c1 = await computer1.new(A, [])
    await c1.inc()

    const c2 = await computer2.new(Query, [])
    const balance1 = await c2.getBalance(computer1.getAddress())
    expect(balance1 - 300000000n < 0n).to.be.true
  })
})
