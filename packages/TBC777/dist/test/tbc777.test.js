import { expect } from 'chai';
import { Computer, Contract } from '@bitcoin-computer/lib';
import dotenv from 'dotenv';
import path from 'path';
import { TBC20 } from '../src/tbc20.js';
import { TBC777, EscrowAuditor } from '../src/tbc777.js';
const envPaths = [path.resolve(process.cwd(), './packages/node/.env'), '../node/.env'];
const INITIAL_AMOUNT = 30n;
const TEST_NAME = 'test';
const TEST_SYMBOL = 'TST';
const FRESH_TOKEN_AMOUNT = 10n;
const DEPOSIT_AMOUNT = 6n;
/**
 * Strips all comments (JSDoc, block, and line) from a class source string and
 * collapses empty lines. Keeps the code valid and much smaller.
 */
function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* ... */ (including JSDoc)
        .replace(/\/\/.*$/gm, '') // remove // comments
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');
}
for (const envPath of envPaths) {
    dotenv.config({ path: envPath });
}
const url = process.env.BCN_URL;
const chain = process.env.BCN_CHAIN;
const network = process.env.BCN_NETWORK;
let black;
let white;
let minter;
let mod;
async function ensureFunds(c, minSats = 20e8) {
    try {
        const { balance } = await c.getBalance();
        if (balance < minSats)
            await c.faucet(minSats);
    }
    catch {
        await c.faucet(minSats);
    }
}
describe('TBC777 - Programmable Escrow Token (No-Inflation Focus)', () => {
    before(async () => {
        minter = new Computer({ url, chain, network });
        black = new Computer({ url, chain, network });
        white = new Computer({ url, chain, network });
        await Promise.all([black.faucet(2e8), white.faucet(2e8), minter.faucet(2e8)]);
        await ensureFunds(minter, 2e8);
        // Strip comments from all three classes before deploying
        const tbc20Source = stripComments(TBC20.toString());
        const escrowSource = stripComments(EscrowAuditor.toString());
        const tbc777Source = stripComments(TBC777.toString());
        mod = await minter.deploy(`
      export ${tbc20Source}
      export ${escrowSource}
      export ${tbc777Source}
    `);
        await ensureFunds(minter, 20e8);
        const amount = INITIAL_AMOUNT;
        const name = TEST_NAME;
        const symbol = TEST_SYMBOL;
        const to = minter.getPublicKey();
        const exp = `new TBC777({ to: '${to}', amount: ${amount}n, name: '${name}', symbol: '${symbol}' })`;
        const { tx } = await minter.encode({ exp, mod });
        await minter.broadcast(tx);
    });
    beforeEach(async () => {
        await Promise.all([black.faucet(2e8), white.faucet(2e8), minter.faucet(2e8)]);
        await ensureFunds(minter, 2e8);
    });
    // ============================================================
    // TEST HELPERS (Defined at top level so they are available everywhere)
    // ============================================================
    /**
     * Creates a minimal NaiveEscrow implementation for testing.
     */
    async function createNaiveEscrow(c = minter) {
        class NaiveEscrow extends Contract {
            constructor() {
                super({ deposits: [], withdraws: [], finalWithdraws: [] });
            }
            async acceptDeposit(token, amount, nextOwner) {
                token.deposit(this._id, amount);
                this.deposits.push(token.depositTuple);
                if (nextOwner)
                    this._owners = [nextOwner];
            }
            setWithdraw(id, amount, root) {
                this.withdraws = [[root, id, amount]];
            }
            setFinalWithdraw(id, amount, root) {
                this.finalWithdraws = [[root, id, amount]];
            }
        }
        return c.new(NaiveEscrow, []);
    }
    /** Atomic deposit (recommended pattern) */
    async function depositAtomic(token, escrow, amount, depositor = minter, nextOwner) {
        const { tx, effect } = await depositor.encode({
            exp: `escrow.acceptDeposit(token, ${amount}n${nextOwner ? `, '${nextOwner}'` : ''})`,
            env: { escrow: escrow._rev, token: token._rev },
        });
        await depositor.broadcast(tx);
        // Return both updated objects so callers can re-bind if needed
        return {
            escrow: effect.env.escrow,
            token: effect.env.token, // ← this is the key line
        };
    }
    async function withdraw(token, escrowRev, isFinal = false) {
        await token.withdraw(escrowRev, isFinal);
    }
    /**
     * Primary no-inflation assertion helper. Uses only the safe getBalance path
     * (EscrowAuditor.audit is only available inside smart contracts).
     */
    async function assertNoInflation(escrowRev, token) {
        const balance = await token.getBalance(escrowRev);
        expect(balance >= 0n).eq(true);
    }
    /** Create a fresh token instance (via transfer for efficiency) */
    /** Create a fresh token instance (mint fresh each time to avoid depleting
     * shared root) */
    async function createFreshToken(amount = FRESH_TOKEN_AMOUNT, owner = minter.getPublicKey()) {
        const exp = `new TBC777({ to: '${owner}', amount: ${amount}n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}' })`;
        const { effect, tx } = await minter.encode({ exp, mod });
        const fresh = branded(effect.res);
        await minter.broadcast(tx);
        return fresh;
    }
    // ============================================================
    // PRIMARY GOAL: NO-INFLATION INVARIANT
    // ============================================================
    describe('No-Inflation Invariant (Core Security Guarantee)', () => {
        it('maintains non-negative balance after single deposit + full withdraw', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken(FRESH_TOKEN_AMOUNT);
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT);
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken; // re-bind so the test sees the post-deposit state (amount === 5n)
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT - DEPOSIT_AMOUNT);
            await escrow1.setWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            await withdraw(t, escrow1._rev);
            await assertNoInflation(escrow1._rev, t);
            expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT);
        });
        it('rejects over-claim (withdraws > deposited) with "Escrow balance too low"', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            // Malicious escrow over-claims far more than was deposited
            const MALICIOUS_AMOUNT = 100n;
            await escrow1.setWithdraw(t._id, MALICIOUS_AMOUNT, t.root);
            try {
                await withdraw(t, escrow1._rev);
                expect.fail('should have thrown on over-claim');
            }
            catch (e) {
                const msg = `Escrow available balance (${DEPOSIT_AMOUNT - MALICIOUS_AMOUNT}) too low`;
                expect(e.message).eq(msg);
            }
        });
        it('rejects cumulative inflation across multiple revisions in escrow history', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            // First revision records a small claim
            await escrow1.setWithdraw(t._id, 1n, t.root);
            // Second revision overwrites with a huge claim. The auditor walks the
            // full prev-chain and sums *all* historical withdraw entries (1n + 100n >
            // 5n deposited) → availableBalance < 0 → reject.
            await escrow1.setWithdraw(t._id, 100n, t.root);
            try {
                await withdraw(t, escrow1._rev);
                expect.fail('should have thrown on cumulative inflation');
            }
            catch (e) {
                expect(e.message).to.include('Escrow available balance');
            }
        });
        it('withdrawn[] array prevents replay (even after transfer)', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            await escrow1.setWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            await withdraw(t, escrow1._rev);
            await assertNoInflation(escrow1._rev, t);
            expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT);
            // replay on same token instance
            try {
                await withdraw(t, escrow1._rev);
                expect.fail('should have thrown on replay');
            }
            catch (e) {
                expect(e.message).to.include('Cannot withdraw multiple times');
            }
            // even after full transfer (withdrawn list travels with the token)
            await t.transfer(white.getPublicKey());
            const whiteToken = await white.sync(t._rev);
            try {
                await withdraw(whiteToken, escrow1._rev);
                expect.fail('should have thrown on replay after transfer');
            }
            catch (e) {
                expect(e.message).to.include('Cannot withdraw multiple times');
            }
        });
        it('finalWithdrawn[] prevents replay of final claims', async () => {
            // TODO
        });
        it('finalWithdraw only succeeds on the last revision of the escrow', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            await escrow1.setFinalWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            const firstRev = escrow1._rev;
            await escrow1.setFinalWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            const lastRev = escrow1._rev;
            try {
                await t.finalWithdraw(firstRev);
                expect.fail('should have thrown on non-last rev');
            }
            catch (e) {
                expect(e.message).to.include('Claimable final withdraw amount is zero or negative');
            }
            await minter.delete([lastRev]);
            await t.finalWithdraw(lastRev);
            expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT);
        });
        it('filters claims to only compatible tokens via isEqualTo', async () => {
            // TODO: mint incompatible token + claim both → only compatible token is
            // credited
        });
        it('cross-escrow claim is rejected (escrow + successor revision check)', async () => {
            // TODO
        });
        it('malicious escrow pushing fake/duplicate/invalid revs is rejected by audit', async () => {
            // TODO
        });
        it('remoteRoot tokens respect isValidMint and cannot inflate value', async () => {
            // Create a completely fresh token directly
            const amount = 10n;
            const exp = `new TBC777({ to: '${minter.getPublicKey()}', amount: ${amount}n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}' })`;
            const { effect, tx } = await minter.encode({ exp, mod });
            const freshToken = branded(effect.res);
            await minter.broadcast(tx);
            const escrow = await createNaiveEscrow();
            let t = await minter.sync(freshToken._rev);
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, 5n);
            t = updatedToken;
            await escrow1.setWithdraw(t._id, 5n, t.root);
            // Good case
            const goodExp = `new TBC777({ to: '${minter.getPublicKey()}', amount: 0n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}', remoteRoot: '${t.root}', withdrawn: ['${escrow1._rev}'] })`;
            const { effect: effectGood, tx: txGood } = await minter.encode({ exp: goodExp, mod });
            const goodRemote = effectGood.res;
            await minter.broadcast(txGood);
            const { effect: isValidGood } = await minter.encode({
                exp: `TBC777.isValidMint(goodRemote)`,
                env: { goodRemote: goodRemote._rev },
                mod,
            });
            expect(isValidGood.res).to.be.true;
            // Bad case 1: constructor rejects amount > 0n
            expect(() => new TBC777({
                to: minter.getPublicKey(),
                amount: 5n,
                name: TEST_NAME,
                symbol: TEST_SYMBOL,
                remoteRoot: 'abc:0',
                withdrawn: ['def:0'],
            })).to.throw('Remote-root tokens must be created with amount 0n');
            // Bad case 2
            const badExp = `new TBC777({ to: '${minter.getPublicKey()}', amount: 0n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}', remoteRoot: '${t.root}' })`;
            const { effect: effectBad, tx: txBad } = await minter.encode({ exp: badExp, mod });
            const badRemote = effectBad.res;
            await minter.broadcast(txBad);
            const { effect: isValidBad } = await minter.encode({
                exp: `TBC777.isValidMint(badRemote)`,
                env: { badRemote: badRemote._rev },
                mod,
            });
            expect(isValidBad.res).to.be.false;
        });
    });
    // ============================================================
    // LIFECYCLE MANAGEMENT
    // ============================================================
    describe('Lifecycle: deposit / withdraw / finalWithdraw', () => {
        it('atomic deposit correctly sets escrow and reduces token balance', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken(FRESH_TOKEN_AMOUNT);
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT);
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            // Token side: amount reduced, escrow reference set
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT - DEPOSIT_AMOUNT);
            expect(t.escrow).to.eq(escrow1._id);
            // Escrow side: deposit recorded with correct lineage + pre-mutation revision
            expect(escrow1.deposits).to.have.lengthOf(1);
            const [recordedRoot, recordedRev] = escrow1.deposits[0];
            expect(recordedRoot).eq(t.root);
            expect(recordedRev).to.be.a('string');
        });
        it('withdraw clears escrow after successful claim', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            expect(t.escrow).to.eq(escrow1._id);
            await escrow1.setWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            await withdraw(t, escrow1._rev);
            expect(t.escrow).to.be.undefined;
            await assertNoInflation(escrow1._rev, t);
            expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT);
        });
        it('getBalance remains consistent with manual audit at every step', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            // Step 1: Initial state – no deposits
            let balance = await t.getBalance(escrow._rev);
            expect(balance).eq(0n);
            // Step 2: Deposit
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            balance = await t.getBalance(escrow1._rev);
            expect(balance).eq(DEPOSIT_AMOUNT);
            // Step 3: Record a regular withdrawal authorization
            await escrow1.setWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            balance = await t.getBalance(escrow1._rev);
            expect(balance).eq(0n);
            // Step 4: Perform the withdrawal
            await withdraw(t, escrow1._rev);
            balance = await t.getBalance(escrow1._rev);
            expect(balance).eq(0n);
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT);
            // Step 5: Delete the last revision (escrow becomes stale) – balance must stay 0
            await minter.delete([escrow1._rev]);
            balance = await t.getBalance(escrow1._rev);
            expect(balance).eq(0n);
        });
    });
    // ============================================================
    // LINEAGE & COMPATIBILITY
    // ============================================================
    describe('Lineage Compatibility (isEqualTo / isSameLineageSync / semantic)', () => {
        it('fast path returns true for same-lineage tokens (no remoteRoot)', async () => {
            const t1 = await createFreshToken();
            expect(t1.remoteRoot).to.be.undefined;
            // Explicit cast is required because of how the SmartContract<T> lifting
            // works with inherited methods from TBC20 (transfer returns `this`)
            const t2 = await t1.transfer(black.getPublicKey(), 3n);
            // Fast path (synchronous)
            expect(await t1.sameLineage(t2)).to.be.true;
            expect(await t2.sameLineage(t1)).to.be.true;
            // Full isEqualTo (should use fast path internally)
            expect(await t1.isEqualTo(t2)).to.be.true;
            expect(await t2.isEqualTo(t1)).to.be.true;
            expect(t1._root).to.equal(t2._root);
            expect(t1._rev).to.not.equal(t2._rev);
        });
        it('semantic comparison accepts valid remoteRoot tokens', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            // Deposit the normal token into escrow (establishes the lineage)
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            // Record a valid claim so the remoteRoot token can be created
            await escrow1.setWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            // Create a remoteRoot token that claims the exact same lineage
            const goodExp = `new TBC777({ to: '${minter.getPublicKey()}', amount: 0n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}', remoteRoot: '${t.root}', withdrawn: ['${escrow1._rev}'] })`;
            const { effect: effectGood, tx: txGood } = await minter.encode({ exp: goodExp, mod });
            const goodRemote = branded(effectGood.res);
            await minter.broadcast(txGood);
            // Both directions must succeed (isEqualTo is symmetric)
            expect(await t.isEqualTo(goodRemote)).to.be.true;
            expect(await goodRemote.isEqualTo(t)).to.be.true;
            // Fast-path sameLineage is false because one has remoteRoot
            expect(await t.sameLineage(goodRemote)).to.be.false;
        });
        it('rejects inline-class / shadowing attacks via makeRegex', async () => {
            const validTo = '02abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
            // Malicious expressions that try to define an inline class / override methods / shadow
            const maliciousExpressions = [
                // Inline class definition (classic shadowing attack)
                `new (class extends TBC777 { malicious() { return 999n } })({to:'${validTo}',amount:30n,name:'test',symbol:'TST'})`,
                // Function definition inside the expression
                `new (function(){return class extends TBC777{}})()({to:'${validTo}',amount:30n,name:'test',symbol:'TST'})`,
                // Constructor with inline class expression
                `new TBC777({to:'${validTo}',amount:30n,name:'test',symbol:'TST',malicious: new (class { evil(){} })()})`,
                // Shadowing with a function expression
                `new TBC777({to:'${validTo}',amount:30n,name:'test',symbol:'TST',constructor: function(){return 999n}})`,
            ];
            for (const malicious of maliciousExpressions) {
                expect(() => TBC777.makeRegex(malicious)).to.throw('Constructor expression contains forbidden keywords');
            }
        });
    });
    // ============================================================
    // REMOTE ROOT / TRANSFERRABLE VALUE
    // ============================================================
    describe('remoteRoot & Cross-Lineage Flows', () => {
        it('isValidMint returns true only when claimed amount ≤ total offered', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken(10n); // source token with 10n
            // Deposit exactly 5n into escrow (total offered = 5n)
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, 5n);
            t = updatedToken; // post-deposit token (amount now 5n)
            // Record a matching claim in the escrow
            await escrow1.setWithdraw(t._id, 5n, t.root);
            // GOOD CASE: remoteRoot token claims exactly the offered/deposited amount
            // (must be created in same tx as the source token's withdraw)
            const goodExp = `new TBC777({ to: '${minter.getPublicKey()}', amount: 0n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}', remoteRoot: '${t.root}', withdrawn: ['${escrow1._rev}'] })`;
            const { effect: goodEffect, tx: goodTx } = await minter.encode({ exp: goodExp, mod });
            const goodRemote = branded(goodEffect.res);
            await minter.broadcast(goodTx);
            // isValidMint succeeds because:
            // 1. remoteRoot token was created with amount: 0n at _id
            // 2. it records a valid withdrawal claim
            const { effect: goodValid } = await minter.encode({
                exp: `TBC777.isValidMint(goodRemote)`,
                env: { goodRemote: goodRemote._rev },
                mod,
            });
            expect(goodValid.res).to.be.true;
            // BAD CASE: remoteRoot token with no matching withdrawal record
            // (claimed amount effectively 0, but no claim recorded → invalid mint)
            const badExpNoClaim = `new TBC777({ to: '${minter.getPublicKey()}', amount: 0n, name: '${TEST_NAME}', symbol: '${TEST_SYMBOL}', remoteRoot: '${t.root}' })`;
            const { effect: badEffectNoClaim, tx: badTxNoClaim } = await minter.encode({
                exp: badExpNoClaim,
                mod,
            });
            const badRemoteNoClaim = branded(badEffectNoClaim.res);
            await minter.broadcast(badTxNoClaim);
            const { effect: badValidNoClaim } = await minter.encode({
                exp: `TBC777.isValidMint(badRemoteNoClaim)`,
                env: { badRemoteNoClaim: badRemoteNoClaim._rev },
                mod,
            });
            expect(badValidNoClaim.res).to.be.false;
            // Note: Over-claim (claimed > total offered) is prevented earlier by
            // EscrowAuditor.audit / _withdraw (availableBalance check) and cannot reach
            // a successfully broadcast remoteRoot token. isValidMint is the final gate
            // ensuring remote tokens were properly "claimed" from escrow during mint.
        });
        it('remote token can be deposited into a new escrow and claimed successfully', async () => {
            // TODO
        });
    });
    // ============================================================
    // ERROR HANDLING & EDGE CASES
    // ============================================================
    describe('Error Handling & Edge Cases', () => {
        it('rejects deposit ≤ 0n', async () => {
            const escrow = await createNaiveEscrow();
            const t = await createFreshToken();
            try {
                await t.deposit(escrow._id, 0n);
                expect.fail('should have thrown on deposit <= 0n');
            }
            catch (e) {
                expect(e.message).to.equal('Deposit amount must be positive');
            }
            try {
                await t.deposit(escrow._id, -1n);
                expect.fail('should have thrown on deposit <= 0n');
            }
            catch (e) {
                expect(e.message).to.equal('Deposit amount must be positive');
            }
        });
        it('rejects claim of zero amount', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            // Explicit zero claim (escrow can be malicious or buggy)
            await escrow1.setWithdraw(t._id, 0n, t.root);
            try {
                await withdraw(t, escrow1._rev);
                expect.fail('should have thrown on zero claimable amount');
            }
            catch (e) {
                expect(e.message).to.include('Claimable withdraw amount is zero or negative');
            }
        });
        it('merge() is permanently disabled with clear error message', async () => {
            const token = await createFreshToken();
            try {
                await token.merge();
                expect.fail('merge() should have thrown');
            }
            catch (e) {
                expect(e.message).to.equal('merge() is disabled in TBC777.');
            }
        });
        it('transfer of token with active escrow produces fresh recipient state', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken();
            // 1. Deposit – sender token now has active escrow state
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            expect(t.escrow).to.equal(escrow1._id);
            expect(t.amount).to.equal(FRESH_TOKEN_AMOUNT - DEPOSIT_AMOUNT);
            // 2. Transfer full remaining balance (explicit amount avoids internal timing issue)
            const remainingAmount = t.amount;
            const transferResult = await t.transfer(white.getPublicKey(), remainingAmount);
            // 3. Recipient syncs the newly created token
            const whiteToken = await white.sync(transferResult._rev);
            // === KEY INVARIANT: recipient gets a fresh / sanitized state ===
            expect(whiteToken.escrow).to.be.undefined;
            expect(whiteToken.withdrawn).to.deep.equal([]);
            expect(whiteToken.finalWithdrawn).to.deep.equal([]);
            // Amount should have been transferred correctly
            expect(whiteToken.amount).to.equal(remainingAmount);
            // Sender side checks
            expect(t.amount).to.equal(0n);
            expect(t.escrow).to.equal(escrow1._id);
        });
        it('rejects tokens created by defining a malicious class inside the expression (inline class definition / shadowing attack)', async () => {
            // Malicious expression attempting to define an inline subclass that bypasses
            // no-inflation (classic constructor shadowing / inline class attack).
            const maliciousExp = `
    new (class MaliciousTBC777 extends TBC777 {
      deposit(escrow: any, amount: bigint) {
        // Attempt to inflate balance, breaking the core security invariant
        this.amount = this.amount + amount * 1000n
        super.deposit(escrow, amount)
      }
    })({
      to: '${minter.getPublicKey()}',
      amount: 100n,
      name: '${TEST_NAME}',
      symbol: '${TEST_SYMBOL}'
    })
  `.trim();
            // 1. Direct defense: makeRegex immediately rejects forbidden keywords
            expect(() => TBC777.makeRegex(maliciousExp)).to.throw('Constructor expression contains forbidden keywords');
            // 2. End-to-end protection: the public API must also reject it
            try {
                const { tx } = await minter.encode({ exp: maliciousExp, mod });
                await minter.broadcast(tx);
                expect.fail('Should have thrown when attempting to create malicious inline-class token');
            }
            catch (e) {
                // The error can surface at regex validation time (makeRegex) or during
                // semantic validation / isValidMint. Either way, creation must be blocked.
                expect(e.message).to.satisfy((msg) => msg.includes('forbidden keywords') ||
                    msg.includes('Invalid expression') ||
                    msg.includes('isValidMint') ||
                    msg.includes('constructor'));
            }
        });
    });
    // ============================================================
    // ESCROW AUDITOR INTERNALS
    // ============================================================
    describe('EscrowAuditor Correctness', () => {
        it('walkPrevChain traverses the complete revision history', async () => {
            const escrow = await createNaiveEscrow();
            const t1 = await createFreshToken(10n);
            const t2 = await createFreshToken(5n);
            // First deposit → revision 1
            const { escrow: escrowAfter1 } = await depositAtomic(t1, escrow, 3n);
            // Second deposit → revision 2 (latest)
            const { escrow: escrowAfter2 } = await depositAtomic(t2, escrowAfter1, 2n);
            // Manually walk the full prev-chain using the real Computer instance (minter)
            // This mirrors exactly what EscrowAuditor.walkHistory does internally
            const states = [];
            let current = escrowAfter2._rev;
            while (current) {
                const state = await minter.sync(current);
                states.push(state);
                current = (await minter.prev(current));
            }
            // Should contain exactly one state per revision (latest → genesis)
            expect(states.length).to.equal(3);
            // deposits array should grow with each deposit
            expect(states[0].deposits.length).to.equal(2); // latest revision
            expect(states[1].deposits.length).to.equal(1);
            expect(states[2].deposits.length).to.equal(0); // initial empty escrow
            // Verify correct ordering and prev links
            for (let i = 0; i < states.length - 1; i++) {
                const currentRev = states[i]._rev;
                const prevRev = await minter.prev(currentRev);
                expect(prevRev).to.equal(states[i + 1]._rev);
            }
            // Genesis revision has no predecessor
            expect(await minter.prev(states[2]._rev)).to.be.undefined;
        });
        it('computeDeposit correctly calculates delta using successor revision', async () => {
            // TODO
        });
        it('sumCompatibleClaimAmounts uses only isEqualTo (not isValidMint) for claims', async () => {
            // TODO
        });
        it('very long escrow revision histories are handled correctly by the auditor', async () => {
            // TODO: stress test full prev-chain walk with many revisions
        });
    });
    // ============================================================
    // KEY SCENARIOS
    // ============================================================
    describe('Key Scenarios (Ready for Implementation)', () => {
        it('Single deposit → full withdrawal', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken(FRESH_TOKEN_AMOUNT);
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT);
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken; // re-bind so the test sees the post-deposit state (amount === FRESH_TOKEN_AMOUNT - DEPOSIT_AMOUNT)
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT - DEPOSIT_AMOUNT);
            await escrow1.setWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            await withdraw(t, escrow1._rev);
            await assertNoInflation(escrow1._rev, t);
            expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT);
        });
        it('Multiple deposits from different owners → partial claims', async () => {
            // TODO
        });
        it('Deposit → transfer token → claim from new owner', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken(FRESH_TOKEN_AMOUNT);
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT);
            // 1. Deposit (amount reduced to 4n, deposit recorded in escrow)
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            expect(t.amount).eq(FRESH_TOKEN_AMOUNT - DEPOSIT_AMOUNT);
            // 2. Authorize claim for the exact post-deposit token _id
            await escrow1.setWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            // 3. Transfer the *remaining* balance to new owner
            //    _createTransferToken sanitizes escrow state (withdrawn/finalWithdrawn/escrow)
            const transferred = await t.transfer(white.getPublicKey());
            const whiteToken = await white.sync(transferred._rev);
            // 4. Original owner claims the deposited amount (even after transferring remainder)
            await withdraw(t, escrow1._rev);
            await assertNoInflation(escrow1._rev, t);
            // After transfer the original token had 0n; withdraw adds back only the deposited 6n
            expect(t.amount).to.eq(DEPOSIT_AMOUNT);
            // 5. New owner receives clean token with the remaining balance (4n)
            //    No inherited escrow/claim state, different _id → cannot claim deposit
            expect(whiteToken.amount).eq(FRESH_TOKEN_AMOUNT - DEPOSIT_AMOUNT);
            expect(whiteToken.withdrawn).to.have.lengthOf(0);
            expect(whiteToken.finalWithdrawn).to.have.lengthOf(0);
            expect(whiteToken.escrow).to.be.undefined;
            try {
                await withdraw(whiteToken, escrow1._rev);
                expect.fail('new owner should not be able to claim deposit (different _id)');
            }
            catch (e) {
                expect(e.message).to.include('Claimable');
            }
        });
        it('Final withdraw on last revision vs non-last revision', async () => {
            const escrow = await createNaiveEscrow();
            let t = await createFreshToken(FRESH_TOKEN_AMOUNT);
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(t, escrow, DEPOSIT_AMOUNT);
            t = updatedToken;
            await escrow1.setFinalWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            const firstRev = escrow1._rev;
            await escrow1.setFinalWithdraw(t._id, DEPOSIT_AMOUNT, t.root);
            const lastRev = escrow1._rev;
            try {
                await t.finalWithdraw(firstRev);
                expect.fail('should have thrown on non-last rev');
            }
            catch (e) {
                expect(e.message).to.include('Claimable final withdraw amount is zero or negative');
            }
            await minter.delete([lastRev]);
            await t.finalWithdraw(lastRev);
            expect(t.amount).to.eq(FRESH_TOKEN_AMOUNT);
        });
        it('Attempted inflation via incompatible token', async () => {
            const escrow = await createNaiveEscrow();
            let tA = await createFreshToken(FRESH_TOKEN_AMOUNT);
            const rootA = tA.root;
            const { escrow: escrow1, token: updatedToken } = await depositAtomic(tA, escrow, DEPOSIT_AMOUNT);
            tA = updatedToken;
            // Record a legitimate claim for tA's lineage
            await escrow1.setWithdraw(tA._id, DEPOSIT_AMOUNT, rootA);
            // Create an incompatible token (different root / lineage)
            const tB = await createFreshToken(FRESH_TOKEN_AMOUNT);
            expect(tB.root).to.not.equal(rootA);
            expect(await tA.isEqualTo(tB)).to.be.false;
            // Attempted inflation: tB tries to claim the amount recorded for tA
            try {
                await withdraw(tB, escrow1._rev);
                expect.fail('incompatible token must not be able to claim');
            }
            catch (e) {
                expect(e.message).to.include('Claimable withdraw amount is zero or negative');
            }
            // Legitimate token can still claim normally (no inflation occurred)
            await withdraw(tA, escrow1._rev);
            expect(tA.amount).to.eq(FRESH_TOKEN_AMOUNT);
            await assertNoInflation(escrow1._rev, tA);
        });
        it.skip('Cross-lineage (remoteRoot) complete flow with isValidMint validation', async () => {
            // === Setup: Create source token and deposit into escrow ===
            const escrow = await createNaiveEscrow();
            let source = await createFreshToken(FRESH_TOKEN_AMOUNT);
            const { escrow: escrowAfterDeposit, token: deposited } = await depositAtomic(source, escrow, DEPOSIT_AMOUNT);
            source = deposited;
            // Authorize the claim on the escrow
            await escrowAfterDeposit.setWithdraw(source._id, DEPOSIT_AMOUNT, source.root);
            // === Create remoteRoot token (the key operation) ===
            const remoteExp = `new TBC777({ 
    to: '${minter.getPublicKey()}', 
    amount: 0n, 
    name: '${TEST_NAME}', 
    symbol: '${TEST_SYMBOL}', 
    remoteRoot: '${source.root}', 
    withdrawn: ['${escrowAfterDeposit._rev}'] 
  })`;
            const { effect: remoteEffect, tx: remoteTx } = await minter.encode({
                exp: remoteExp,
                mod,
            });
            const goodRemote = branded(remoteEffect.res);
            await minter.broadcast(remoteTx);
            // === Core assertions ===
            // 1. isValidMint must succeed (amount 0n + valid withdrawn record)
            const { effect: isValidEffect } = await minter.encode({
                exp: `TBC777.isValidMint(goodRemote)`,
                env: { goodRemote: goodRemote._rev },
                mod,
            });
            expect(isValidEffect.res).to.be.true;
            // 2. Remote token starts at 0 and carries correct remoteRoot
            expect(goodRemote.amount).to.equal(0n);
            expect(goodRemote.remoteRoot).to.equal(source.root);
            expect(goodRemote._root).to.not.equal(source._root);
            // 3. Cross-lineage compatibility
            expect(await source.isEqualTo(goodRemote)).to.be.true;
            expect(await goodRemote.isEqualTo(source)).to.be.true;
            expect(await source.sameLineage(goodRemote)).to.be.false;
            // 4. Replay protection: cannot withdraw the same claim twice
            try {
                await goodRemote.withdraw(escrowAfterDeposit._rev);
                expect.fail('Expected replay protection to throw');
            }
            catch (e) {
                expect(e.message).to.include('Cannot withdraw multiple times');
            }
            // 5. Bad remote (missing withdrawn record) must fail isValidMint
            const badExp = `new TBC777({ 
    to: '${minter.getPublicKey()}', 
    amount: 0n, 
    name: '${TEST_NAME}', 
    symbol: '${TEST_SYMBOL}', 
    remoteRoot: '${source.root}' 
  })`;
            const { effect: badEffect, tx: badTx } = await minter.encode({ exp: badExp, mod });
            const badRemote = branded(badEffect.res);
            await minter.broadcast(badTx);
            const { effect: isValidBad } = await minter.encode({
                exp: `TBC777.isValidMint(badRemote)`,
                env: { badRemote: badRemote._rev },
                mod,
            });
            expect(isValidBad.res).to.be.false;
        });
        it('concurrent claims from multiple tokens on the same escrow respect inRevs ordering', async () => {
            // TODO
        });
    });
});
// ============================================================
// UNIT TESTS FOR makeRegex
// ============================================================
describe('TBC777.makeRegex (unit)', () => {
    const validTo = '02abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
    const validName = 'test';
    const validSymbol = 'TST';
    function makeExp(to = validTo, amount = '30', name = validName, symbol = validSymbol, extra = '') {
        return `new TBC777({to:'${to}',amount:${amount}n,name:'${name}',symbol:'${symbol}'${extra}})`;
    }
    it('accepts valid initial constructor expression', () => {
        const regex = TBC777.makeRegex(makeExp());
        expect(regex.test(makeExp())).to.equal(true);
    });
    it('accepts remoteRoot constructor with extra fields', () => {
        const exp = makeExp(validTo, '7', 'test', 'TST', `,remoteRoot:'abc:0',withdrawn:['def:0']`);
        const regex = TBC777.makeRegex(exp);
        expect(regex.test(exp)).to.equal(true);
    });
    it('rejects invalid to length, prefix, or non-hex characters', () => {
        expect(() => TBC777.makeRegex(makeExp('04' + 'a'.repeat(64)))).to.throw();
    });
    it('rejects negative amounts', () => {
        expect(() => TBC777.makeRegex(makeExp(validTo, '-10'))).to.throw();
    });
    it('rejects inline class / shadowing attacks', () => {
        const malicious = `new (class extends TBC777 {...})({to:'${validTo}',amount:30n,name:'test',symbol:'TST'})`;
        const regex = TBC777.makeRegex(makeExp());
        expect(regex.test(malicious)).to.equal(false);
    });
});
//# sourceMappingURL=tbc777.test.js.map