/**
 * TBC777 - Programmable Escrow Token Standard for Bitcoin Computer
 *
 * Extends TBC20 with native on-chain escrow primitives. An EscrowAuditor
 * enforces a strict no-inflation invariant for all token lineages.
 *
 * CORE GUARANTEE: Even if an escrow contract is buggy or malicious and
 * over-authorizes claims, the audited balance for any token lineage can never
 * exceed the amount originally minted. This is achieved by:
 *
 * - Walking the full revision history (prev-chain) of any escrow revision
 * - Validating every deposit with both `isEqualTo` and `isValidMint`
 * - Summing only claim amounts recorded under the matching lineage root
 *   (over-authorization can only reduce available balance, never increase it)
 * - Rejecting any withdrawal that would make availableBalance negative
 *
 * Additional properties:
 * - Cross-chain / remote-root tokens are supported
 * - One token may deposit into multiple escrows over its lifetime
 * - One escrow may accept deposits from multiple distinct tokens
 * - Transfers automatically clear escrow-related state on the recipient
 * - `merge()` is disabled; use atomic escrow-based merge instead
 *
 * REMOTE-ROOT TOKEN CREATION (bridged / cross-chain tokens): Remote-root tokens
 * MUST be instantiated with `amount: 0n` and MUST immediately perform a
 * `withdraw(rev)` or `finalWithdraw(rev)` inside the same transaction that
 * creates them. This guarantees the initial balance originates from a validated
 * escrow claim.
 *
 * @see ./tbc20.ts
 * @see https://docs.bitcoincomputer.io/
 */

// TYPES & INTERFACES

import { Id, Rev, Root, Contract } from '@bitcoin-computer/lib'
import { TBC20, TBC20ConstructorParams } from './tbc20.js'

export type Constructor<T> = new (...args: any[]) => T
export type Amount = bigint

/**
 * Represents a single deposit recorded in an escrow.
 * - root: immutable token lineage
 * - revision: token version
 */
export type DepositEntry = [Root, Rev]

/**
 * Represents a withdrawal or final-withdrawal claim.
 * - root: immutable token lineage
 * - id: immutable token identifier
 * - amount: amount authorized
 */
export type ClaimEntry = [Root, Id, Amount]

/**
 * Pre-filtered claim entry for a specific lineage (root omitted after filtering
 * in collectRevisions). Used by EscrowAuditor for totalRegularAuthorized /
 * totalFinalAuthorized calculations.
 */
export type ClaimAmountEntry = [Id, Amount]

/**
 * Canonical escrow interface (mandatory for all TBC777-compatible escrows).
 *
 * Defines the minimal append-only history that `EscrowAuditor` requires to
 * enforce the no-inflation guarantee. Escrow contracts may contain additional
 * business logic and state; the auditor only inspects these three arrays.
 *
 * @property {DepositEntry[]} deposits Every successful deposit ever accepted.
 *   Each entry is `[root, rev]` where `rev` is the token's input revision (the
 *   `_rev` that existed *before* `deposit()` mutated the token balance).
 *
 *   `EscrowAuditor` calls `computer.next(rev)` to obtain the post-deposit state
 *   and computes the exact deposited delta. Only entries that satisfy both
 *   `isEqualTo` and `isValidMint` contribute to `totalDeposited`.
 *
 * @property {ClaimEntry[]} withdraws Regular (non-final) withdrawal claims.
 *   These are collected from every revision in the escrow's full prev-chain.
 *
 * @property {ClaimEntry[]} finalWithdraws Final-withdrawal claims. Read from
 *   the specific `escrowRev` revision supplied to `audit()`. Escrow
 *   implementations should record final-withdrawal entries only in their
 *   terminal (latest) revision. The `finalWithdraw()` method on tokens
 *   additionally verifies that the supplied revision is currently the live tip
 *   of the escrow via `computer.last(rev)`.
 *
 * SECURITY INVARIANT: Even if an escrow is buggy or malicious and
 * over-authorizes claims, the audited balance for any token lineage can never
 * exceed the amount originally minted.
 */
export abstract class Escrow extends Contract {
  deposits!: DepositEntry[]
  withdraws!: ClaimEntry[]
  finalWithdraws!: ClaimEntry[]
}

export type CompatibilityValidator = (candidate: any) => Promise<boolean>

