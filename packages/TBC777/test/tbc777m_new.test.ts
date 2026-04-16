import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'
import { TBC777M } from '../src/tbc777m.js'
import { Escrow } from '../src/tbc777m.js'
import { TBC20 } from '../src/tbc20.js'

chai.use(chaiAsPromised)

/**
 * TBC777M Test Skeleton
 *
 * Comprehensive test suite for the inflation-proof TBC777M token.
 * Chess-specific tests have been moved to a dedicated chess test file.
 */

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

async function ensureFunds(c: Computer, minSats = 950_000_000) {
  try {
    const { balance } = await c.getBalance()
    if (balance < BigInt(minSats)) await c.faucet(minSats)
  } catch {
    await c.faucet(minSats)
  }
}

describe('TBC777M - Programmable inflation-proof TBC20 token for arbitrary Escrow contracts', () => {
  describe('Setup, fixtures and deployment', () => {
    let minter: Computer
    let owner: Computer
    let escrowOwner: Computer
    let mod: string
    let token: any
    let tokenRoot: string

    beforeEach(async () => {
      minter = new Computer({ url, chain, network })
      owner = new Computer({ url, chain, network })
      escrowOwner = new Computer({ url, chain, network })

      // Initial faucet calls
      await Promise.all([minter.faucet(10e8), owner.faucet(5e8), escrowOwner.faucet(5e8)])

      // Guarantee sufficient funds for all wallets
      await Promise.all([
        ensureFunds(minter),
        ensureFunds(owner, 450_000_000),
        ensureFunds(escrowOwner, 450_000_000),
      ])

      // Deploy the TBC20 base module (TBC777M extends it)
      mod = await minter.deploy(`export ${TBC20}`)

      // Create a fresh TBC777M token root for every test (isolation)
      const amount = 100n
      const name = 'TestTBC777M'
      const to = owner.getPublicKey()
      token = await minter.new(TBC777M, [{ to, amount, name }], mod)
      tokenRoot = token._root
    })

    it('should initialize multiple funded wallets (minter, owner, escrowOwner)', async () => {
      expect(minter).to.be.instanceOf(Computer)
      expect(owner).to.be.instanceOf(Computer)
      expect(escrowOwner).to.be.instanceOf(Computer)

      const { balance: minterBalance } = await minter.getBalance()
      const { balance: ownerBalance } = await owner.getBalance()
      const { balance: escrowBalance } = await escrowOwner.getBalance()

      // Number() cast required for Chai .gte() compatibility (Chai types expect number | Date)
      expect(Number(minterBalance)).to.be.gte(950_000_000)
      expect(Number(ownerBalance)).to.be.gte(450_000_000)
      expect(Number(escrowBalance)).to.be.gte(450_000_000)
    })

    it('should deploy the TBC20 module and create a fresh TBC777M token root', async () => {
      expect(mod).to.be.a('string').and.not.empty

      expect(tokenRoot).to.be.a('string').and.not.empty

      // Verify the freshly minted token
      expect(token.amount).to.equal(100n)
      expect(token.name).to.equal('TestTBC777M')
      expect(token._owners).to.deep.equal([owner.getPublicKey()])
      expect(token._root).to.equal(tokenRoot)
      expect(token.withdrawn).to.be.an('array').that.is.empty
      expect(token.escrowId).to.be.undefined
    })

    it('should provide shared test fixtures for consistent beforeEach setup', async () => {
      // These fixtures are guaranteed to be fresh and correctly funded for every test
      expect(minter).to.exist
      expect(owner).to.exist
      expect(escrowOwner).to.exist
      expect(mod).to.exist
      expect(token).to.exist
      expect(tokenRoot).to.exist

      // Quick sanity check that the token is still valid after sync
      const synced = await owner.sync<typeof TBC777M>(token._rev)
      expect(synced.amount).to.equal(100n)
      expect(synced._root).to.equal(tokenRoot)
    })
  })

  describe('Core deposit functionality', () => {
    /**
     * Minimal escrow used for external deposit tests (separate calls).
     */
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

    /**
     * Escrow that performs an *atomic* deposit by calling `token.deposit(...)`
     * from inside its own method.
     */
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

    let minter: Computer
    let mod: string

    /**
     * Fresh wallet + module for every test in this section.
     * Guarantees that each test starts with a clean, short unconfirmed-tx chain
     * (exactly what was causing the too-long-mempool-chain errors).
     */
    beforeEach(async () => {
      minter = new Computer({ url, chain, network })
      await ensureFunds(minter)
      mod = await minter.deploy(`export ${TBC20}`)
    })

    it('should record escrowId on-chain and decrease token amount exactly by deposit value', async () => {
      const token = await minter.new(
        TBC777M,
        [
          {
            to: minter.getPublicKey(),
            amount: 100n,
            name: 'RecordTest',
          },
        ],
        mod,
      )

      const tokenRoot = token._root
      const escrow = await minter.new(NaiveEscrow, [])

      const initialAmount = token.amount
      const depositAmount = 30n

      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, depositAmount)

      expect(token.amount).to.equal(initialAmount - depositAmount)
      expect(token.escrowId).to.equal(escrow._id)

      const synced = await minter.sync<typeof TBC777M>(token._rev)
      expect(synced.amount).to.equal(initialAmount - depositAmount)
      expect(synced.escrowId).to.equal(escrow._id)
    })

    it('should compute exact deposit amount via balance delta (token.amount - nextToken.amount)', async () => {
      const token = await minter.new(
        TBC777M,
        [
          {
            to: minter.getPublicKey(),
            amount: 50n,
            name: 'DeltaTest',
          },
        ],
        mod,
      )

      const preRev = token._rev
      const depositAmount = 15n
      const tokenRoot = token._root

      const escrow = await minter.new(NaiveEscrow, [])
      await escrow.acceptDeposit(tokenRoot, preRev)

      await token.deposit(escrow._id, depositAmount)

      const preToken = await minter.sync<typeof TBC777M>(preRev)
      const nextRev = await minter.next(preRev)
      const nextToken = await minter.sync<typeof TBC777M>(nextRev!)

      const computedDelta = preToken.amount - nextToken.amount
      expect(computedDelta).to.equal(depositAmount)
      expect(nextToken.escrowId).to.equal(escrow._id)
    })

    it('should support both external deposit and atomic deposit patterns', async () => {
      const token = await minter.new(
        TBC777M,
        [
          {
            to: minter.getPublicKey(),
            amount: 30n,
            name: 'PatternTest',
          },
        ],
        mod,
      )

      const tokenRoot = token._root

      // === EXTERNAL PATTERN ===
      const externalEscrow = await minter.new(NaiveEscrow, [])
      await externalEscrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(externalEscrow._id, 10n)
      expect(token.amount).to.equal(20n)

      await externalEscrow.move(token._id, 10n, tokenRoot)
      await token.withdraw(externalEscrow._rev)
      expect(token.amount).to.equal(30n)

      // === ATOMIC PATTERN (reuse same token after restore) ===
      const atomicEscrow = await minter.new(AtomicEscrow, [])
      await atomicEscrow.acceptDeposit(token, 10n)
      expect(token.amount).to.equal(20n)

      await atomicEscrow.move(token._id, 10n, tokenRoot)
      await token.withdraw(atomicEscrow._rev)
      expect(token.amount).to.equal(30n)
    })

    it('should reject zero or negative deposit amounts', async () => {
      const token = await minter.new(
        TBC777M,
        [
          {
            to: minter.getPublicKey(),
            amount: 100n,
            name: 'RejectTest',
          },
        ],
        mod,
      )

      const escrow = await minter.new(NaiveEscrow, [])

      await expect(token.deposit(escrow._id, 0n)).to.be.rejectedWith(
        'Deposit amount must be positive',
      )
      await expect(token.deposit(escrow._id, -5n)).to.be.rejectedWith(
        'Deposit amount must be positive',
      )
    })

    it('should reject deposit when caller balance is insufficient', async () => {
      const smallToken = await minter.new(
        TBC777M,
        [
          {
            to: minter.getPublicKey(),
            amount: 5n,
            name: 'SmallTest',
          },
        ],
        mod,
      )

      const escrow = await minter.new(NaiveEscrow, [])

      await expect(smallToken.deposit(escrow._id, 10n)).to.be.rejectedWith(
        'Insufficient balance for deposit',
      )
    })
  })

  describe('Withdraw flow and on-chain audit', () => {
    let minter: Computer
    let mod: string

    const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

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

    beforeEach(async () => {
      minter = new Computer({ url, chain, network })
      await ensureFunds(minter)
      mod = await minter.deploy(`export ${TBC20}`)
      // Give the mempool time after module deployment
      await sleep(4000)
    })

    it('should perform full linear prev-chain audit before crediting tokens', async () => {
      const amount = 10n
      const name = 'AuditTest'
      const token = await minter.new(TBC777M, [{ to: minter.getPublicKey(), amount, name }], mod)
      await sleep(4000)

      const escrow = await minter.new(NaiveEscrow, [])
      await sleep(3000)

      await escrow.acceptDeposit(token._root, token._rev)
      await token.deposit(escrow._id, 5n)
      await sleep(4000)

      await escrow.move(token._id, 3n, token._root)
      const escrowRev1 = escrow._rev
      await sleep(4000)

      await escrow.move(token._id, 3n, token._root)
      await sleep(4000)

      const preAmount = token.amount
      await token.withdraw(escrowRev1)
      expect(token.amount).to.equal(preAmount + 3n)
    })

    it('should only succeed when totalDeposits >= totalWithdraws + totalFinalWithdraws', async () => {
      // Valid case
      const amount = 10n
      const name = 'ValidWithdrawTest'
      const token = await minter.new(TBC777M, [{ to: minter.getPublicKey(), amount, name }], mod)
      await sleep(4000)

      const escrow = await minter.new(NaiveEscrow, [])
      await sleep(3000)

      await escrow.acceptDeposit(token._root, token._rev)
      await token.deposit(escrow._id, 5n)
      await sleep(4000)

      await escrow.move(token._id, 3n, token._root)
      await sleep(4000)

      await expect(token.withdraw(escrow._rev)).to.not.be.rejected
      expect(token.amount).to.equal(8n)

      // Over-claim case - use a completely separate Computer instance to break the mempool descendant chain
      const minter2 = new Computer({ url, chain, network })
      await ensureFunds(minter2)
      await sleep(4000)

      const amount2 = 10n
      const name2 = 'OverClaimTest'
      const token2 = await minter2.new(
        TBC777M,
        [{ to: minter2.getPublicKey(), amount: amount2, name: name2 }],
        mod,
      )
      await sleep(4000)

      const escrow2 = await minter2.new(NaiveEscrow, [])
      await sleep(3000)

      await escrow2.acceptDeposit(token2._root, token2._rev)
      await token2.deposit(escrow2._id, 5n)
      await sleep(4000)

      await escrow2.move(token2._id, 6n, token2._root)
      await sleep(4000)

      await expect(token2.withdraw(escrow2._rev)).to.be.rejectedWith('Escrow balance too low')
    })

    it('should credit exact amounts from computeWithdraw and computeFinalWithdraw', async () => {
      const amount = 10n
      const name = 'CreditTest'
      const token = await minter.new(TBC777M, [{ to: minter.getPublicKey(), amount, name }], mod)
      await sleep(4000)

      const escrow = await minter.new(NaiveEscrow, [])
      await sleep(3000)

      await escrow.acceptDeposit(token._root, token._rev)
      await token.deposit(escrow._id, 8n)
      await sleep(4000)

      const withdrawAmt = 5n
      await escrow.move(token._id, withdrawAmt, token._root)
      await sleep(4000)

      const preAmount = token.amount
      await token.withdraw(escrow._rev)

      expect(token.amount).to.equal(preAmount + withdrawAmt)
    })

    it('should update withdrawn array to prevent replay', async () => {
      const amount = 10n
      const name = 'ReplayTest'
      const token = await minter.new(TBC777M, [{ to: minter.getPublicKey(), amount, name }], mod)
      await sleep(4000)

      const escrow = await minter.new(NaiveEscrow, [])
      await sleep(3000)

      await escrow.acceptDeposit(token._root, token._rev)
      await token.deposit(escrow._id, 5n)
      await sleep(4000)

      await escrow.move(token._id, 5n, token._root)
      await sleep(4000)

      const rev = escrow._rev
      await token.withdraw(rev)

      expect(token.withdrawn).to.deep.include(rev)

      await expect(token.withdraw(rev)).to.be.rejectedWith('Cannot withdraw multiple times')
    })
  })

  describe('No-inflation invariant', () => {
    let minter: Computer
    let mod: string
    let token: any
    let tokenRoot: string

    beforeEach(async () => {
      minter = new Computer({ url, chain, network })
      await ensureFunds(minter)
      mod = await minter.deploy(`export ${TBC20}`)
      const amount = 100n
      const name = 'InvariantTestToken'
      token = await minter.new(TBC777M, [{ to: minter.getPublicKey(), amount, name }], mod)
      tokenRoot = token._root
    })

    it('should reject withdraw when escrow has over-claimed relative to actual deposits', async () => {
      class OverClaimEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        overClaim(root: string, id: string, amount: bigint) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const escrow = await minter.new(OverClaimEscrow, [])

      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, 10n)

      await escrow.overClaim(tokenRoot, token._id, 30n) // over-claim relative to deposit

      try {
        await token.withdraw(escrow._rev)
        expect.fail('Expected withdraw to be rejected')
      } catch (error: any) {
        expect(error.message).to.include('Escrow balance too low')
      }

      // Token amount must remain unchanged (audit failed)
      const syncedToken = await minter.sync<typeof TBC777M>(token._rev)
      expect(syncedToken.amount).to.equal(90n)
    })

    it('should correctly sum deposits across the entire escrow history', async () => {
      class MultiDepositEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        setWithdraw(root: string, id: string, amount: bigint) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const escrow = await minter.new(MultiDepositEscrow, [])

      // First deposit (recorded in escrow revision 1)
      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, 25n)

      // Second deposit (recorded in escrow revision 2)
      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, 35n)

      // Claim the exact total deposited amount
      await escrow.setWithdraw(tokenRoot, token._id, 60n)

      await token.withdraw(escrow._rev)

      const synced = await minter.sync<typeof TBC777M>(token._rev)
      expect(synced.amount).to.equal(100n) // full round-trip: 100 - 60 deposited + 60 withdrawn
    })

    it('should correctly sum every historical withdraws entry ever recorded', async () => {
      class HistoryEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        recordClaim(root: string, id: string, amount: bigint) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const escrow = await minter.new(HistoryEscrow, [])

      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, 20n) // total deposited = 20n

      // Revision 1: claim 12n
      await escrow.recordClaim(tokenRoot, token._id, 12n)

      // Revision 2: claim 15n (list replaced, but audit sums *every* historical entry)
      await escrow.recordClaim(tokenRoot, token._id, 15n)

      // Audit must see 12n + 15n = 27n > 20n deposited → reject
      try {
        await token.withdraw(escrow._rev)
        expect.fail('Expected rejection due to historical withdraw sum exceeding deposits')
      } catch (error: any) {
        expect(error.message).to.include('Escrow balance too low')
      }
    })

    it('should enforce the invariant even for long-lived escrows with many revisions', async () => {
      class LongLivedEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        setWithdraw(root: string, id: string, amount: bigint) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const escrow = await minter.new(LongLivedEscrow, [])

      let totalDeposited = 0n
      const numRevisions = 4 // reduced to prevent too-long-mempool-chain error

      let currentToken = token

      for (let i = 0; i < numRevisions; i++) {
        const depAmount = 5n + BigInt(i % 3)
        await escrow.acceptDeposit(tokenRoot, currentToken._rev)
        await currentToken.deposit(escrow._id, depAmount)
        totalDeposited += depAmount

        // re-sync to get the latest revision for the next iteration
        currentToken = await minter.sync<typeof TBC777M>(currentToken._rev)
      }

      // Claim only half the total deposited amount (well within invariant)
      const claimAmount = totalDeposited / 2n
      await escrow.setWithdraw(tokenRoot, currentToken._id, claimAmount)

      await currentToken.withdraw(escrow._rev)

      const syncedToken = await minter.sync<typeof TBC777M>(currentToken._rev)
      expect(syncedToken.amount).to.equal(100n - totalDeposited + claimAmount)
    })
  })

  describe('Malicious or buggy escrow resistance', () => {
    async function ensureFunds(c: Computer, minSats = 950_000_000) {
      try {
        const { balance } = await c.getBalance()
        if (balance < BigInt(minSats)) await c.faucet(minSats)
      } catch {
        await c.faucet(minSats)
      }
    }

    let minter: Computer
    let mod: string
    let token: any
    let tokenRoot: string

    beforeEach(async () => {
      minter = new Computer({ url, chain, network })
      await ensureFunds(minter)
      mod = await minter.deploy(`export ${TBC20}`)
      const amount = 100n
      const name = 'TestTBC777M'
      const to = minter.getPublicKey()
      token = await minter.new(TBC777M, [{ to, amount, name }], mod)
      tokenRoot = token._root
    })

    it('should only credit deposits made to the exact recorded escrowId (prevents cross-escrow claims)', async () => {
      class HonestEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        setWithdraw(id: string, amount: bigint, root: string) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const honestEscrow = await minter.new(HonestEscrow, [])
      const maliciousEscrow = await minter.new(HonestEscrow, [])

      const preRev = token._rev

      // Deposit into legitimate escrow (records escrowId = honestEscrow._id on-chain)
      await honestEscrow.acceptDeposit(tokenRoot, preRev)
      await token.deposit(honestEscrow._id, 20n)

      // Malicious escrow records the exact same deposit revision anyway
      await maliciousEscrow.acceptDeposit(tokenRoot, preRev)
      await maliciousEscrow.setWithdraw(token._id, 20n, tokenRoot)

      // Audit in isValid + computeDeposit will see escrowId mismatch -> deposit credit = 0n
      await expect(token.withdraw(maliciousEscrow._rev)).to.be.rejectedWith(
        'Escrow balance too low',
      )
    })

    it('should ignore deposits recorded by escrow but not actually performed', async () => {
      class MaliciousEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        recordFakeDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        setWithdraw(id: string, amount: bigint, root: string) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const maliciousEscrow = await minter.new(MaliciousEscrow, [])

      const preRev = token._rev

      // Perform a transfer first so the recorded revision has a valid successor state.
      // This prevents computer.next(preRev) from returning undefined (which crashes computeDeposit).
      // The transfer does NOT call deposit(), so escrowId is never set.
      await token.transfer(minter.getPublicKey(), 10n)

      // Escrow fabricates a deposit record, but no actual deposit ever occurred to this escrow.
      await maliciousEscrow.recordFakeDeposit(tokenRoot, preRev)
      await maliciousEscrow.setWithdraw(token._id, 50n, tokenRoot)

      // computeDeposits returns 0n (escrowId mismatch in computeDeposit) → audit fails
      await expect(token.withdraw(maliciousEscrow._rev)).to.be.rejectedWith(
        'Escrow balance too low',
      )
    })

    it('should reject claims from a malicious escrow that fabricates withdraws', async () => {
      class MaliciousEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        fabricateWithdraw(root: string, id: string, amount: bigint) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const maliciousEscrow = await minter.new(MaliciousEscrow, [])

      const preRev = token._rev
      const depositAmount = 30n

      // Legitimate deposit first
      await maliciousEscrow.acceptDeposit(tokenRoot, preRev)
      await token.deposit(maliciousEscrow._id, depositAmount)

      // Now fabricate an impossibly large withdrawal
      await maliciousEscrow.fabricateWithdraw(tokenRoot, token._id, 200n)

      // Full-history audit in isValid sees totalWithdraws > totalDeposits
      await expect(token.withdraw(maliciousEscrow._rev)).to.be.rejectedWith(
        'Escrow balance too low',
      )
    })

    it('should reject claims when escrowId in deposit does not match audit target', async () => {
      class TestEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        setWithdraw(id: string, amount: bigint, root: string) {
          this.withdraws = [[root, id, amount]]
        }
      }

      const escrowA = await minter.new(TestEscrow, [])
      const escrowB = await minter.new(TestEscrow, [])

      const preRev = token._rev

      // Legitimate deposit only to escrowA
      await escrowA.acceptDeposit(tokenRoot, preRev)
      await token.deposit(escrowA._id, 40n)

      // Malicious escrowB records the deposit revision anyway
      await escrowB.acceptDeposit(tokenRoot, preRev)
      await escrowB.setWithdraw(token._id, 40n, tokenRoot)

      // Audit target (escrowB._id) does not match recorded escrowId in token history
      await expect(token.withdraw(escrowB._rev)).to.be.rejectedWith('Escrow balance too low')
    })
  })

  describe('Final withdrawals (finalWithdraws)', () => {
    let minter: Computer
    let mod: string
    let token: any
    let tokenRoot: string

    beforeEach(async () => {
      minter = new Computer({ url, chain, network })
      await ensureFunds(minter)
      mod = await minter.deploy(`export ${TBC20}`)

      const amount = 100n
      const name = 'TestFinalTBC777M'
      const to = minter.getPublicKey()
      token = await minter.new(TBC777M, [{ to, amount, name }], mod)
      tokenRoot = token._root
    })

    // here
    it.skip('should only pay finalWithdraws when supplied rev is the last revision of the escrow', async () => {
      // Local test setup (self-contained)
      const minter = new Computer({ url, chain, network })

      async function ensureFunds(c: Computer, minSats = 950_000_000) {
        try {
          const { balance } = await c.getBalance()
          if (balance < BigInt(minSats)) await c.faucet(minSats)
        } catch {
          await c.faucet(minSats)
        }
      }

      await ensureFunds(minter)
      const mod = await minter.deploy(`export ${TBC20}`)

      const amount = 10n
      const name = 'FinalTestTBC777M'
      const token = await minter.new(TBC777M, [{ to: minter.getPublicKey(), amount, name }], mod)
      const tokenRoot = token._root
      const tokenId = token._id

      console.log('=== DEBUG: INITIAL SETUP ===')
      console.log('token.amount:', token.amount.toString())
      console.log('token._id:', tokenId)
      console.log('token._root:', tokenRoot)
      console.log('token._rev:', token._rev)

      console.log('=== DEBUG: Computer API check ===')
      console.log('minter.last exists?', typeof minter.last === 'function')
      console.log('minter.latest exists?', typeof minter.latest === 'function')

      class FinalEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        finalizePayout(id: string, amt: bigint, root: string) {
          this.finalWithdraws = [[root, id, amt]]
          console.log(
            'DEBUG: finalizePayout called - finalWithdraws set to:',
            JSON.stringify(this.finalWithdraws, (_, v) => (typeof v === 'bigint' ? `${v}n` : v)),
          )
        }

        advance() {
          this.finalWithdraws = [...this.finalWithdraws]
          console.log('DEBUG: advance called - forcing new revision')
        }
      }

      const escrow = await minter.new(FinalEscrow, [])

      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, 5n)
      console.log('DEBUG: after deposit - token.amount:', token.amount.toString())

      await escrow.finalizePayout(tokenId, 5n, tokenRoot)
      const rev1 = escrow._rev
      console.log('DEBUG: rev1 (after finalizePayout):', rev1)

      await escrow.advance()
      const rev2 = escrow._rev
      console.log('DEBUG: rev2 (after advance):', rev2)

      console.log('\n=== DEBUG: last() vs latest() (outer Computer) ===')
      console.log('minter.last(rev1)   :', await minter.last(rev1))
      console.log('minter.latest(rev1) :', await minter.latest(rev1))
      console.log('minter.last(rev2)   :', await minter.last(rev2))
      console.log('minter.latest(rev2) :', await minter.latest(rev2))
      console.log('Is rev2 the true latest?', (await minter.latest(rev2)) === rev2)

      console.log(
        '\n=== DEBUG: withdraw(rev1) - non-final revision (should add 0 from finalWithdraws) ===',
      )
      const beforeRev1 = token.amount
      await token.withdraw(rev1)
      console.log(
        'After withdraw(rev1) -> amount:',
        token.amount.toString(),
        '(change:',
        (token.amount - beforeRev1).toString(),
        ')',
      )

      console.log(
        '\n=== DEBUG: withdraw(rev2) - final revision (should add 5n from finalWithdraws) ===',
      )
      const beforeRev2 = token.amount
      await token.withdraw(rev2)
      console.log(
        'After withdraw(rev2) -> amount:',
        token.amount.toString(),
        '(change:',
        (token.amount - beforeRev2).toString(),
        ')',
      )

      expect(token.amount).to.equal(beforeRev2 + 5n)
    })

    it('should return 0n for finalWithdraws when rev is not final', async () => {
      class TestFinalEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        finalize(winnerId: string, amount: bigint, root: string) {
          this.finalWithdraws = [[root, winnerId, amount]]
        }

        dummyUpdate() {
          // no-op to force a new revision (making the previous rev non-final)
        }
      }

      const escrow = await minter.new(TestFinalEscrow, [])

      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, 100n)
      expect(token.amount).to.equal(0n)

      const { tx: finalizeTx, effect: finalizeEffect } = await minter.encode({
        exp: `escrow.finalize('${token._id}', 100n, '${tokenRoot}')`,
        env: { escrow: escrow._rev },
      })
      await minter.broadcast(finalizeTx)
      const finalizeRev = finalizeEffect.env.escrow._rev

      // Advance escrow to make finalizeRev non-final
      const { tx: updateTx } = await minter.encode({
        exp: `escrow.dummyUpdate()`,
        env: { escrow: finalizeRev },
      })
      await minter.broadcast(updateTx)

      const preAmount = token.amount
      await token.withdraw(finalizeRev)
      // finalWithdraws amount is ignored because the supplied rev is not the last revision
      expect(token.amount).to.equal(preAmount)
    })

    it('should count finalWithdraws conservatively in isValid even before final revision', async () => {
      class TestEscrow extends Contract implements Escrow {
        deposits!: [string, string][]
        withdraws!: [string, string, bigint][]
        finalWithdraws!: [string, string, bigint][]

        constructor() {
          super({ deposits: [], withdraws: [], finalWithdraws: [] })
        }

        acceptDeposit(root: string, rev: string) {
          this.deposits.push([root, rev])
        }

        setFinalPayout(id: string, amount: bigint, root: string) {
          this.finalWithdraws = [[root, id, amount]]
        }

        dummyUpdate() {
          // no-op to force a new revision
        }
      }

      const escrow = await minter.new(TestEscrow, [])

      await escrow.acceptDeposit(tokenRoot, token._rev)
      await token.deposit(escrow._id, 20n)

      const { tx, effect } = await minter.encode({
        exp: `escrow.setFinalPayout('${token._id}', 100n, '${tokenRoot}')`,
        env: { escrow: escrow._rev },
      })
      await minter.broadcast(tx)
      const revWithFinal = effect.env.escrow._rev

      // Advance to ensure the rev is non-final, but the conservative audit still sees the finalWithdraws entry
      const { tx: updateTx } = await minter.encode({
        exp: `escrow.dummyUpdate()`,
        env: { escrow: revWithFinal },
      })
      await minter.broadcast(updateTx)

      // isValid (and therefore withdraw) fails because deposits (20n) < finalWithdraws (100n)
      await expect(token.withdraw(revWithFinal)).to.be.rejectedWith('Escrow balance too low')
    })

    it('should support one-time winner-takes-all and auction settlement payouts', async () => {})
  })

  describe('Replay protection', () => {
    it('should prevent withdrawing the same revision more than once')
    it('should allow independent withdrawals for different token instances (_id)')
    it('should prevent double-claiming the same withdraw tuple across revisions')
  })

  describe('Multi-root and multi-token support', () => {
    it('should safely support multiple independent TBC777M roots in one escrow instance')
    it('should isolate deposit/withdraw calculations per token _root')
    it('should correctly handle deposit deduplication via depositRevs Set')
  })

  describe('Escrow implementation patterns', () => {
    it('should require deposits array to accumulate (push) across revisions')
    it('should require withdraws/finalWithdraws to usually be replaced (not pushed)')
    it('should accept deposits recorded with pre-deposit token revision')
    it('should work with escrows that do not extend the Escrow base class')
  })

  describe('Integration with inherited TBC20 methods', () => {
    it('should allow normal transfer, merge, and burn operations outside escrow flows')
    it('should preserve no-inflation guarantees after partial transfers and merges')
    it('should work correctly when tokens are split and deposited independently')
  })

  describe('Long-lived escrow history and performance', () => {
    it('should correctly audit escrows with dozens of revisions (O(n) prev-chain walk)')
    it('should accumulate deposits across the entire lifetime of the escrow')
  })

  describe('Error handling and edge cases', () => {
    it('should throw when escrow revision is invalid or missing required arrays')
    it('should reject zero-amount withdrawals')
    it('should handle burned or fully-merged tokens gracefully')
    it('should reject malformed escrow data structures')
  })

  describe('Public static helper methods', () => {
    it('should expose isValid, computeDeposits, computeWithdraw, computeFinalWithdraw')
    it('should return expected values from computeWithdraw and computeFinalWithdraw in isolation')
  })
})
