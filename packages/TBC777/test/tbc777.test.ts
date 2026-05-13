import { expect } from 'chai'
import {
  branded,
  Computer,
  GlobalComputer,
  Id,
  Rev,
  Root,
  SmartContract,
} from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'
import { TBC20 } from '../src/tbc20.js'
import { Amount, Escrow, TBC777, EscrowAuditor, type AuditResult } from '../src/tbc777.js'

const envPaths = [path.resolve(process.cwd(), './packages/node/.env'), '../node/.env']

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const waitForConfirmation = (ms: number = 3000): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const INITIAL_AMOUNT = 30n
const TEST_NAME = 'test'
const TEST_SYMBOL = 'TST'
const FRESH_TOKEN_AMOUNT = 10n
const DEPOSIT_AMOUNT = 5n
/**
 * Strips all comments (JSDoc, block, and line) from a class source string and
 * collapses empty lines. Keeps the code valid and much smaller.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* ... */ (including JSDoc)
    .replace(/\/\/.*$/gm, '') // remove // comments
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

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
let rootToken: SmartContract<typeof TBC777>

async function ensureFunds(c: Computer, minSats = 20e8) {
  try {
    const { balance } = await c.getBalance()
    if (balance < minSats) await c.faucet(minSats)
  } catch {
    await c.faucet(minSats)
  }
}