/**
 * AuditResult — the single source of truth for a token lineage's state inside
 * an escrow.
 *
 * Returned by `EscrowAuditor.audit(escrowRev, token)` (and internally by
 * `getAudit()`).
 *
 * Computed by walking the **complete** prev-chain of the given escrow revision.
 * This is what enforces the core no-inflation guarantee: `totalDeposited` is
 * strictly validated, and `availableBalance` is computed as `totalDeposited −
 * totalRegularAuthorized − totalFinalAuthorized`. Any over-authorization of
 * claims only reduces `availableBalance` (making the guard stricter) and can
 * never allow a lineage to extract more value than was validly deposited.
 *
 * The result contains two distinct categories of information:
 *
 * 1. **Lineage-level aggregates** (`totalDeposited`, `totalRegularAuthorized`,
 *    `totalFinalAuthorized`, `availableBalance`) → Used to track the overall
 *    health of the lineage inside the escrow.
 *
 * 2. **Per-token-instance claimables** (`regularClaimable`, `finalClaimable`) →
 *    What **a specific token** (`_id`) can actually claim right now from the
 *    current escrow state.
 */
export type AuditResult = {
  /**
   * Total amount **validly deposited** into this escrow for the lineage.
   *
   * Only deposit revisions that pass **both** `isEqualTo` **and** `isValidMint`
   * are counted. This is the strictest validation in the entire system.
   */
  totalDeposited: bigint

  /**
   * Cumulative total of all amounts recorded as claimable via regular
   * `withdraw()` for this lineage (collected from the **entire** escrow
   * history).
   *
   * These amounts come from claim entries whose root matched the lineage after
   * filtering in `collectRevisions`. They represent recorded claim
   * opportunities, not necessarily amounts already pulled out.
   * Over-authorization here only lowers `availableBalance` and cannot violate
   * the no-inflation guarantee.
   */
  totalRegularAuthorized: bigint

  /**
   * Cumulative total of all amounts recorded as claimable via `finalWithdraw()`
   * for this lineage.
   *
   * Only read from the **latest** escrow revision (`states[0]`). Same semantics
   * as `totalRegularAuthorized`.
   */
  totalFinalAuthorized: bigint

  /**
   * Amount that **this specific token instance** (`_id`) can currently claim
   * via `withdraw(rev)` from the audited escrow revision.
   *
   * This is the sum of all matching entries in the *current* escrow's
   * `withdraws` array for this token's exact `_id`. It is what `withdraw()`
   * will add to `this.amount` if called successfully.
   */
  regularClaimable: bigint

  /**
   * Amount that **this specific token instance** (`_id`) can currently claim
   * via `finalWithdraw(rev)` from the audited escrow revision.
   *
   * This is the sum of all matching entries in the `finalWithdraws` array of
   * the supplied `escrowRev`. `getAudit()` and `getBalance()` return the value
   * recorded in the given revision without checking whether it is currently the
   * tip.
   *
   * The `finalWithdraw()` method itself performs the terminal-revision check
   * via `computer.last(rev)`. This keeps the transient observation scoped to
   * the privileged final-withdraw path and preserves determinism for regular
   * operations (`withdraw`, `getBalance`, `audit`) under chain extension.
   *
   * Escrow authors should record `finalWithdraws` entries only in the terminal
   * revision of the escrow.
   */
  finalClaimable: bigint

  /**
   * Remaining available balance for the **entire lineage**: `totalDeposited −
   * totalRegularAuthorized − totalFinalAuthorized`.
   *
   * This is a **conservative** (safe) view — it subtracts every amount that has
   * been made available to claim. Must be ≥ 0. A negative value triggers an
   * error in `_withdraw()`, protecting the no-inflation invariant even if an
   * escrow over-authorizes claims.
   */
  availableBalance: bigint
}

/**
 * EscrowAuditor — the single source of truth for the no-inflation guarantee.
 *
 * Placed outside the token class so that its documentation does not increase
 * the on-chain size of deployed TBC777 instances.
 */
