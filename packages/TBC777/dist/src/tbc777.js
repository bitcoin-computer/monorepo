/**
 * TBC777 - Programmable Escrow Token Standard for Bitcoin Computer
 *
 * Reference implementation extending TBC20 with native, on-chain escrow
 * primitives and an EscrowAuditor that enforces a strict no-inflation
 * invariant.
 *
 * THE CORE GUARANTEE: Even if an escrow contract is buggy, malicious, or
 * deliberately tries to over-authorize claims, the audited balance for any
 * token lineage can never exceed the amount originally minted. This is achieved
 * by:
 *
 * - Walking the full prev-chain of any escrow revision
 * - Strictly validating deposits using both `isEqualTo` + `isValidMint`
 * - Summing claim amounts that were recorded under the lineage root
 *   (over-authorization of claims can only reduce `availableBalance` and cannot
 *   cause inflation)
 * - Computing exact per-token claimable amounts from the current escrow state
 *   and rejecting withdrawals when `availableBalance < 0`
 *
 * Additional guarantees:
 * - Cross-chain tokens are supported
 * - A single token instance may deposit into multiple escrows over time
 * - An escrow can accept deposits from multiple different tokens
 * - Transfers automatically sanitize escrow-related state on the recipient
 * - `merge()` is intentionally disabled — use escrow-based atomic merge instead
 *
 * REMOTE-ROOT TOKEN CREATION (cross-chain / bridged tokens): Remote-root tokens
 * MUST be created with `amount: 0n` and MUST immediately call `withdraw(rev)`
 * or `finalWithdraw(rev)` in the same transaction:
 *
 *   const token = new TBC777({ amount: 0n, remoteRoot: 'abc123...', ... })
 *   token.withdraw(escrowRev)   // or finalWithdraw(escrowRev)
 *
 * This pattern guarantees that the minted amount exactly matches an audited
 * claim.
 *
 * @see ./tbc20.ts
 * @see https://docs.bitcoincomputer.io/
 */
import { TBC20 } from './tbc20.js';
/**
 * Canonical escrow interface (mandatory for all TBC777-compatible escrows).
 *
 * This defines the *minimal* append-only history log that `EscrowAuditor` needs
 * to enforce the no-inflation guarantee. Escrows may add any extra business
 * logic/state — the auditor ignores everything except these three arrays.
 *
 * @property {DepositEntry[]} deposits Every successful deposit ever accepted.
 *   Each entry is `[root, rev]` where **`rev` is the input/pre-mutation
 *   revision of the token** (i.e. the revision that existed *before*
 *   `deposit()` reduced `this.amount` in that transition).
 *
 *   `EscrowAuditor` uses `computer.next(rev)` to obtain the post-deposit state
 *   and compute the exact delta deposited. Only entries that pass *both*
 *   `isEqualTo` **and** `isValidMint` contribute to `totalDeposited`.
 *
 * @property {ClaimEntry[]} withdraws Regular (non-final) withdrawal claims.
 *   Collected from **every** revision in the escrow's full prev-chain.
 *
 * @property {ClaimEntry[]} finalWithdraws Final-withdrawal claims. These are
 *   only ever present/claimable on the **terminal (latest)** revision of the
 *   escrow. Auditor reads them exclusively from `states[0]`.
 *
 * SECURITY INVARIANT (core no-inflation guarantee): Even if an escrow contract
 * is buggy, malicious, or deliberately tries to over-authorize claims, the
 * audited balance for any token lineage can never exceed the amount originally
 * minted.
 */
export class Escrow extends Contract {
}
/**
 * The EscrowAuditor is the single source of truth for the no-inflation
 * guarantee. It is deliberately placed outside the token class so its detailed
 * documentation does not increase deployed class size.
 */
