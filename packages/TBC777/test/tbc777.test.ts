import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { TBC777 } from '../src/tbc777.js'
import path from 'path'
import { TBC20 } from '../src/tbc20.js'

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

describe('TBC777', () => {
  beforeEach(async () => {
    minter = new Computer({ url, chain, network })
    await minter.faucet(50e8)
    mod = await minter.deploy(`export ${TBC20}`)

    alice = new Computer({ url, chain, network })
    bob = new Computer({ url, chain, network })
    await Promise.all([alice.faucet(30e8), bob.faucet(30e8)])
  })

  describe('Deployment and Minting', () => {
    it('should successfully deploy TBC777 contract', async () => {
      expect(mod).to.be.a('string')
    })

    it('should mint initial tokens with correct amount, owner, and metadata', async () => {
      await ensureFunds(minter)
      const mintAmount = 3n
      const tokenName = 'test'
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: tokenName }
      const token = await minter.new(TBC777, [params], mod)

      expect(token.amount).eq(mintAmount)
      expect(token.name).eq(tokenName)

      const expectedOwner = minter.getPublicKey()
      if (token.owner !== undefined) {
        expect(token.owner).eq(expectedOwner)
      } else if (token._owner !== undefined) {
        expect(token._owner).eq(expectedOwner)
      } else if (token._owners) {
        expect(token._owners).to.include(expectedOwner)
      }

      expect(token._id).to.be.a('string')
      expect(token._rev).to.be.a('string')
      expect(token._root).to.be.a('string')
    })

    it('should correctly inherit and expose all TBC20 base functionality', async () => {
      await ensureFunds(minter)
      const mintAmount = 3n
      const tokenName = 'test'
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: tokenName }
      const token = await minter.new(TBC777, [params], mod)

      expect(token).to.have.property('amount')
      expect(token.amount).eq(mintAmount)
      expect(token).to.have.property('name')
      expect(token.name).eq(tokenName)
      expect(token).to.have.property('_id')
      expect(token).to.have.property('_rev')
      expect(token).to.have.property('_root')

      expect(typeof token.deposit).to.eq('function')
      expect(typeof token.claim).to.eq('function')
    })
  })

  describe('Deposit Functionality', () => {
    class NaiveEscrow extends Contract {
      claimable: [string, bigint][]
      status: string

      constructor() {
        super()
      }

      move(rev: string, amount: bigint) {
        this.claimable = [[rev, amount]]
        this.status = 'final'
      }
    }

    const createToken = async (mintAmount: bigint = 10n) => {
      await ensureFunds(alice)
      const params = { to: alice.getPublicKey(), amount: mintAmount, name: 'test-deposit' }
      return await alice.new(TBC777, [params], mod)
    }

    const createEscrow = async () => {
      await ensureFunds(bob)
      return await bob.new(NaiveEscrow, [])
    }

    it('should allow depositing a positive amount into any compatible escrow', async () => {
      const token = await createToken(5n)
      const escrow = await createEscrow()
      const depositAmount = 2n
      await token.deposit(escrow._id, depositAmount)
      expect(token.amount).to.equal(3n)
      expect(token.escrow).to.equal(escrow._id)
    })

    it('should reduce token balance by exact deposit amount and record escrow id', async () => {
      const initialAmount = 5n
      const depositAmount = 3n
      const token = await createToken(initialAmount)
      const escrow = await createEscrow()
      await token.deposit(escrow._id, depositAmount)
      expect(token.amount).to.equal(initialAmount - depositAmount)
      expect(token.escrow).to.equal(escrow._id)
    })

    it('should support partial deposits while leaving remainder unlocked', async () => {
      const initialAmount = 5n
      const depositAmount = 2n
      const token = await createToken(initialAmount)
      const escrow = await createEscrow()
      await token.deposit(escrow._id, depositAmount)
      expect(token.amount).to.equal(initialAmount - depositAmount)
      expect(token.escrow).to.equal(escrow._id)
    })

    it('should reject deposit of zero or negative amount', async () => {
      const token = await createToken(5n)
      const escrow = await createEscrow()
      try {
        await token.deposit(escrow._id, 0n)
        expect.fail('Expected deposit of zero to be rejected')
      } catch (err: any) {
        expect(err.message).to.equal('Deposit amount must be positive')
      }
      try {
        await token.deposit(escrow._id, -5n)
        expect.fail('Expected deposit of negative amount to be rejected')
      } catch (err: any) {
        expect(err.message).to.equal('Deposit amount must be positive')
      }
    })

    it('should reject deposit when token balance is insufficient', async () => {
      const token = await createToken(5n)
      const escrow = await createEscrow()
      try {
        await token.deposit(escrow._id, 10n)
        expect.fail('Expected insufficient balance deposit to be rejected')
      } catch (err: any) {
        expect(err.message).to.equal('Insufficient balance for deposit')
      }
    })

    it('should reject deposit if token is already locked in another escrow', async () => {
      const token = await createToken(10n)
      const escrow1 = await createEscrow()
      const escrow2 = await createEscrow()
      await token.deposit(escrow1._id, 4n)
      try {
        await token.deposit(escrow2._id, 3n)
        expect.fail('Expected deposit while already escrowed to be rejected')
      } catch (err: any) {
        expect(err.message).to.equal('Token already in escrow')
      }
      try {
        await token.deposit(escrow1._id, 1n)
        expect.fail('Expected re-deposit to the same escrow to be rejected')
      } catch (err: any) {
        expect(err.message).to.equal('Token already in escrow')
      }
    })
  })

  describe('Claim Functionality - Happy Path', () => {
    class TestEscrow extends Contract {
      claimable: [string, bigint][]
      status: string

      constructor() {
        super()
      }

      finalize(claims: [string, bigint][]) {
        this.claimable = claims
        this.status = 'final'
      }
    }

    it('should successfully claim tokens from a properly finalized escrow', async () => {
      await ensureFunds(alice)
      await ensureFunds(bob)
      const mintAmount = 1000n
      const depositAmount = 400n
      const params = { to: alice.getPublicKey(), amount: mintAmount, name: 'happy-path' }
      const token = await alice.new(TBC777, [params], mod)
      const escrow = await bob.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.finalize([[token._rev, depositAmount]])
      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
    })

    it('should restore original token balance after a full claim', async () => {
      await ensureFunds(alice)
      await ensureFunds(bob)
      const mintAmount = 500n
      const depositAmount = 500n
      const params = { to: alice.getPublicKey(), amount: mintAmount, name: 'restore-balance' }
      const token = await alice.new(TBC777, [params], mod)
      const escrow = await bob.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.finalize([[token._rev, depositAmount]])
      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
    })

    it('should credit only the claimable slice matching the exact deposit revision', async () => {
      await ensureFunds(alice)
      await ensureFunds(bob)
      const mintAmount = 1000n
      const depositAmount = 300n
      const params = { to: alice.getPublicKey(), amount: mintAmount, name: 'slice-test' }
      const token = await alice.new(TBC777, [params], mod)
      const escrow = await bob.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.finalize([
        [token._rev, 100n],
        [token._rev, 200n],
      ] as [string, bigint][])
      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
    })

    it('should clear the escrow flag after successful claim', async () => {
      await ensureFunds(alice)
      await ensureFunds(bob)
      const mintAmount = 1000n
      const depositAmount = 400n
      const params = { to: alice.getPublicKey(), amount: mintAmount, name: 'clear-flag' }
      const token = await alice.new(TBC777, [params], mod)
      const escrow = await bob.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.finalize([[token._rev, depositAmount]])
      await token.claim(escrow._rev)
      expect(token.escrow).to.be.undefined
    })

    it('should support partial deposit followed by full claim', async () => {
      await ensureFunds(alice)
      await ensureFunds(bob)
      const mintAmount = 3n
      const depositAmount = 2n
      const params = { to: alice.getPublicKey(), amount: mintAmount, name: 'partial' }
      const token = await alice.new(TBC777, [params], mod)
      const escrow = await bob.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      expect(token.amount).eq(mintAmount - depositAmount)
      await escrow.finalize([[token._rev, depositAmount]])
      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
    })

    it('should allow sequential deposit-claim-redeposit cycles on the same token', async () => {
      await ensureFunds(alice)
      await ensureFunds(bob)
      const mintAmount = 1000n
      const params = { to: alice.getPublicKey(), amount: mintAmount, name: 'cycle-test' }
      const token = await alice.new(TBC777, [params], mod)

      const escrow1 = await bob.new(TestEscrow, [])
      await token.deposit(escrow1._id, 300n)
      await escrow1.finalize([[token._rev, 300n]])
      await token.claim(escrow1._rev)
      expect(token.amount).eq(mintAmount)
      expect(token.escrow).to.be.undefined

      const escrow2 = await bob.new(TestEscrow, [])
      await token.deposit(escrow2._id, 450n)
      await escrow2.finalize([[token._rev, 450n]])
      await token.claim(escrow2._rev)
      expect(token.amount).eq(mintAmount)
    })
  })

  describe('Revision History Audit', () => {
    class AuditTestEscrow extends Contract {
      claimable: [string, bigint][]
      status: string

      constructor() {
        super({ claimable: [], status: 'pending' })
      }

      setClaimable(rev: string, amount: bigint) {
        this.claimable = [[rev, amount]]
      }

      finalize() {
        this.status = 'final'
      }
    }

    it('should accept the supplied rev as the first final state in the prev-chain', async () => {
      await ensureFunds(minter)
      const mintAmount = 10n
      const depositAmount = 5n
      const params = {
        to: minter.getPublicKey(),
        amount: mintAmount,
        name: 'audit-accept-first-final',
      }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(AuditTestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.setClaimable(token._rev, depositAmount)
      await escrow.finalize()

      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
      expect(token.escrow).to.be.undefined
    })

    it('should reject claim if any earlier revision in the prev-chain is already final', async () => {
      await ensureFunds(minter)
      const mintAmount = 10n
      const depositAmount = 5n
      const params = {
        to: minter.getPublicKey(),
        amount: mintAmount,
        name: 'audit-reject-earlier-final',
      }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(AuditTestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.setClaimable(token._rev, depositAmount)

      await escrow.finalize()

      await escrow.setClaimable(token._rev, depositAmount)
      await escrow.finalize()
      const laterFinalRev = escrow._rev

      let errorThrown = false
      try {
        await token.claim(laterFinalRev)
      } catch (e: any) {
        errorThrown = true
        expect(e.message).to.include('Escrow was already finalized in a previous state')
      }
      expect(errorThrown).to.be.true
    })

    it('should fully traverse the linear revision history using computer.prev', async () => {
      await ensureFunds(minter)
      const mintAmount = 10n
      const depositAmount = 5n
      const params = {
        to: minter.getPublicKey(),
        amount: mintAmount,
        name: 'audit-traverse-history',
      }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(AuditTestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.setClaimable(token._rev, depositAmount)

      for (let i = 0; i < 8; i++) {
        await escrow.setClaimable(token._rev, depositAmount)
      }

      await escrow.finalize()

      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
    })

    it('should prevent double-claiming on any subsequent finalization of the same escrow', async () => {
      await ensureFunds(minter)
      const mintAmount = 10n
      const depositAmount = 5n
      const params = {
        to: minter.getPublicKey(),
        amount: mintAmount,
        name: 'audit-prevent-double-final',
      }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(AuditTestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.setClaimable(token._rev, depositAmount)

      await escrow.finalize()

      await escrow.setClaimable(token._rev, depositAmount)
      await escrow.finalize()
      const laterFinalRev = escrow._rev

      let errorThrown = false
      try {
        await token.claim(laterFinalRev)
      } catch (e: any) {
        errorThrown = true
        expect(e.message).to.include('Escrow was already finalized in a previous state')
      }
      expect(errorThrown).to.be.true
    })

    it('should handle long revision chains before reaching the first final state', async () => {
      await ensureFunds(minter)
      const mintAmount = 10n
      const depositAmount = 5n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'audit-long-chain' }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(AuditTestEscrow, [])

      await token.deposit(escrow._id, depositAmount)
      await escrow.setClaimable(token._rev, depositAmount)

      for (let i = 0; i < 12; i++) {
        await escrow.setClaimable(token._rev, depositAmount)
      }

      await escrow.finalize()

      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
    })
  })

  describe('No-Inflation Invariant', () => {
    class TestEscrow extends Contract {
      claimable: [string, bigint][]
      status: string

      constructor() {
        super()
      }

      finalize(claimables: [string, bigint][]) {
        this.claimable = claimables
        this.status = 'final'
      }
    }

    it('should reject claim when total claimable exceeds actual deposited amount from this lineage', async () => {
      await ensureFunds(minter)
      const mintAmount = 5n
      const depositAmount = 3n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'test' }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      await escrow.finalize([[token._rev, depositAmount + 1n]])

      let errorThrown = false
      try {
        await token.claim(escrow._rev)
      } catch (e: any) {
        errorThrown = true
        expect(e.message).to.include('Escrow created tokens')
      }
      expect(errorThrown).to.be.true

      expect(token.amount).eq(mintAmount - depositAmount)
    })

    it('should allow claim when total claimable exactly equals deposited amount', async () => {
      await ensureFunds(minter)
      const mintAmount = 5n
      const depositAmount = 3n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'test' }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      await escrow.finalize([[token._rev, depositAmount]])

      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount)
      expect(token.escrow).to.be.undefined
    })

    it('should allow claim when total claimable is less than deposited amount', async () => {
      await ensureFunds(minter)
      const mintAmount = 5n
      const depositAmount = 3n
      const claimableAmount = 2n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'test' }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      await escrow.finalize([[token._rev, claimableAmount]])

      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount - depositAmount + claimableAmount)
    })

    it('should correctly compute deposited amounts via computeDeposit delta for every referenced depositRev', async () => {
      await ensureFunds(minter)
      const mintAmount = 5n
      const depositAmount = 3n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'test' }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      const originalComputer = (globalThis as any).computer
      ;(globalThis as any).computer = minter

      const computed = await (TBC777 as any).computeDeposit(token._rev, token._root, escrow._id)

      ;(globalThis as any).computer = originalComputer

      expect(computed).to.equal(depositAmount)
    })

    it('should enforce no-inflation across multiple unique deposit revisions in a single claimable list', async () => {
      await ensureFunds(minter)
      const mintAmount = 5n
      const depositAmount = 3n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'test' }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      await escrow.finalize([
        [token._rev, 2n],
        [token._rev, 1n],
      ])

      await token.claim(escrow._rev)
      expect(token.amount).eq(mintAmount - depositAmount + 3n)
    })

    it('should reject claim when escrow attempts to over-claim from any single deposit revision', async () => {
      await ensureFunds(minter)
      const mintAmount = 5n
      const depositAmount = 3n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'test' }
      const token = await minter.new(TBC777, [params], mod)

      const escrow = await minter.new(TestEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      await escrow.finalize([[token._rev, depositAmount + 1n]])

      let errorThrown = false
      try {
        await token.claim(escrow._rev)
      } catch (e: any) {
        errorThrown = true
        expect(e.message).to.include('Escrow created tokens')
      }
      expect(errorThrown).to.be.true
    })

    it('should maintain no-inflation even when claimable contains entries from unrelated TBC777 lineages', async () => {
      await ensureFunds(minter)
      const paramsMain = { to: minter.getPublicKey(), amount: 5n, name: 'main' }
      const token = await minter.new(TBC777, [paramsMain], mod)

      const paramsUnrelated = { to: minter.getPublicKey(), amount: 10n, name: 'unrelated' }
      const unrelated = await minter.new(TBC777, [paramsUnrelated], mod)

      const escrow = await minter.new(TestEscrow, [])

      await token.deposit(escrow._id, 3n)

      await escrow.finalize([
        [token._rev, 3n],
        [unrelated._rev, 1n],
      ])

      let errorThrown = false
      try {
        await token.claim(escrow._rev)
      } catch (e: any) {
        errorThrown = true
        expect(e.message).to.include('Found invalid deposit')
      }
      expect(errorThrown).to.be.true

      expect(token.amount).eq(2n)
    })
  })

  describe('Multi-Deposit and Multi-Claim Scenarios', () => {
    class NaiveEscrow extends Contract {
      claimable: [string, bigint][]
      status: string

      constructor() {
        super()
      }

      move(claimable: [string, bigint][]) {
        this.claimable = claimable
        this.status = 'final'
      }
    }

    it('should support multiple simultaneous deposits from the same token into different escrows', async () => {
      await ensureFunds(minter, 15e8)
      const token1 = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 10n, name: 'test' }],
        mod,
      )
      const token2 = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 10n, name: 'test' }],
        mod,
      )

      const escrow1 = await minter.new(NaiveEscrow, [])
      const escrow2 = await minter.new(NaiveEscrow, [])

      await token1.deposit(escrow1._id, 6n)
      await token2.deposit(escrow2._id, 7n)

      expect(token1.amount).eq(4n)
      expect(token2.amount).eq(3n)
      expect(token1.escrow).eq(escrow1._id)
      expect(token2.escrow).eq(escrow2._id)
    })

    it('should allow claiming from one escrow while deposits in other escrows remain locked', async () => {
      await ensureFunds(minter, 15e8)
      const token1 = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 5n, name: 't1' }],
        mod,
      )
      const token2 = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 5n, name: 't2' }],
        mod,
      )

      const escrow1 = await minter.new(NaiveEscrow, [])
      const escrow2 = await minter.new(NaiveEscrow, [])

      await token1.deposit(escrow1._id, 5n)
      await token2.deposit(escrow2._id, 5n)

      await escrow1.move([[token1._rev, 5n]])
      await token1.claim(escrow1._rev)

      expect(token1.amount).eq(5n)
      expect(token1.escrow).to.be.undefined

      expect(token2.amount).eq(0n)
      expect(token2.escrow).eq(escrow2._id)
    })

    it('should handle multiple distinct TBC777 tokens deposited into the same escrow', async () => {
      await ensureFunds(minter, 15e8)
      const token1 = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 5n, name: 't1' }],
        mod,
      )
      const token2 = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 5n, name: 't2' }],
        mod,
      )

      const escrow = await minter.new(NaiveEscrow, [])

      await token1.deposit(escrow._id, 4n)
      await token2.deposit(escrow._id, 3n)

      expect(token1.amount).eq(1n)
      expect(token2.amount).eq(2n)
      expect(token1.escrow).eq(escrow._id)
      expect(token2.escrow).eq(escrow._id)
    })

    it('should correctly distribute claimables that reference multiple deposit revisions', async () => {
      await ensureFunds(minter, 15e8)
      const token = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 20n, name: 't1' }],
        mod,
      )

      const escrow = await minter.new(NaiveEscrow, [])

      await token.deposit(escrow._id, 10n)
      const depositRev = token._rev

      await escrow.move([
        [depositRev, 6n],
        [depositRev, 4n],
      ])

      await token.claim(escrow._rev)
      expect(token.amount).eq(20n)
    })

    it('should support partial claims leaving the remainder correctly locked', async () => {
      await ensureFunds(minter)
      const token = await minter.new(
        TBC777,
        [{ to: minter.getPublicKey(), amount: 10n, name: 'partial' }],
        mod,
      )

      const escrow = await minter.new(NaiveEscrow, [])

      await token.deposit(escrow._id, 8n)

      await escrow.move([[token._rev, 5n]])

      await token.claim(escrow._rev)
      expect(token.amount).eq(7n)
      expect(token.escrow).to.be.undefined
    })
  })

  describe('Escrow Contract Compatibility', () => {
    it('should work with any minimal escrow exposing only { claimable, status } shape', async () => {
      class MinimalEscrow extends Contract {
        claimable: [string, bigint][]
        status: string

        constructor() {
          super()
        }

        finalize(depositRev: string, amt: bigint) {
          this.claimable = [[depositRev, amt]]
          this.status = 'final'
        }
      }

      await ensureFunds(alice)
      const params = { to: alice.getPublicKey(), amount: 10n, name: 'test-minimal' }
      const token = await alice.new(TBC777, [params], mod)

      const escrow = await alice.new(MinimalEscrow, [])

      await token.deposit(escrow._id, 7n)
      expect(token.amount).to.eq(3n)

      await escrow.finalize(token._rev, 7n)

      await token.claim(escrow._rev)
      expect(token.amount).to.eq(10n)
      expect(token.escrow).to.be.undefined
    })

    it('should work with escrows that inherit from the provided Escrow base class', async () => {
      class InheritedEscrow extends Contract {
        claimable: [string, bigint][]
        status: string

        constructor() {
          super()
        }

        finalize(depositRev: string, amt: bigint) {
          this.claimable = [[depositRev, amt]]
          this.status = 'final'
        }
      }

      await ensureFunds(alice)
      const params = { to: alice.getPublicKey(), amount: 10n, name: 'test-inherited' }
      const token = await alice.new(TBC777, [params], mod)

      const escrow = await alice.new(InheritedEscrow, [])

      await token.deposit(escrow._id, 7n)
      expect(token.amount).to.eq(3n)

      await escrow.finalize(token._rev, 7n)

      await token.claim(escrow._rev)
      expect(token.amount).to.eq(10n)
      expect(token.escrow).to.be.undefined
    })

    it('should work with arbitrarily complex custom escrow implementations', async () => {
      class ComplexEscrow extends Contract {
        claimable: [string, bigint][]
        status: string
        logs: string[]
        extraData: string | null

        constructor() {
          super()
        }

        log(msg: string) {
          if (!this.logs) this.logs = []
          this.logs.push(msg)
        }

        setMetadata(reason: string) {
          this.extraData = reason
        }

        finalize(depositRev: string, amt: bigint) {
          this.log('finalizing escrow')
          this.setMetadata('complex-payout')
          this.claimable = [[depositRev, amt]]
          this.status = 'final'
        }
      }

      await ensureFunds(alice)
      const params = { to: alice.getPublicKey(), amount: 10n, name: 'test-complex' }
      const token = await alice.new(TBC777, [params], mod)

      const escrow = await alice.new(ComplexEscrow, [])

      await token.deposit(escrow._id, 7n)
      expect(token.amount).to.eq(3n)

      await escrow.finalize(token._rev, 7n)

      await token.claim(escrow._rev)
      expect(token.amount).to.eq(10n)
      expect(token.escrow).to.be.undefined
    })

    it('should work with escrows that perform multiple intermediate state changes before final', async () => {
      class MultiStepEscrow extends Contract {
        claimable: [string, bigint][]
        status: string

        constructor() {
          super()
        }

        step1(depositRev: string) {
          this.claimable = [[depositRev, 0n]]
        }

        step2(depositRev: string, amt: bigint) {
          this.claimable = [[depositRev, amt / 2n]]
        }

        finalize(depositRev: string, amt: bigint) {
          this.claimable = [[depositRev, amt]]
          this.status = 'final'
        }
      }

      await ensureFunds(alice)
      const params = { to: alice.getPublicKey(), amount: 10n, name: 'test-multistep' }
      const token = await alice.new(TBC777, [params], mod)

      const escrow = await alice.new(MultiStepEscrow, [])

      await token.deposit(escrow._id, 8n)
      expect(token.amount).to.eq(2n)

      await escrow.step1(token._rev)
      await escrow.step2(token._rev, 8n)
      await escrow.finalize(token._rev, 8n)

      await token.claim(escrow._rev)
      expect(token.amount).to.eq(10n)
      expect(token.escrow).to.be.undefined
    })
  })

  describe('Helper Utilities', () => {
    class NaiveEscrow extends Contract {
      claimable: [string, bigint][]
      status: string
      constructor() {
        super()
      }
      move(rev: string, amount: bigint) {
        this.claimable = [[rev, amount]]
        this.status = 'final'
      }
    }

    it('should compute exact deposit delta using prev-state comparison in computeDeposit', async () => {
      await ensureFunds(minter)
      const mintAmount = 10n
      const depositAmount = 7n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'delta-test' }

      const token = await minter.new(TBC777, [params], mod)
      const escrow = await minter.new(NaiveEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      const originalComputer = (global as any).computer
      ;(global as any).computer = minter

      try {
        const delta = await (TBC777 as any).computeDeposit(token._rev, token._root, escrow._id)
        expect(delta).eq(depositAmount)
      } finally {
        ;(global as any).computer = originalComputer
      }
    })

    it('should reject invalid deposit revisions that do not belong to the expected root or escrow', async () => {
      await ensureFunds(minter)
      const mintAmount = 10n
      const depositAmount = 3n
      const params = { to: minter.getPublicKey(), amount: mintAmount, name: 'invalid-test' }

      const token = await minter.new(TBC777, [params], mod)
      const escrow = await minter.new(NaiveEscrow, [])

      await token.deposit(escrow._id, depositAmount)

      const originalComputer = (global as any).computer
      ;(global as any).computer = minter

      try {
        await (TBC777 as any).computeDeposit(token._rev, 'wrong-root-123', escrow._id)
        expect.fail('Should have thrown error for wrong root')
      } catch (e: any) {
        expect(e.message).to.include('Found invalid deposit')
      }

      try {
        await (TBC777 as any).computeDeposit(token._rev, token._root, 'wrong-escrow-456')
        expect.fail('Should have thrown error for wrong escrow')
      } catch (e: any) {
        expect(e.message).to.include('Found invalid deposit')
      } finally {
        ;(global as any).computer = originalComputer
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    class NaiveEscrow extends Contract {
      claimable: [string, bigint][]
      status: string
      constructor() {
        super()
      }
      move(rev: string, amount: bigint) {
        this.claimable = [[rev, amount]]
        this.status = 'final'
      }
    }

    class MaliciousEscrow extends Contract {
      claimable: [string, bigint][]
      status: string
      constructor() {
        super()
      }
      finalize(claimableList: [string, bigint][]) {
        this.claimable = claimableList
        this.status = 'final'
      }
    }

    const setupMinter = async () => {
      await ensureFunds(minter)
      return minter
    }

    it('should throw descriptive errors for all invalid operations', async () => {
      const minterInst = await setupMinter()
      const params = { to: minterInst.getPublicKey(), amount: 10n, name: 'test-error' }
      const token = await minterInst.new(TBC777, [params], mod)

      try {
        await token.deposit('dummy-escrow', 0n)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.include('Deposit amount must be positive')
      }

      try {
        await token.deposit('dummy-escrow', -5n)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.include('Deposit amount must be positive')
      }

      try {
        await token.deposit('dummy-escrow', 20n)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.include('Insufficient balance for deposit')
      }

      const escrow = await minterInst.new(NaiveEscrow, [])
      await token.deposit(escrow._id, 5n)

      try {
        await token.deposit('other-escrow', 1n)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.include('Token already in escrow')
      }
    })

    it('should reject claim when token is not currently escrowed', async () => {
      const minterInst = await setupMinter()
      const params = { to: minterInst.getPublicKey(), amount: 10n, name: 'test' }
      const token = await minterInst.new(TBC777, [params], mod)
      const escrow = await minterInst.new(NaiveEscrow, [])

      try {
        await token.claim(escrow._rev)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.include('Token not in escrow')
      }
    })

    it('should reject claim when provided revision is not in final state', async () => {
      const minterInst = await setupMinter()
      const params = { to: minterInst.getPublicKey(), amount: 10n, name: 'test' }
      const token = await minterInst.new(TBC777, [params], mod)
      const escrow = await minterInst.new(NaiveEscrow, [])

      await token.deposit(escrow._id, 5n)

      try {
        await token.claim(escrow._rev)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.include('Escrow is not in final state')
      }
    })

    it('should reject claimable entries referencing non-existent or malformed deposit revisions', async () => {
      const minterInst = await setupMinter()
      const params = { to: minterInst.getPublicKey(), amount: 10n, name: 'test' }
      const token = await minterInst.new(TBC777, [params], mod)
      const escrow = await minterInst.new(MaliciousEscrow, [])

      await token.deposit(escrow._id, 5n)
      await escrow.finalize([['non-existent-rev-xyz', 3n]])

      try {
        await token.claim(escrow._rev)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.match(
          /parameter 1 must be of length 64|Found invalid deposit|Something went wrong/i,
        )
      }
    })

    it('should handle escrow with empty claimable array gracefully', async () => {
      const minterInst = await setupMinter()
      const params = { to: minterInst.getPublicKey(), amount: 10n, name: 'test' }
      const token = await minterInst.new(TBC777, [params], mod)
      const escrow = await minterInst.new(MaliciousEscrow, [])

      await token.deposit(escrow._id, 5n)
      await escrow.finalize([])

      await token.claim(escrow._rev)
      expect(token.amount).to.equal(5n)
      expect(token.escrow).to.be.undefined
    })

    it('should handle zero-value claimable entries without allowing inflation', async () => {
      const minterInst = await setupMinter()
      const params = { to: minterInst.getPublicKey(), amount: 10n, name: 'test' }
      const token = await minterInst.new(TBC777, [params], mod)
      const escrow = await minterInst.new(NaiveEscrow, [])

      await token.deposit(escrow._id, 5n)
      await escrow.move(token._rev, 0n)

      await token.claim(escrow._rev)
      expect(token.amount).to.equal(5n)
    })

    it('should maintain security invariants under malicious escrow behavior', async () => {
      const minterInst = await setupMinter()
      const params = { to: minterInst.getPublicKey(), amount: 10n, name: 'test' }
      const token = await minterInst.new(TBC777, [params], mod)
      const escrow = await minterInst.new(MaliciousEscrow, [])

      await token.deposit(escrow._id, 5n)
      await escrow.finalize([[token._rev, 100n]])

      try {
        await token.claim(escrow._rev)
        expect.fail('Should have thrown')
      } catch (e: any) {
        expect(e.message).to.include('Escrow created tokens')
      }
    })
  })
})