export class EscrowAuditor {
  /**
   * Core security invariant enforced by the auditor:
   *
   * - Only deposits that satisfy BOTH `isEqualTo` AND `isValidMint` are counted
   *   toward `totalDeposited`.
   * - All recorded claim amounts (regular withdrawals from the full prev-chain
   *   plus final withdrawals from the audited revision) are subtracted.
   * - Over-authorization by a buggy or malicious escrow can only *reduce*
   *   `availableBalance`; it can never cause inflation.
   * - If `availableBalance < 0` after the audit, the withdrawal is rejected.
   *
   * Enforced inside `getAudit()` and `_withdraw()`.
   */
  static async walkHistory(rev: Rev): Promise<Escrow[]> {
    const states: Escrow[] = []
    let current: Rev | null = rev
    while (current) {
      states.push((await computer.sync(current)) as any)
      current = (await computer.prev(current)) as Rev | null
    }
    return states
  }

  /**
   * Synchronously collects all deposit and claim entries that belong to the
   * given lineage.
   *
   * - Deposit and regular-withdraw entries are gathered from the entire
   *   prev-chain (`states`).
   * - Final-withdraw entries are taken only from `states[0]` (the exact
   *   `escrowRev` supplied to `audit()`).
   */
  static collectRevisions(states: Escrow[], lineage: Root) {
    const depositRevs = new Set<Rev>()
    const withdrawEntries = new Set<ClaimAmountEntry>()
    const finalEntries = new Set<ClaimAmountEntry>()

    if (states.length === 0) return { depositRevs, withdrawEntries, finalEntries }

    const [finalState] = states
    for (const { deposits, withdraws } of states) {
      for (const [r, rev] of deposits) {
        if (r === lineage) depositRevs.add(rev)
      }
      for (const [r, id, amt] of withdraws) {
        if (r === lineage) withdrawEntries.add([id, amt] as ClaimAmountEntry)
      }
    }

    for (const [r, id, amt] of finalState.finalWithdraws) {
      if (r === lineage) finalEntries.add([id, amt] as ClaimAmountEntry)
    }

    return { depositRevs, withdrawEntries, finalEntries }
  }

  /**
   * Computes the total amount validly deposited for the lineage.
   *
   * Every candidate deposit revision is validated with both `isEqualTo` and
   * `isValidMint` (via the token instance). Only passing deposits contribute.
   */
  static async sumDeposits(depositRevs: Set<Rev>, escrow: Id, token: TBC777): Promise<bigint> {
    const getDepositAmount = async (rev: Rev) => {
      const deposit = await computer.sync(rev)
      if (!(await token.isValidDeposit(deposit))) return 0n
      return await TBC777.computeDepositAmount(deposit, escrow, token.root as Root)
    }
    const amounts = await Promise.all([...depositRevs].map(getDepositAmount))
    return amounts.reduce((sum, amt) => sum + amt, 0n)
  }

  /**
   * Sums claim amounts for a lineage.
   *
   * Entries are pre-filtered by root in collectRevisions, so we sum the
   * recorded amounts directly. This trusts the root annotation written by the
   * escrow at claim time. Over-authorization can only reduce availableBalance
   * and cannot violate the no-inflation guarantee.
   */
  static sumClaims(entries: Set<ClaimAmountEntry>): bigint {
    return [...entries].reduce((sum, [, amt]) => sum + amt, 0n)
  }

  static async getAudit(states: Escrow[], token: TBC777): Promise<AuditResult> {
    if (states.length === 0) {
      return {
        totalDeposited: 0n,
        totalRegularAuthorized: 0n,
        totalFinalAuthorized: 0n,
        regularClaimable: 0n,
        finalClaimable: 0n,
        availableBalance: 0n,
      }
    }

    const lineage = token.root as Root
    const tokenId = token._id as Id

    const { depositRevs, withdrawEntries, finalEntries } = this.collectRevisions(states, lineage)

    const escrow = states[0]._id as Id

    const totalDeposited = await this.sumDeposits(depositRevs, escrow, token)
    const totalRegularAuthorized = this.sumClaims(withdrawEntries)
    const totalFinalAuthorized = this.sumClaims(finalEntries)

    const getClaimable = (entries: ClaimEntry[]): bigint =>
      entries
        .filter(([r, id]) => r === lineage && id === tokenId)
        .reduce((sum, [, , amt]) => sum + amt, 0n)

    const { withdraws, finalWithdraws } = states[0]
    const regularClaimable = getClaimable(withdraws)

    // finalClaimable is taken directly from the supplied escrowRev (states[0]).
    // The terminal-revision check is performed only inside finalWithdraw() via
    // computer.last(rev). This avoids transient observations in the
    // deterministic paths (getBalance, audit, regular withdraw).
    const finalClaimable = getClaimable(finalWithdraws)

    const availableBalance = totalDeposited - totalRegularAuthorized - totalFinalAuthorized

    return {
      totalDeposited,
      totalRegularAuthorized,
      totalFinalAuthorized,
      regularClaimable,
      finalClaimable,
      availableBalance,
    }
  }

