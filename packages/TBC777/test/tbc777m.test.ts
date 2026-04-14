import { expect } from 'chai'
import { Computer, SmartContract } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'
import { TBC20 } from '../src/tbc20.js'
import { Escrow, TBC777M } from '../src/tbc777m.js'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

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
    await Promise.all([black.faucet(10e8), white.faucet(1e8), minter.faucet(10e8)])
    await ensureFunds(minter)
    mod = await minter.deploy(`export ${TBC20}`)
  })

  it('Should work for a naive escrow', async () => {
    class NaiveEscrow extends Contract implements Escrow {
      deposits!: [string, string][]
      withdraws!: [string, string, bigint][]
      finalWithdraws!: [string, string, bigint][]

      constructor() {
        super({ deposits: [], withdraws: [], finalWithdraws: [] })
      }

      acceptDeposit(root: string, rev: string) {
        this.deposits.push([root, rev])
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

    await escrow.acceptDeposit(token._root, token._rev)
    await token.deposit(escrow._id, 2n)

    expect(token.amount).eq(1n)
    await escrow.move(token._id, 2n, token._root)

    await token.withdraw(escrow._rev)
    expect(token.amount).eq(3n)
  })

  it('Should work for an escrow with atomic deposit', async () => {
    class AtomicEscrow extends Contract implements Escrow {
      deposits!: [string, string][]
      withdraws!: [string, string, bigint][]
      finalWithdraws!: [string, string, bigint][]

      constructor() {
        super({ deposits: [], withdraws: [], finalWithdraws: [] })
      }

      async acceptDeposit(token: any, amount: bigint) {
        token.deposit(this._id, amount)
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

    const escrow = await minter.new(AtomicEscrow, [])

    await escrow.acceptDeposit(token, 2n)
    expect(token.amount).eq(1n)

    await escrow.move(token._id, 2n, token._root)

    await token.withdraw(escrow._rev)
    expect(token.amount).eq(3n)
  })

  it('Should work atomically for a chess game without timeout', async () => {
    class Chess extends Contract {
      deposits!: [string, string][]
      withdraws!: [string, string, bigint][]
      publicKeyW!: string
      publicKeyB!: string
      tokenIdW!: string
      tokenIdB!: string
      root!: string

      constructor(root: string) {
        super({ deposits: [], withdraws: [], finalWithdraws: [], root })
      }

      async acceptDeposit(token: any, amount: bigint, nextOwner: string) {
        token.deposit(this._id, amount)
        this.deposits.push([token._root, token._rev])
        this._owners = [nextOwner]
        if (!this.publicKeyB) {
          this.tokenIdW = token._id
          this.publicKeyB = nextOwner
        } else if (!this.publicKeyW) {
          this.tokenIdB = token._id
          this.publicKeyW = nextOwner
        } else {
          throw new Error('Game is already fully funded')
        }
      }

      move(amount: bigint, isGameOver: boolean = false) {
        if (!this.publicKeyB || !this.publicKeyW) throw new Error('Game not yet fully funded')
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
    const whiteTokenM = await token.transfer(white.getPublicKey(), 10n)
    const blackTokenM = await token.transfer(black.getPublicKey(), 10n)

    // White player creates the chess game and places a wager
    const chess = await white.new(Chess, [token._root])
    const whiteToken = await white.sync<typeof TBC777M>(whiteTokenM!._rev)
    await chess.acceptDeposit(whiteToken, 5n, black.getPublicKey())
    expect(chess._owners).deep.eq([black.getPublicKey()])

    // Black player places their wager
    const blackToken = await black.sync<typeof TBC777M>(blackTokenM!._rev)
    const { tx: tx1, effect: effect1 } = await black.encode({
      exp: `chess.acceptDeposit(blackToken, 5n, '${white.getPublicKey()}')`,
      env: { chess: chess._rev, blackToken: blackToken._rev },
    })
    await black.broadcast(tx1)
    const chess1 = effect1.env.chess as SmartContract<typeof Chess>

    expect(chess1.deposits).deep.eq([
      [token._root, whiteTokenM!._rev],
      [token._root, blackTokenM!._rev],
    ])
    expect(chess.withdraws).deep.eq([])

    // White wins the game
    const { tx: tx2, effect: effect2 } = await white.encode({
      exp: `chess.move(10n, true)`,
      env: { chess: chess1._rev },
    })
    await white.broadcast(tx2)
    const chess2 = effect2.env.chess as SmartContract<typeof Chess>
    expect(chess2.withdraws).deep.eq([[token._root, whiteToken._id, 10n]])

    // White withdraws
    expect(whiteToken._rev).eq(await white.latest(whiteToken._rev))
    expect(whiteToken._owners).deep.eq([white.getPublicKey()])

    await sleep(3000)
    await whiteToken.withdraw(chess2._rev)
    expect(whiteToken.amount).eq(15n)
  })
})
