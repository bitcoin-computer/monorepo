import { expect } from 'chai'
import { Computer, Contract, SmartContract } from '@bitcoin-computer/lib'
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

async function mine(c: Computer = minter, blocks: number = 1) {
  return c.db.wallet.restClient.mine(blocks)
}

describe('TBC777M', () => {
  beforeEach(async () => {
    minter = new Computer({ url, chain, network })
    black = new Computer({ url, chain, network })
    white = new Computer({ url, chain, network })
    await Promise.all([black.faucet(10e8), white.faucet(1e8), minter.faucet(10e8)])
    await ensureFunds(minter)
    mod = await minter.deploy(`export ${TBC20}`)
    // Confirm module deploy so any InnerComputer.load of `mod` is stable.
    await mine()
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

    await mine()
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

    await mine()
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
    await chess.acceptDeposit(whiteToken, 4n, black.getPublicKey())
    expect(chess._owners).deep.eq([black.getPublicKey()])

    // Black player places their wager
    const blackToken = await black.sync<typeof TBC777M>(blackTokenM!._rev)
    const { tx: tx1, effect: effect1 } = await black.encode({
      exp: `chess.acceptDeposit(blackToken, 6n, '${white.getPublicKey()}')`,
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
    await mine()

    await whiteToken.withdraw(chess2._rev)
    expect(whiteToken.amount).eq(16n)
  })

  describe('escrow audit', () => {
    // An escrow that lets its owner authorize any payout. The token must stay
    // safe even when the escrow is malicious, so these tests use it to
    // over-authorize on purpose.
    class OpenEscrow extends Contract implements Escrow {
      deposits!: [string, string][]
      withdraws!: [string, string, bigint][]
      finalWithdraws!: [string, string, bigint][]

      constructor() {
        super({ deposits: [], withdraws: [], finalWithdraws: [] })
      }

      acceptDeposit(root: string, rev: string) {
        this.deposits.push([root, rev])
      }

      setWithdraws(withdraws: [string, string, bigint][]) {
        this.withdraws = withdraws
      }

      setFinalWithdraws(finalWithdraws: [string, string, bigint][]) {
        this.finalWithdraws = finalWithdraws
      }
    }

    // A write returns before the node has indexed its spend, so the next write
    // can pick an already-spent fee output (txn-mempool-conflict). Wait for it.
    const indexed = (rev: string) => minter.waitForIndexed(rev)

    // Mints 3n to the minter and deposits 2n of it into a fresh escrow.
    async function depositTwo() {
      const to = minter.getPublicKey()
      const token = await minter.new(TBC777M, [{ to, amount: 3n, name: 'test' }], mod)
      await indexed(token._rev)
      const escrow = await minter.new(OpenEscrow, [])
      await indexed(escrow._rev)
      await escrow.acceptDeposit(token._root, token._rev)
      await indexed(escrow._rev)
      await token.deposit(escrow._id, 2n)
      await indexed(token._rev)
      expect(token.amount).eq(1n)
      return { token, escrow }
    }

    // The audit runs inside the contract, where only confirmed revisions are
    // visible. mine() returns before the node has indexed the new block, so
    // wait until the node reports rev as confirmed.
    async function mineAndConfirm(rev: string) {
      await mine()
      const deadline = Date.now() + 30_000
      while (!(await minter.getTXOs({ rev, isConfirmed: true })).length) {
        if (Date.now() > deadline) throw new Error(`${rev} not confirmed after 30s`)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // finalWithdraws are paid only from the escrow's last revision, and
    // InnerComputer only reports a last revision once the tip is spent in a
    // confirmed transaction. The tip and its spend are mined in the same block.
    async function closeEscrow(escrow: { _rev: string }) {
      await indexed(escrow._rev)
      await minter.delete([escrow._rev])
      await mineAndConfirm(escrow._rev)
    }

    it('rejects a withdraw of more than was deposited', async () => {
      const { token, escrow } = await depositTwo()
      await escrow.setWithdraws([[token._root, token._id, 1000n]])
      await mineAndConfirm(escrow._rev)

      try {
        await token.withdraw(escrow._rev)
        expect.fail('should have thrown on over-claim')
      } catch (e: any) {
        expect(e.message).to.include('too low')
      }
      expect(token.amount).eq(1n)
    })

    it('rejects a negative claim that would offset an over-claim', async () => {
      const { token, escrow } = await depositTwo()
      // Summed, the two claims equal the 2n deposit.
      await escrow.setWithdraws([
        [token._root, token._id, 1000n],
        [token._root, 'a-token-that-never-withdraws', -998n],
      ])
      await mineAndConfirm(escrow._rev)

      try {
        await token.withdraw(escrow._rev)
        expect.fail('should have thrown on a negative claim')
      } catch (e: any) {
        expect(e.message).to.include('must be non-negative')
      }
      expect(token.amount).eq(1n)
    })

    it('allows a partial withdraw while the escrow still holds the rest', async () => {
      const { token, escrow } = await depositTwo()
      await escrow.setWithdraws([[token._root, token._id, 1n]])
      await mineAndConfirm(escrow._rev)

      await token.withdraw(escrow._rev)
      expect(token.amount).eq(2n)
    })

    it('pays a final withdraw from the last revision', async () => {
      const { token, escrow } = await depositTwo()
      await escrow.setFinalWithdraws([[token._root, token._id, 2n]])
      const lastRev = escrow._rev
      await closeEscrow(escrow)

      await token.withdrawFinal(lastRev)
      expect(token.amount).eq(3n)
    })

    it('rejects final withdraws that together exceed the deposits', async () => {
      const { token, escrow } = await depositTwo()
      const other = await token.transfer(minter.getPublicKey(), 1n)
      await indexed(other!._rev)
      expect(token.amount).eq(0n)

      // Each entry alone is covered by the 2n deposit; together they are not.
      await escrow.setFinalWithdraws([
        [token._root, token._id, 2n],
        [token._root, other!._id, 2n],
      ])
      const lastRev = escrow._rev
      await closeEscrow(escrow)

      for (const t of [token, other!]) {
        try {
          await t.withdrawFinal(lastRev)
          expect.fail('should have thrown on over-authorized final withdraws')
        } catch (e: any) {
          expect(e.message).to.include('too low')
        }
      }
      expect(token.amount).eq(0n)
      expect(other!.amount).eq(1n)
    })
  })
})