  /**
   * Public entry point. The single source of truth for the no-inflation
   * guarantee.
   *
   * Accepts a TBC777 token instance (the instance provides its own
   * `isValidDeposit` validator) together with an escrow revision.
   */
  static async audit(escrowRev: Rev, token: TBC777): Promise<AuditResult> {
    const states = await this.walkHistory(escrowRev)

    return this.getAudit(states, token)
  }
}

export type TBC777Params = TBC20ConstructorParams & {
  remoteRoot?: string
  withdrawn?: Rev[]
  finalWithdrawn?: Rev[]
  escrow?: Id
}

export class TBC777 extends TBC20 {
  remoteRoot?: string
  withdrawn!: Rev[]
  finalWithdrawn!: Rev[]
  escrow?: Id

  private static readonly CLEAN_STATE = {
    withdrawn: [] as Rev[],
    finalWithdrawn: [] as Rev[],
    escrow: undefined as Id | undefined,
  }

  /**
   * Remote-root tokens (used for bridged / cross-chain value) MUST be created
   * with `amount: 0n`. The constructor enforces this rule.
   *
   * A remote-root token MUST immediately call `withdraw(rev)` or
   * `finalWithdraw(rev)` inside the same transaction that instantiates it. This
   * guarantees that its initial balance originates from a validated escrow
   * claim and that `isValidMint()` can later prove the on-chain genesis state
   * had zero balance.
   */
  constructor(args: TBC777Params) {
    const { amount, remoteRoot } = args

    if (amount !== undefined) {
      if (amount < 0n) throw new Error('Amount cannot be negative')
      if (amount === 0n && !remoteRoot)
        throw new Error('Zero amount is only valid for remote-root tokens')
      if (remoteRoot && amount !== 0n)
        throw new Error('Remote-root tokens must be created with amount 0n')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { withdrawn, finalWithdrawn, escrow, ...rest } = args

    super({
      ...TBC777.CLEAN_STATE,
      ...rest,
      withdrawn: withdrawn ?? [],
      finalWithdrawn: finalWithdrawn ?? [],
    })
  }

  /**
   * Effective token lineage root. For cross-chain / remote-root tokens the
   * supplied `remoteRoot` takes precedence over the on-chain `_root`.
   */
  get root(): string {
    return this.remoteRoot || this._root
  }

  /**
   * `merge()` is permanently disabled for TBC777. Use an escrow-based atomic
   * merge pattern instead: deposit source tokens into an escrow and then claim
   * the aggregate amount into a single target token.
   */
  merge(): never {
    throw new Error('merge() is disabled in TBC777.')
  }

  /**
   * Factory used by `transfer()`. Creates a clean token instance for the
   * recipient.
   *
   * All escrow-related mutable state (`withdrawn`, `finalWithdrawn`, `escrow`)
   * is deliberately omitted so the recipient does not inherit any claim
   * history. Escrow claims are always bound to a concrete token `_id`, making
   * this safe.
   */
  protected _createTransferToken(to: string, amount: bigint): this {
    const ctor = this.constructor as Constructor<this>

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _root, _rev, _owners, withdrawn, finalWithdrawn, escrow, ...preserved } = this

    return new ctor({ ...preserved, to, amount })
  }

  /**
   * Deposit a positive amount into the given escrow.
   *
   * The deposited amount is subtracted from the token's balance and the escrow
   * identifier is recorded so that future claims can be validated against this
   * lineage.
   */
  deposit(escrow: Id, deposit: Amount) {
    if (deposit <= 0n) throw new Error('Deposit amount must be positive')
    if (this.amount < deposit) throw new Error('Insufficient balance for deposit')

    this.escrow = escrow
    this.amount -= deposit
  }

