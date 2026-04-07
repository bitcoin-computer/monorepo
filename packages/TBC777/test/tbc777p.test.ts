import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'
import { TBC20 } from '../src/tbc20.js'
import { Escrow, TBC777P } from '../src/tbc777p.js'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

// Reusable instances to prevent txn-mempool-conflict
let minter: Computer
let alice: Computer
let bob: Computer
let mod: string

async function ensureFunds(c: Computer, minSats = 10e8) {
  try {
    const { balance } = await c.getBalance()
    if (balance < minSats) await c.faucet(minSats)
  } catch {
    await c.faucet(minSats)
  }
}

describe('TBC777P', () => {
  beforeEach(async () => {
    minter = new Computer({ url, chain, network })
    await minter.faucet(50e8)
    mod = await minter.deploy(`export ${TBC20}`)

    alice = new Computer({ url, chain, network })
    bob = new Computer({ url, chain, network })
    await Promise.all([alice.faucet(30e8), bob.faucet(30e8)])
  })

  it('Should work for a naive escrow', async () => {
    class NaiveEscrow extends Contract implements Escrow {
      depositRevs: string[]
      amountByWithdrawId: [string, bigint][]

      constructor() {
        super({ amountByWithdrawId: [], depositRevs: [] })
      }

      move(id: string, amount: bigint) {
        this.amountByWithdrawId = [[id, amount]]
      }

      acceptDeposit(tokenRev: string) {
        this.depositRevs.push(tokenRev)
      }
    }

    await ensureFunds(minter)
    const amount = 3n
    const name = 'test'
    const to = minter.getPublicKey()
    const token = await minter.new(TBC777P, [{ to, amount, name }], mod)

    const escrow = await minter.new(NaiveEscrow, [])

    await token.deposit(escrow._id, 2n)
    await escrow.acceptDeposit(token._rev)

    expect(token.amount).eq(1n)
    await escrow.move(token._id, 2n)

    await token.withdraw(escrow._rev)
    expect(token.amount).eq(3n)
  })

  it('Should work for an escrow with atomic deposit', async () => {
    class AtomicEscrow extends Contract implements Escrow {
      depositRevs: string[]
      amountByWithdrawId: [string, bigint][]

      constructor() {
        super({ amountByWithdrawId: [], depositRevs: [] })
      }

      move(id: string, amount: bigint) {
        this.amountByWithdrawId = [[id, amount]]
      }

      acceptDeposit(token: TBC777P, amount: bigint) {
        token.deposit(this._id, amount)
        this.depositRevs.push(token._rev)
      }
    }

    await ensureFunds(minter)
    const amount = 3n
    const name = 'test'
    const to = minter.getPublicKey()
    const token = await minter.new(TBC777P, [{ to, amount, name }], mod)

    const escrow = await minter.new(AtomicEscrow, [])

    await escrow.acceptDeposit(token as any, 2n)
    console.log('token', token)
    console.log('escrow', escrow)

    expect(token.amount).eq(1n)
    await escrow.move(token._id, 2n)

    await token.withdraw(escrow._rev)
    expect(token.amount).eq(3n)
  })
})