describe.only('TBC777 - Programmable Escrow Token (No-Inflation Focus)', () => {
  before(async () => {
    minter = new Computer({ url, chain, network })
    black = new Computer({ url, chain, network })
    white = new Computer({ url, chain, network })

    await Promise.all([black.faucet(2e8), white.faucet(2e8), minter.faucet(2e8)])
    await ensureFunds(minter, 2e8)

    // Strip comments from all three classes before deploying
    const tbc20Source = stripComments(TBC20.toString())
    const escrowSource = stripComments(EscrowAuditor.toString())
    const tbc777Source = stripComments(TBC777.toString())

    mod = await minter.deploy(`
      export ${tbc20Source}
      export ${escrowSource}
      export ${tbc777Source}
    `)

    await ensureFunds(minter, 20e8)

    const amount = INITIAL_AMOUNT
    const name = TEST_NAME
    const symbol = TEST_SYMBOL
    const to = minter.getPublicKey()
    const exp = `new TBC777({ to: '${to}', amount: ${amount}n, name: '${name}', symbol: '${symbol}' })`
    const { effect, tx } = await minter.encode({ exp, mod })
    rootToken = branded(effect.res as SmartContract<typeof TBC777>)
    await minter.broadcast(tx)
  })

  beforeEach(async () => {
    await Promise.all([black.faucet(2e8), white.faucet(2e8), minter.faucet(2e8)])
    await ensureFunds(minter, 2e8)
  })

  // ============================================================
  // TEST HELPERS (Defined at top level so they are available everywhere)
  // ============================================================

  /**
   * Creates a minimal NaiveEscrow implementation for testing.
   */
  async function createNaiveEscrow(c: Computer = minter) {
    class NaiveEscrow extends Contract implements Escrow {
      deposits!: [Root, Rev][]
      withdraws!: [Root, Id, Amount][]
      finalWithdraws!: [Root, Id, Amount][]

      constructor() {
        super({ deposits: [], withdraws: [], finalWithdraws: [] })
      }

      async acceptDeposit(token: any, amount: Amount, nextOwner?: string) {
        token.deposit(this._id, amount)
        this.deposits.push(token.depositTuple)
        if (nextOwner) this._owners = [nextOwner]
      }

      move(id: Id, amount: Amount, root: Root) {
        this.withdraws = [[root, id, amount]]
      }

      setFinalWithdraw(id: Id, amount: Amount, root: Root) {
        this.finalWithdraws = [[root, id, amount]]
      }
    }
    return c.new(NaiveEscrow, [])
  }

  /** Atomic deposit (recommended pattern) */
  async function depositAtomic(
    token: any,
    escrow: any,
    amount: Amount,
    depositor: Computer = minter,
    nextOwner?: string,
  ) {
    const { tx, effect } = await depositor.encode({
      exp: `escrow.acceptDeposit(token, ${amount}n${nextOwner ? `, '${nextOwner}'` : ''})`,
      env: { escrow: escrow._rev, token: token._rev },
    })
    await depositor.broadcast(tx)

    // Return both updated objects so callers can re-bind if needed
    return {
      escrow: effect.env.escrow as SmartContract<typeof Escrow>,
      token: effect.env.token as any, // ← this is the key line
    }
  }

  /** Manual (non-atomic) deposit */
  async function depositManual(token: any, escrow: Id, amount: Amount) {
    token.deposit(escrow, amount)
  }

  async function withdraw(token: any, escrowRev: Rev, isFinal = false) {
    await token.withdraw(escrowRev, isFinal)
  }

  async function withdrawFinal(token: any, escrowRev: Rev) {
    await token.withdraw(escrowRev, true)
  }

  /**
   * Primary no-inflation assertion helper. Uses only the safe getBalance path
   * (EscrowAuditor.audit is only available inside smart contracts).
   */
  async function assertNoInflation(escrowRev: Rev, token: any) {
    const balance = await token.getBalance(escrowRev)
    expect(balance >= 0n).eq(true)
  }

  /** Create a fresh token instance (via transfer for efficiency) */
  /** Create a fresh token instance (mint fresh each time to avoid depleting
   * shared root) */
  async function createFreshToken(amount = FRESH_TOKEN_AMOUNT, owner = minter.getPublicKey()) {
    const exp = `new TBC777({ to: '${owner}', amount: ${amount}n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}' })`
    const { effect, tx } = await minter.encode({ exp, mod })
    const fresh = branded(effect.res as SmartContract<typeof TBC777>)
    await minter.broadcast(tx)
    return fresh
  }

  // ============================================================
  // PRIMARY GOAL: NO-INFLATION INVARIANT
  // ============================================================
  describe('No-Inflation Invariant (Core Security Guarantee)', () => {
    it('maintains non-negative balance after single deposit + full withdraw', async () => {
      const escrow = await createNaiveEscrow()
      let t = await createFreshToken()

      const { escrow: escrow1, token: updatedToken } = await depositAtomic(
        t,
        escrow,
        DEPOSIT_AMOUNT,
      )
      t = updatedToken // re-bind so the test sees the post-deposit state (amount === 5n)

      await (escrow1 as any).move(t._id, DEPOSIT_AMOUNT, t.root as Root) // now on the post-deposit rev

      await withdraw(t, escrow1._rev as Rev)
      await assertNoInflation(escrow1._rev as Rev, t)
      expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT)
    })

    it('rejects over-claim (withdraws > deposited) with "Escrow balance too low"', async () => {
      const escrow = await createNaiveEscrow()
      let t = await createFreshToken()

      const { escrow: escrow1, token: updatedToken } = await depositAtomic(
        t,
        escrow,
        DEPOSIT_AMOUNT,
      )
      t = updatedToken

      // Malicious escrow over-claims far more than was deposited
      await (escrow1 as any).move(t._id, 100n, t.root as Root)

      try {
        await withdraw(t, escrow1._rev as Rev)
        expect.fail('should have thrown on over-claim')
      } catch (e: any) {
        expect(e.message).to.include('Escrow available balance')
      }
    })

    it('rejects cumulative inflation across multiple revisions in escrow history', async () => {
      const escrow = await createNaiveEscrow()
      let t = await createFreshToken()

      const { escrow: escrow1, token: updatedToken } = await depositAtomic(
        t,
        escrow,
        DEPOSIT_AMOUNT,
      )
      t = updatedToken

      // First revision records a small claim
      await (escrow1 as any).move(t._id, 1n, t.root as Root)

      // Second revision overwrites with a huge claim. The auditor walks the
      // full prev-chain and sums *all* historical withdraw entries (1n + 100n >
      // 5n deposited) → availableBalance < 0 → reject.
      await (escrow1 as any).move(t._id, 100n, t.root as Root)

      try {
        await withdraw(t, escrow1._rev as Rev)
        expect.fail('should have thrown on cumulative inflation')
      } catch (e: any) {
        expect(e.message).to.include('Escrow available balance')
      }
    })

    it('withdrawn[] array prevents replay (even after transfer)', async () => {
      const escrow = await createNaiveEscrow()
      let t = await createFreshToken()

      const { escrow: escrow1, token: updatedToken } = await depositAtomic(
        t,
        escrow,
        DEPOSIT_AMOUNT,
      )
      t = updatedToken

      await (escrow1 as any).move(t._id, DEPOSIT_AMOUNT, t.root as Root)

      await withdraw(t, escrow1._rev as Rev)
      await assertNoInflation(escrow1._rev as Rev, t)
      expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT)

      // replay on same token instance
      try {
        await withdraw(t, escrow1._rev as Rev)
        expect.fail('should have thrown on replay')
      } catch (e: any) {
        expect(e.message).to.include('Cannot withdraw multiple times')
      }

      // even after full transfer (withdrawn list travels with the token)
      await t.transfer(white.getPublicKey())
      const whiteToken = await white.sync<typeof TBC777>(t._rev)
      try {
        await withdraw(whiteToken, escrow1._rev as Rev)
        expect.fail('should have thrown on replay after transfer')
      } catch (e: any) {
        expect(e.message).to.include('Cannot withdraw multiple times')
      }
    })

    it('finalWithdrawn[] prevents replay of final claims', async () => {
      // TODO
    })

    it('finalWithdraw only succeeds on the last revision of the escrow', async () => {
      const escrow = await createNaiveEscrow()
      let t = await createFreshToken()

      const { escrow: escrow1, token: updatedToken } = await depositAtomic(
        t,
        escrow,
        DEPOSIT_AMOUNT,
      )
      t = updatedToken

      await (escrow1 as any).setFinalWithdraw(t._id, DEPOSIT_AMOUNT, t.root as Root)
      const firstRev = escrow1._rev as Rev

      await (escrow1 as any).setFinalWithdraw(t._id, DEPOSIT_AMOUNT, t.root as Root)
      const lastRev = escrow1._rev as Rev

      try {
        await t.finalWithdraw(firstRev)
        expect.fail('should have thrown on non-last rev')
      } catch (e: any) {
        expect(e.message).to.include('Claimable final withdraw amount is zero or negative')
      }

      await minter.delete([lastRev])

      await t.finalWithdraw(lastRev)
      expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT)
    })

    it('filters claims to only compatible tokens via isEqualTo', async () => {
      // TODO: mint incompatible token + claim both → only compatible token is
      // credited
    })

    it('cross-escrow claim is rejected (escrow + successor revision check)', async () => {
      // TODO
    })

    it('malicious escrow pushing fake/duplicate/invalid revs is rejected by audit', async () => {
      // TODO
    })

    it('remoteRoot tokens respect isValidMint and cannot inflate value', async () => {
      // Create a completely fresh token directly
      const amount = 10n
      const exp = `new TBC777({ to: '${minter.getPublicKey()}', amount: ${amount}n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}' })`
      const { effect, tx } = await minter.encode({ exp, mod })
      const freshToken = branded(effect.res as SmartContract<typeof TBC777>)
      await minter.broadcast(tx)

      const escrow = await createNaiveEscrow()
      let t = await minter.sync<typeof TBC777>(freshToken._rev)

      const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, 5n)
      t = updatedToken
      await (escrow1 as any).move(t._id, 5n, t.root as Root)

      // Good case
      const goodExp = `new TBC777({ to: '${minter.getPublicKey()}', amount: 0n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}', remoteRoot: '${t.root}', withdrawn: ['${escrow1._rev}'] })`
      const { effect: effectGood, tx: txGood } = await minter.encode({ exp: goodExp, mod })
      const goodRemote = effectGood.res as SmartContract<typeof TBC777>
      await minter.broadcast(txGood)

      const { effect: isValidGood } = await minter.encode({
        exp: `TBC777.isValidMint(goodRemote)`,
        env: { goodRemote: goodRemote._rev },
        mod,
      })
      expect(isValidGood.res).to.be.true

      // Bad case 1: constructor rejects amount > 0n
      expect(
        () =>
          new TBC777({
            to: minter.getPublicKey(),
            amount: 5n,
            name: TEST_NAME,
            symbol: TEST_SYMBOL,
            remoteRoot: 'abc:0' as any,
            withdrawn: ['def:0' as Rev],
          }),
      ).to.throw('Remote-root tokens must be created with amount 0n')

      // Bad case 2
      const badExp = `new TBC777({ to: '${minter.getPublicKey()}', amount: 0n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}', remoteRoot: '${t.root}' })`
      const { effect: effectBad, tx: txBad } = await minter.encode({ exp: badExp, mod })
      const badRemote = effectBad.res as SmartContract<typeof TBC777>
      await minter.broadcast(txBad)

      const { effect: isValidBad } = await minter.encode({
        exp: `TBC777.isValidMint(badRemote)`,
        env: { badRemote: badRemote._rev },
        mod,
      })
      expect(isValidBad.res).to.be.false
    })
  })

  // ============================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================
  describe('Lifecycle: deposit / withdraw / finalWithdraw', () => {
    // here
    it('atomic deposit correctly sets escrow and reduces token balance', async () => {
      // TODO
    })

    it('withdraw clears escrow after successful claim', async () => {
      // TODO
    })

    it('getBalance remains consistent with manual audit at every step', async () => {
      // TODO
    })
  })

  // ============================================================
  // LINEAGE & COMPATIBILITY
  // ============================================================
  describe('Lineage Compatibility (isEqualTo / isSameLineageSync / semantic)', () => {
    it('fast path returns true for same-lineage tokens (no remoteRoot)', async () => {
      // TODO
    })

    it('semantic comparison accepts valid remoteRoot tokens', async () => {
      // TODO
    })

    it('rejects inline-class / shadowing attacks via makeRegex', async () => {
      // TODO
    })
  })

  // ============================================================
  // REMOTE ROOT / TRANSFERRABLE VALUE
  // ============================================================
  describe('remoteRoot & Cross-Lineage Flows', () => {
    it('isValidMint returns true only when claimed amount ≤ total offered', async () => {
      // TODO
    })

    it('remote token can be deposited into a new escrow and claimed successfully', async () => {
      // TODO
    })
  })

  // ============================================================
  // ERROR HANDLING & EDGE CASES
  // ============================================================
  describe('Error Handling & Edge Cases', () => {
    it('rejects deposit ≤ 0n', async () => {
      // TODO: expect throw 'Deposit amount must be positive'
    })

    it('rejects claim of zero amount', async () => {
      // TODO
    })

    it('merge() is permanently disabled with clear error message', async () => {
      // TODO: expect(token.merge.bind(token, [])).to.throw(/merge\(\) is
      // disabled in TBC777/)
    })

    it('transfer of token with active escrow produces fresh recipient state', async () => {
      // TODO: verify escrow, withdrawn, and finalWithdrawn are reset on new
      // owner
    })

    it('rejects tokens created by defining a malicious class inside the expression (inline class definition / shadowing attack)', async () => {
      // TODO
    })
  })

  // ============================================================
  // ESCROW AUDITOR INTERNALS
  // ============================================================
  describe('EscrowAuditor Correctness', () => {
    it('walkPrevChain traverses the complete revision history', async () => {
      // TODO
    })

    it('computeDeposit correctly calculates delta using successor revision', async () => {
      // TODO
    })

    it('sumCompatibleClaimAmounts uses only isEqualTo (not isValidMint) for claims', async () => {
      // TODO
    })

    it('very long escrow revision histories are handled correctly by the auditor', async () => {
      // TODO: stress test full prev-chain walk with many revisions
    })
  })

  // ============================================================
  // KEY SCENARIOS
  // ============================================================
  describe('Key Scenarios (Ready for Implementation)', () => {
    it('Single deposit → full withdrawal', async () => {
      // TODO: complete happy path + assertNoInflation
    })

    it('Multiple deposits from different owners → partial claims', async () => {
      // TODO
    })

    it('Deposit → transfer token → claim from new owner', async () => {
      // TODO
    })

    it('Final withdraw on last revision vs non-last revision', async () => {
      // TODO
    })

    it('Attempted inflation via incompatible token', async () => {
      // TODO
    })

    it('Cross-lineage (remoteRoot) complete flow with isValidMint validation', async () => {
      // TODO
    })

    it('concurrent claims from multiple tokens on the same escrow respect inRevs ordering', async () => {
      // TODO
    })
  })
})