  /**
   * Returns the current audited available balance for this token with respect
   * to a specific escrow revision.
   */
  async getBalance(escrowRev: Rev): Promise<bigint> {
    const audit = await EscrowAuditor.audit(escrowRev, this)
    return audit.availableBalance
  }

  /**
   * The deposit tuple that an escrow records when it accepts a deposit from
   * this token.
   *
   * Returns `[root, rev]` where `rev` is the token's revision *before* the
   * `deposit()` mutation was applied. `EscrowAuditor` later calls
   * `computer.next(rev)` to obtain the post-deposit state and compute the exact
   * delta that entered the escrow.
   */
  get depositTuple(): DepositEntry {
    return [this.root as Root, this._rev as Rev]
  }

  /**
   * Validator used by the auditor to decide whether a candidate token revision
   * constitutes a legitimate deposit for this lineage.
   *
   * Requires BOTH `isEqualTo` (lineage / semantic compatibility) AND
   * `isValidMint` (proper remote-root mint rules when applicable).
   */
  public get isValidDeposit(): CompatibilityValidator {
    return async (cand: any) =>
      (await this.isEqualTo(cand as TBC777)) && (await TBC777.isValidMint(cand as TBC777))
  }

  /**
   * Claim a regular (non-final) withdrawal from the given escrow revision.
   */
  async withdraw(rev: Rev) {
    return this._withdraw(rev, false)
  }

  /**
   * Claim a final withdrawal from the given escrow revision.
   *
   * Performs an explicit terminal-revision check via `computer.last(rev)`. The
   * supplied revision must be the current live tip of the escrow at the moment
   * of evaluation. This check is intentionally omitted from regular
   * `withdraw()` and `getBalance()` so those paths stay free of transient
   * observations and remain deterministic under chain extension.
   */
  async finalWithdraw(rev: Rev) {
    return this._withdraw(rev, true)
  }

  private async _withdraw(rev: Rev, isFinal: boolean) {
    const targetList = isFinal ? this.finalWithdrawn : this.withdrawn
    if (targetList.includes(rev)) throw new Error('Cannot withdraw multiple times')

    const { availableBalance, regularClaimable, finalClaimable } = await EscrowAuditor.audit(
      rev,
      this,
    )
    const claimable = isFinal ? finalClaimable : regularClaimable

    // No-inflation enforcement: even if the escrow over-authorizes claims, a
    // negative availableBalance causes the withdrawal to be rejected.
    if (availableBalance < 0)
      throw new Error(`Escrow available balance (${availableBalance}) too low`)
    if (claimable <= 0n)
      throw new Error(`Claimable ${isFinal ? 'final ' : ''}withdraw amount is zero or negative`)

    if (isFinal) {
      const lastRev = await computer.last(rev)
      if (lastRev !== rev) {
        throw new Error("finalWithdraws can only be claimed from the escrow's last revision")
      }
    }

    this.amount += claimable
    targetList.push(rev)
    if (!isFinal) this.escrow = undefined
  }

  /**
   * Canonical compatibility check (single source of truth for lineage
   * equality).
   *
   * Fast path: same on-chain root (no remoteRoot) → O(1) synchronous check.
   * Slow path: same logical root (remoteRoot case) → full semantic comparison
   * of constructor expressions and module code.
   */
  async isEqualTo(other: TBC777): Promise<boolean> {
    if (this.sameLineage(other)) return true
    if (this.root === other.root) return await this._semanticEqualTo(other)
    return false
  }

  /**
   * Synchronous fast-path lineage check. Returns true only when both tokens
   * share the identical on-chain `_root` and neither uses a `remoteRoot`.
   */
  sameLineage(other: TBC777): boolean {
    return !this.remoteRoot && !other.remoteRoot && this._root === other._root
  }

  /**
   * Full semantic comparison for cross-lineage / remote-root tokens. Compares
   * the deployed module code, constructor expression shape, and environment.
   * Defensive try/catch returns false on any decoding failure.
   */
  private async _semanticEqualTo(other: TBC777): Promise<boolean> {
    try {
      const { mod: myMod, exp: myExp, env: myEnv } = await TBC777.getSignature(this)
      const { mod: otherMod, exp: otherExp, env: otherEnv } = await TBC777.getSignature(other)

      const { TBC777: my777, TBC20: my20 } = await computer.load(myMod!)
      const { TBC777: other777, TBC20: other20 } = await computer.load(otherMod!)

      if (my777.toString() !== other777.toString() || my20.toString() !== other20.toString())
        return false

      const isEmptyEnv = (env: object) =>
        env != null &&
        typeof env === 'object' &&
        Object.getPrototypeOf(env) === Object.prototype &&
        Object.keys(env).length === 0

      if (!isEmptyEnv(myEnv) || !isEmptyEnv(otherEnv)) return false

      return TBC777.makeRegex(myExp).test(otherExp)
    } catch {
      return false
    }
  }