export class EscrowAuditor {
    /**
     * SECURITY INVARIANT (core no-inflation guarantee)
     *
     * - Only deposits that pass BOTH `isEqualTo` AND `isValidMint` contribute to
     *   totalDeposited.
     * - All historical claim amounts (regular withdraws from full prev-chain +
     *   finalWithdraws from latest revision) are subtracted.
     * - Over-authorization by a malicious or buggy escrow can only *reduce*
     *   availableBalance (never increase it).
     * - If availableBalance < 0 after audit, withdrawals are rejected.
     *
     * This is enforced in getAudit() + _withdraw().
     */
    static async walkHistory(rev) {
        const states = [];
        let current = rev;
        while (current) {
            states.push((await computer.sync(current)));
            current = (await computer.prev(current));
        }
        return states;
    }
    /**
     * Pure synchronous collection of relevant entries for a lineage. NOTE:
     * finalEntries only taken from states[0] (latest revision) because
     * finalWithdraws are only ever present and claimable on the terminal state.
     * Regular withdraws are collected from the full history.
     */
    static collectRevisions(states, lineage) {
        const depositRevs = new Set();
        const withdrawEntries = new Set();
        const finalEntries = new Set();
        if (states.length === 0)
            return { depositRevs, withdrawEntries, finalEntries };
        const [finalState] = states;
        for (const { deposits, withdraws } of states) {
            for (const [r, rev] of deposits) {
                if (r === lineage)
                    depositRevs.add(rev);
            }
            for (const [r, id, amt] of withdraws) {
                if (r === lineage)
                    withdrawEntries.add([id, amt]);
            }
        }
        for (const [r, id, amt] of finalState.finalWithdraws) {
            if (r === lineage)
                finalEntries.add([id, amt]);
        }
        return { depositRevs, withdrawEntries, finalEntries };
    }
    /**
     * Computes total deposited after full validation (isEqualTo + isValidMint).
     * Matches the original deposit path exactly.
     *
     * Accepts the token instance directly for better encapsulation.
     */
    static async sumDeposits(depositRevs, escrow, token) {
        const getDepositAmount = async (rev) => {
            const deposit = await computer.sync(rev);
            if (!(await token.isValidDeposit(deposit)))
                return 0n;
            return await TBC777.computeDepositAmount(deposit, escrow, token.root);
        };
        const amounts = await Promise.all([...depositRevs].map(getDepositAmount));
        return amounts.reduce((sum, amt) => sum + amt, 0n);
    }
    /**
     * Sums claim amounts for a lineage.
     *
     * Entries are pre-filtered by root in collectRevisions, so we sum the
     * recorded amounts directly. This trusts the root annotation written by the
     * escrow at claim time. Over-authorization can only reduce availableBalance
     * and cannot violate the no-inflation guarantee.
     */
    static sumClaims(entries) {
        return [...entries].reduce((sum, [, amt]) => sum + amt, 0n);
    }
    static async getAudit(states, token) {
        if (states.length === 0) {
            return {
                totalDeposited: 0n,
                totalRegularAuthorized: 0n,
                totalFinalAuthorized: 0n,
                regularClaimable: 0n,
                finalClaimable: 0n,
                availableBalance: 0n,
                isTerminal: false,
            };
        }
        const lineage = token.root;
        const tokenId = token._id;
        const { depositRevs, withdrawEntries, finalEntries } = this.collectRevisions(states, lineage);
        const escrow = states[0]._id;
        const rev = states[0]._rev;
        const totalDeposited = await this.sumDeposits(depositRevs, escrow, token);
        const totalRegularAuthorized = this.sumClaims(withdrawEntries);
        const totalFinalAuthorized = this.sumClaims(finalEntries);
        const getClaimable = (entries) => entries
            .filter(([r, id]) => r === lineage && id === tokenId)
            .reduce((sum, [, , amt]) => sum + amt, 0n);
        const { withdraws, finalWithdraws } = states[0];
        const regularClaimable = getClaimable(withdraws);
        const isTerminal = (await computer.last(rev)) === rev;
        const finalClaimable = isTerminal ? getClaimable(finalWithdraws) : 0n;
        const availableBalance = totalDeposited - totalRegularAuthorized - totalFinalAuthorized;
        return {
            totalDeposited,
            totalRegularAuthorized,
            totalFinalAuthorized,
            regularClaimable,
            finalClaimable,
            availableBalance,
            isTerminal,
        };
    }
    /**
     * Public entry point – the single source of truth for the no-inflation
     * guarantee.
     *
     * Accepts a TBC777 token instance (which supplies its own validation strategy
     * via the `isValidDeposit` getter) and the escrow revision. This is the
     * simplest and most encapsulated API.
     */
    static async audit(escrowRev, token) {
        const states = await this.walkHistory(escrowRev);
        return this.getAudit(states, token);
    }
}
export class TBC777 extends TBC20 {
    /**
     * REMOTE-ROOT TOKEN CREATION (cross-chain / bridged tokens): Remote-root
     * tokens MUST be created with `amount: 0n` and MUST immediately call
     * `withdraw(rev)` or `finalWithdraw(rev)` in the same transaction.
     *
     * The constructor now enforces `amount === 0n` when `remoteRoot` is provided.
     */
    constructor(args) {
        const { amount, remoteRoot } = args;
        if (amount !== undefined) {
            if (amount < 0n)
                throw new Error('Amount cannot be negative');
            if (amount === 0n && !remoteRoot)
                throw new Error('Zero amount is only valid for remote-root tokens');
            if (remoteRoot && amount !== 0n)
                throw new Error('Remote-root tokens must be created with amount 0n');
        }
        // Remote-root tokens are a special case for bridged / cross-chain value.
        // They MUST start at amount: 0n and MUST record the claim (via withdrawn or
        // finalWithdrawn) so that isValidMint() can later prove the initial
        // on-chain state had zero balance.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { withdrawn, finalWithdrawn, escrow, ...rest } = args;
        super({
            ...TBC777.CLEAN_STATE,
            ...rest,
            withdrawn: withdrawn ?? [],
            finalWithdrawn: finalWithdrawn ?? [],
        });
    }
    /** Effective root (remoteRoot takes precedence for cross-chain tokens) */
    get root() {
        return this.remoteRoot || this._root;
    }
    /**
     * Merge is intentionally disabled. Use escrow-based atomic merge instead
     * (deposit sources then claim total into one target).
     */
    merge() {
        throw new Error('merge() is disabled in TBC777.');
    }
    /**
     * Creates a fresh token instance for the recipient of a transfer. We
     * deliberately sanitize all escrow-related mutable state (`withdrawn`,
     * `finalWithdrawn`, `escrow`) so the new owner does not inherit any
     * claim/withdrawal history. Claims in escrows are always tied to a specific
     * token `_id`, so this is safe.
     */
    _createTransferToken(to, amount) {
        const ctor = this.constructor;
        // Explicitly drop revision metadata + escrow-related mutable state so the
        // recipient receives a clean token instance with no inherited claim
        // history.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, _root, _rev, withdrawn, finalWithdrawn, escrow, ...preserved } = this;
        return new ctor({ ...preserved, to, amount });
    }
    /**
     * Deposit a positive amount into the given escrow. The deposited amount is
     * subtracted from this token's balance and the escrow reference is recorded
     * so that future claims can be validated.
     */
    deposit(escrow, deposit) {
        if (deposit <= 0n)
            throw new Error('Deposit amount must be positive');
        if (this.amount < deposit)
            throw new Error('Insufficient balance for deposit');
        this.escrow = escrow;
        this.amount -= deposit;
    }
    /**
     * Returns the current audited available balance for this token with respect
     * to a specific escrow revision.
     */
    async getBalance(escrowRev) {
        const audit = await EscrowAuditor.audit(escrowRev, this);
        return audit.availableBalance;
    }
    /**
     * Tuple recorded by escrows when accepting a deposit.
     *
     * Returns `[root, rev]` where **`rev` is the input/pre-mutation revision**
     * of the token at the moment the deposit is recorded (i.e. the `_rev` that
     * existed *before* `deposit()` reduced `this.amount` in the same transition).
     *
     * `EscrowAuditor.computeDepositAmount` uses `computer.next(rev)` to obtain
     * the post-deposit state and compute the exact delta that was moved into
     * the escrow.
     */
    get depositTuple() {
        return [this.root, this._rev];
    }
    /**
     * Returns a validator that checks whether a candidate token is a valid
     * deposit for this lineage. Requires BOTH semantic equality and a legitimate
     * mint (for remoteRoot tokens).
     */
    get isValidDeposit() {
        return async (cand) => (await this.isEqualTo(cand)) && (await TBC777.isValidMint(cand));
    }
    /**
     * Claim a regular (non-final) withdrawal from the given escrow revision.
     */
    async withdraw(rev) {
        return this._withdraw(rev, false);
    }
    /**
     * Claim a final withdrawal from the given escrow revision. Only allowed when
     * the revision is the terminal state of the escrow.
     */
    async finalWithdraw(rev) {
        return this._withdraw(rev, true);
    }
    async _withdraw(rev, isFinal) {
        const targetList = isFinal ? this.finalWithdrawn : this.withdrawn;
        if (targetList.includes(rev))
            throw new Error('Cannot withdraw multiple times');
        const { availableBalance, regularClaimable, finalClaimable, isTerminal } = await EscrowAuditor.audit(rev, this);
        const claimable = isFinal ? finalClaimable : regularClaimable;
        // Critical no-inflation enforcement point: Even if the escrow maliciously
        // over-authorizes claims in its history, a negative availableBalance will
        // cause this withdrawal to be rejected.
        if (availableBalance < 0)
            throw new Error(`Escrow available balance (${availableBalance}) too low`);
        if (claimable <= 0n)
            throw new Error(`Claimable ${isFinal ? 'final ' : ''}withdraw amount is zero or negative`);
        if (isFinal && !isTerminal)
            throw new Error("finalWithdraws can only be claimed from the escrow's last revision");
        this.amount += claimable;
        targetList.push(rev);
        if (!isFinal)
            this.escrow = undefined;
    }
    /**
     * Canonical compatibility predicate (single source of truth). Fast O(1)
     * lineage check or semantic equivalence for cross-chain/remoteRoot.
     */
    async isEqualTo(other) {
        if (this.sameLineage(other))
            return true;
        if (this.root === other.root)
            return await this._semanticEqualTo(other);
        return false;
    }
    /* Synchronous fast-path check */
    sameLineage(other) {
        return !this.remoteRoot && !other.remoteRoot && this._root === other._root;
    }
    /* Full semantic comparison (defensive try/catch). */
    async _semanticEqualTo(other) {
        try {
            const { mod: myMod, exp: myExp, env: myEnv } = await TBC777.getSignature(this);
            const { mod: otherMod, exp: otherExp, env: otherEnv } = await TBC777.getSignature(other);
            const { TBC777: my777, TBC20: my20 } = await computer.load(myMod);
            const { TBC777: other777, TBC20: other20 } = await computer.load(otherMod);
            if (my777.toString() !== other777.toString() || my20.toString() !== other20.toString())
                return false;
            const isEmptyEnv = (env) => env != null &&
                typeof env === 'object' &&
                Object.getPrototypeOf(env) === Object.prototype &&
                Object.keys(env).length === 0;
            if (!isEmptyEnv(myEnv) || !isEmptyEnv(otherEnv))
                return false;
            return TBC777.makeRegex(myExp).test(otherExp);
        }
        catch {
            return false;
        }
    }
    /** Decodes the original transaction that created this token's root. */
    static async getSignature(token) {
        const txId = token._root.split(':')[0];
        return computer.decode(txId);
    }
    /**
     * Computes the amount deposited for a given entry in `escrow.deposits`.
     *
     * IMPORTANT: The revision stored in `escrow.deposits` is the token's revision
     * *before* the deposit was applied. This is because, in Bitcoin Computer,
     * when a smart contract method mutates an object and records its `_rev` into
     * another object's state, it captures the *input* revision (pre-mutation).
     *
     * We therefore use `computer.next(depositData._rev)` to retrieve the
     * post-deposit revision and calculate the delta:
     *
     *     deposited = pre-deposit amount − post-deposit amount
     *
     * Using `prev()` instead would look one step too far back and return an
     * incorrect result.
     */
    static async computeDepositAmount(depositData, escrow, lineage) {
        const root = depositData.remoteRoot || depositData._root;
        if (root !== lineage)
            return 0n;
        // We must use next() (not prev()) because escrow.deposits stores the
        // token's _rev *before* the deposit() mutation was applied. next() gives us
        // the post-deposit state so we can compute the exact delta that was moved
        // into the escrow.
        const nextRev = await computer.next(depositData._rev);
        if (!nextRev)
            return 0n;
        const nextToken = (await computer.sync(nextRev));
        if (String(nextToken.escrow) !== String(escrow))
            return 0n;
        return depositData.amount - nextToken.amount;
    }
    /**
     * Validates that a remoteRoot token was created correctly.
     *
     * Remote-root tokens MUST be created with `amount: 0n` and MUST immediately
     * call `withdraw(rev)` or `finalWithdraw(rev)` in the same transaction. This
     * guarantees that the token's balance comes exclusively from an audited
     * escrow claim (via `EscrowAuditor`), enforcing the no-inflation invariant
     * without duplicating audit logic.
     *
     * The check simply verifies that the *initial* state (at `_id`) had zero
     * amount — proving the token did not arbitrarily mint value.
     */
    static async isValidMint(token) {
        if (!token.remoteRoot)
            return true;
        if (token.withdrawn.length === 0 && token.finalWithdrawn.length === 0)
            return false;
        const { amount } = await computer.sync(token._id);
        return amount === 0n;
    }
    /**
     * Creates a strict regex that only matches valid TBC777 constructor
     * expressions. Prevents inline-class / shadowing attacks.
     *
     * Supports both normal mints (amount > 0) and remote-root tokens (amount:
     * 0n).
     */
    static makeRegex(exp) {
        const toMatch = exp.match(/to\s*:\s*'(0[23][0-9a-fA-F]{64})'/)?.[1];
        const amountMatch = exp.match(/amount\s*:\s*(0|[1-9]\d*)n/)?.[1];
        const nameMatch = exp.match(/name\s*:\s*'([^']+)'/)?.[1];
        const symbolMatch = exp.match(/symbol\s*:\s*'([^']+)'/)?.[1];
        if (!toMatch || !amountMatch || !nameMatch || !symbolMatch)
            throw new Error('Input string is not in a valid TBC777 constructor form');
        if (amountMatch === '0' && !exp.includes('remoteRoot'))
            throw new Error('Zero amount is only valid for remote-root tokens');
        const noStrings = exp
            .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '""')
            .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""');
        if (/\b(class|extends|function)\b/.test(noStrings))
            throw new Error('Constructor expression contains forbidden keywords');
        const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = `^\\s*new\\s+TBC777\\s*\\(\\s*\\{[\\s\\S]*?` +
            `(?=.*to\\s*:\\s*'(0[23][0-9a-fA-F]{64})')` +
            `(?=.*amount\\s*:\\s*(0|[1-9]\\d*)n)` +
            `(?=.*name\\s*:\\s*'${escape(nameMatch)}')` +
            `(?=.*symbol\\s*:\\s*'${escape(symbolMatch)}')` +
            `(?!.*\\b(class|extends|function)\\b)` +
            `[\\s\\S]*\\}\\s*\\)\\s*$`;
        return new RegExp(pattern);
    }
}
TBC777.CLEAN_STATE = {
    withdrawn: [],
    finalWithdrawn: [],
    escrow: undefined,
};
//# sourceMappingURL=tbc777.js.map