// ============================================================
// UNIT TESTS FOR makeRegex
// ============================================================
describe.only('TBC777.makeRegex (unit)', () => {
  const validTo = '02abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'
  const validName = 'test'
  const validSymbol = 'TST'

  function makeExp(
    to = validTo,
    amount = '30',
    name = validName,
    symbol = validSymbol,
    extra = '',
  ) {
    return `new TBC777({to:'${to}',amount:${amount}n,name:'${name}',symbol:'${symbol}'${extra}})`
  }

  it('accepts valid initial constructor expression', () => {
    const regex = TBC777.makeRegex(makeExp())
    expect(regex.test(makeExp())).to.equal(true)
  })

  it('accepts remoteRoot constructor with extra fields', () => {
    const exp = makeExp(validTo, '7', 'test', 'TST', `,remoteRoot:'abc:0',withdrawn:['def:0']`)
    const regex = TBC777.makeRegex(exp)
    expect(regex.test(exp)).to.equal(true)
  })

  it('rejects invalid to length, prefix, or non-hex characters', () => {
    expect(() => TBC777.makeRegex(makeExp('04' + 'a'.repeat(64)))).to.throw()
  })

  it('rejects negative amounts', () => {
    expect(() => TBC777.makeRegex(makeExp(validTo, '-10'))).to.throw()
  })

  it('rejects inline class / shadowing attacks', () => {
    const malicious = `new (class extends TBC777 {...})({to:'${validTo}',amount:30n,name:'test',symbol:'TST'})`
    const regex = TBC777.makeRegex(makeExp())
    expect(regex.test(malicious)).to.equal(false)
  })
})