  /** Returns the decoded original transaction that created this token's root.
   * */
  static async getSignature(token: TBC777): Promise<any> {
    const txId = token._root.split(':')[0]
    return computer.decode(txId)
  }

  /**
   * Computes the exact amount that was deposited for a given entry recorded in
   * `escrow.deposits`.
   *
   * The revision stored by the escrow is the token's revision *before* the
   * `deposit()` call mutated its balance. Therefore `computer.next()` (not
   * `prev()`) must be used to obtain the post-deposit state and calculate:
   *
   *     deposited = pre-deposit amount − post-deposit amount
   */
  static async computeDepositAmount(depositData: any, escrow: Id, lineage: Root): Promise<bigint> {
    const root = depositData.remoteRoot || depositData._root
    if (root !== lineage) return 0n

    const nextRev = await computer.next(depositData._rev)
    if (!nextRev) return 0n
    const nextToken = (await computer.sync(nextRev)) as unknown as TBC777
    if (String(nextToken.escrow) !== String(escrow)) return 0n

    return depositData.amount - nextToken.amount
  }

  /**
   * Validates that a remote-root token was created according to the rules.
   *
   * A remote-root token must have been instantiated with `amount: 0n` and must
   * have recorded at least one withdrawal claim (`withdrawn` or
   * `finalWithdrawn`) in the same transaction. The check confirms that the
   * genesis state at `_id` really had zero balance, proving the value
   * originated from a legitimate audited escrow claim.
   */
  static async isValidMint(token: TBC777): Promise<boolean> {
    if (!token.remoteRoot) return true
    if (token.withdrawn.length === 0 && token.finalWithdrawn.length === 0) return false

    const { amount } = await computer.sync<typeof TBC777>(token._id)
    return amount === 0n
  }

  /**
   * Builds a strict regular expression that matches only well-formed TBC777
   * constructor expressions.
   *
   * Rejects:
   * - Invalid `to` addresses, negative/zero amounts (except remote-root)
   * - Expressions containing `class`, `extends`, or `function` keywords
   *   (prevents inline-class / shadowing attacks)
   *
   * Used by the semantic-equality path for remote-root tokens.
   */
  static makeRegex(exp: string): RegExp {
    const toMatch = exp.match(/to\s*:\s*'(0[23][0-9a-fA-F]{64})'/)?.[1]
    const amountMatch = exp.match(/amount\s*:\s*(0|[1-9]\d*)n/)?.[1]
    const nameMatch = exp.match(/name\s*:\s*'([^']+)'/)?.[1]
    const symbolMatch = exp.match(/symbol\s*:\s*'([^']+)'/)?.[1]

    if (!toMatch || !amountMatch || !nameMatch || !symbolMatch)
      throw new Error('Input string is not in a valid TBC777 constructor form')
    if (amountMatch === '0' && !exp.includes('remoteRoot'))
      throw new Error('Zero amount is only valid for remote-root tokens')

    const noStrings = exp
      .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '""')
      .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""')

    if (/\b(class|extends|function)\b/.test(noStrings))
      throw new Error('Constructor expression contains forbidden keywords')

    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const pattern =
      `^\\s*new\\s+TBC777\\s*\\(\\s*\\{[\\s\\S]*?` +
      `(?=.*to\\s*:\\s*'(0[23][0-9a-fA-F]{64})')` +
      `(?=.*amount\\s*:\\s*(0|[1-9]\\d*)n)` +
      `(?=.*name\\s*:\\s*'${escape(nameMatch)}')` +
      `(?=.*symbol\\s*:\\s*'${escape(symbolMatch)}')` +
      `(?!.*\\b(class|extends|function)\\b)` +
      `[\\s\\S]*\\}\\s*\\)\\s*$`

    return new RegExp(pattern)
  }
}
