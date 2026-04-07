import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'
import { TBC20 } from '../src/tbc20.js'
import { Escrow, TBC777M } from '../src/tbc777m.js'

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

let black: Computer
let white: Computer
let minter: Computer
let mod: string

async function ensureFunds(c: Computer, minSats = 10e8) {
  try {
    const { balance } = await c.getBalance()
    if (balance < minSats) await c.faucet(minSats)
  } catch {
    await c.faucet(minSats)
  }
}

describe.only('TBC777M', () => {
  beforeEach(async () => {
    minter = new Computer({ url, chain, network })
    black = new Computer({ url, chain, network })
    white = new Computer({ url, chain, network })
    await Promise.all([black.faucet(10e8), white.faucet(1e8), minter.faucet(1e8)])
    mod = await black.deploy(`export ${TBC20}`)
  })

  it('Should work for a naive escrow', async () => {
    class NaiveEscrow extends Contract implements Escrow {
      deposits: [string, string][]
      withdraws: [string, string, bigint][]

      constructor() {
        super({ deposits: [], withdraws: [] })
      }

      acceptDeposit(token: any) {
        this.deposits.push([token._root, token._rev])
      }

      move(id: string, amount: bigint, root: string) {
        this.withdraws = [[root, id, amount]]
      }
    }

    await ensureFunds(minter)
    const amount = 3n
    const name = 'test'
    const to = minter.getPublicKey()
    const token = await minter.new(TBC777M, [{ to, amount, name }], mod)

    const escrow = await minter.new(NaiveEscrow, [])

    await token.deposit(escrow._id, 2n)
    await escrow.acceptDeposit(token)

    expect(token.amount).eq(1n)
    await escrow.move(token._id, 2n, token._root)

    await token.withdraw(escrow._rev)
    expect(token.amount).eq(3n)
  })

  it('Should work for an escrow with atomic deposit', async () => {
    class AtomicEscrow extends Contract implements Escrow {
      deposits: [string, string][]
      withdraws: [string, string, bigint][]

      constructor() {
        super({ deposits: [], withdraws: [] })
      }

      async acceptDeposit(token: any, amount: bigint) {
        token.deposit(this._id, amount)
        const nextRev = await computer.next(token._rev)
        this.deposits.push([token._root, nextRev])
      }

      move(id: string, amount: bigint, root: string) {
        this.withdraws = [[root, id, amount]]
      }
    }

    await ensureFunds(minter)
    const amount = 3n
    const name = 'test'
    const to = minter.getPublicKey()
    const token = await minter.new(TBC777M, [{ to, amount, name }], mod)

    const escrow = await minter.new(AtomicEscrow, [])

    await escrow.acceptDeposit(token, 2n)
    expect(token.amount).eq(1n)

    await escrow.move(token._id, 2n, token._root)

    await token.withdraw(escrow._rev)
    expect(token.amount).eq(3n)
  })

  it.only('Should work for a chess game without timeout', async () => {
    class Chess extends Contract {
      deposits: [string, string][]
      withdraws: [string, string, bigint][]
      publicKeyW: string
      publicKeyB: string
      tokenIdW: string
      tokenIdB: string
      root: string

      constructor(root: string) {
        super({ deposits: [], withdraws: [], root })
      }

      async acceptDeposit(token: any, amount: bigint, nextOwner: string) {
        token.deposit(this._id, amount)
        const nextRev = await computer.next(token._rev)
        this.deposits.push([token._root, nextRev])
        this._owners = [nextOwner]
        if (!this.publicKeyB) {
          this.tokenIdW = token._id
          this.publicKeyB = nextOwner
        } else {
          this.tokenIdB = token._id
          this.publicKeyW = nextOwner
        }
      }

      move(amount: bigint, isGameOver: boolean = false) {
        if (!isGameOver) {
          if (this._owners[0] === this.publicKeyW) this._owners = [this.publicKeyB]
          else this._owners = [this.publicKeyW]
        } else {
          let winnerId: string
          if (this._owners[0] === this.publicKeyW) winnerId = this.tokenIdW
          else winnerId = this.tokenIdB
          this.withdraws = [[this.root, winnerId, amount]]
        }
      }
    }

    await ensureFunds(minter)
    const amount = 30n
    const name = 'test'
    const to = minter.getPublicKey()

    // Issuer mints token
    const token = await minter.new(TBC777M, [{ to, amount, name }], mod)
    const whiteToken = await token.transfer(white.getPublicKey(), 10n)
    const blackToken = await token.transfer(black.getPublicKey(), 10n)

    // White player creates the chess game and places a wager
    const chess = await white.new(Chess, [token._root])
    await chess.acceptDeposit(whiteToken, 5n, black.getPublicKey())

    // Black player places their wager
    const { tx: tx1 } = await black.encode({
      exp: `chess.acceptDeposit(blackToken, 5n, '${white.getPublicKey()}')`,
      env: { chess: chess._rev, blackToken: blackToken._rev },
    })
    await black.broadcast(tx1)

    // White wins the game
    const { tx: tx2 } = await white.encode({
      exp: `chess.move(10n, true)`,
      env: { chess: tx1.getId() + ':0' },
    })
    await white.broadcast(tx2)

    // White withdraws
    await whiteToken.withdraw(tx2.getId() + ':0')
    expect(whiteToken.amount).eq(15n)
  })
})
