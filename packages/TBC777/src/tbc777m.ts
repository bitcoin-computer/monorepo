/**
 * TBC777P - Programmable inflation-proof TBC20 token for arbitrary Escrow
 * contracts using the inner computer (multi-token array-only edition).
 *
 * TBC777P tokens can be safely deposited into *any* smart contract that exposes
 * the public properties `deposits: [string, string][]` and `withdraws: [string,
 * string, bigint][]` (even if it does not inherit from the provided `Escrow`
 * convenience base class).
 *
 * This design achieves two key goals simultaneously:
 *
 * - **No inflation is ever possible**, even if the escrow contract is malicious
 *   or buggy. The TBC777P token contract itself — not the escrow — is solely
 *   responsible for enforcing this invariant using on-chain audits.
 *
 * - The escrow contract can implement *any* computable distribution logic (for
 *   example, it could encode the rules of a chess game and guarantee that the
 *   winner receives both deposits) and can now hold **multiple independent
 *   token roots** in a single escrow instance.
 *
 * The no-inflation guarantee is enforced entirely inside TBC777P:
 *
 * - `deposit(escrowId: string, amount: bigint)` is the only public method that
 *   moves tokens into an escrow. It records the escrow identifier on the token
 *   and reduces the token’s balance.
 *
 * - `withdraw(withdrawRev: string)` is the only place where `this.amount` can
 *   ever increase after a deposit. Before crediting any tokens it performs a
 *   full on-chain audit of the escrow’s linear revision history (the
 *   “prev-chain”) using the trusted inner-computer primitives (`computer.sync`
 *   and `computer.prev`).
 *
 * The audit walks the complete prev-chain from the provided `withdrawRev`,
 * then:
 *
 * - Computes total deposits for this token’s `_root` by collecting all matching
 *   `[root, rev]` entries from `deposits` and calculating the actual amount
 *   moved in each deposit (via the difference between a token’s `prev` state
 *   and current state).
 *
 * - Computes total withdrawals claimed across all historical states (sum of
 *   every `[root, id, amount]` entry that matches the token’s root).
 *
 * Withdrawal is only permitted if `totalDeposits >= totalWithdraws`.
 *
 * Note: The current design assumes that every entry in `withdraws` refers to a
 * deposit from the *same* token lineage (same `_root`). Deposits from unrelated
 * TBC777P tokens will cause the withdraw to fail, but inflation is still
 * impossible. A buggy or malicious escrow may still fail to release tokens (the
 * token contract cannot fix escrow logic, only prevent over-issuance).
 */

import { TBC20, type TBC20ConstructorParams } from './tbc20.js'

/**
 * Minimal interface that any escrow contract must satisfy to be compatible with
 * TBC777P. The token contract never trusts the escrow's internal logic — it
 * only reads these two public arrays during the on-chain audit.
 *
 * Any contract (even one that does not extend this base class) can be used as
 * long as it exposes `deposits` and `withdraws` using the flat tuple format below.
 * This representation works perfectly with the Bitcoin Computer output model
 * (no nested objects).
 */
export abstract class Escrow extends Contract {
  /**
   * Flat list of all deposits ever accepted. Format: [tokenRoot, depositRev]
   * for every deposit
   */
  deposits: [string, string][]

  /**
   * Flat list of all withdrawal that can be claimed for the current revision.
   * Format: [tokenRoot, tokenId, amount].
   */
  withdraws: [string, string, bigint][]
}

export class TBC777M extends TBC20 {
  /** Tracks every withdraw revision that has already been claimed (prevents
   * double-spends) */
  withdrawRevs: string[]

  /** The escrow that is being deposited into in this revision */
  escrowId: string | undefined

  constructor(args: TBC20ConstructorParams) {
    super({ withdrawRevs: [], escrowId: undefined, ...args })
  }

  /**
   * Moves tokens from the caller's balance into an escrow.
   *
   * This is the *only* public method that can ever decrease `this.amount`. The
   * escrow identifier is recorded on-chain so the later audit can associate
   * this deposit with the correct escrow instance.
   */
  deposit(escrowId: string, deposit: bigint) {
    if (deposit <= 0n) throw new Error('Deposit amount must be positive')
    if (this.amount < deposit) throw new Error('Insufficient balance for deposit')

    this.escrowId = escrowId
    this.amount -= deposit
  }

  /**
   * Claims tokens back from an escrow.
   *
   * Before any tokens are credited, the escrow's entire revision history is
   * audited on-chain using the inner computer. This guarantees that the escrow
   * has never released more tokens than were deposited for this exact token
   * lineage (`_root`).
   */
  async withdraw(rev: string) {
    const { _id, _root } = this
    if (this.withdrawRevs.includes(rev)) throw new Error('Cannot withdraw multiple times')
    if (!(await TBC777M.isValid(rev, _root))) throw new Error('Escrow balance too low')

    this.withdrawRevs.push(rev)
    this.amount += await TBC777M.computeWithdraw(rev, _id, _root)
  }

  /**
   * Returns the amount this specific token instance (`_id`) is allowed to
   * withdraw according to the escrow's `withdraws` list at the given revision.
   * Only matching entries for the token’s root are summed.
   */
  static async computeWithdraw(rev: string, _id: string, _root: string): Promise<bigint> {
    const { withdraws } = await computer.sync<typeof Escrow>(rev)
    return withdraws
      .filter(([root, id]) => root === _root && id === _id)
      .map(([, , amount]) => amount)
      .reduce((prev, curr) => prev + curr, 0n)
  }

  /**
   * Performs the no-inflation invariant check.
   *
   * Walks the complete linear revision history ("prev-chain") of the escrow
   * starting from `withdrawRev`, then compares total actual deposits against
   * total claimed withdrawals for this token's `_root`.
   */
  static async isValid(rev: string, root: string): Promise<boolean> {
    const states: Escrow[] = []
    let current = rev

    // Collect every historical state. Deposits and withdrawals accumulate
    // across the entire lifetime of the escrow, so the audit must see them all.
    while (true) {
      states.push(await computer.sync<typeof Escrow>(current))
      const previous = await computer.prev(current)
      if (!previous) break
      current = previous
    }

    const deposits = await TBC777M.computeDeposits(states, root)
    const withdraws = await TBC777M.computeWithdraws(states, root)

    return deposits - withdraws >= 0
  }

  /**
   * Sums the *actual* deposited amounts for a given token lineage (`root`)
   * across all escrow states.
   *
   * `allStates[0]._id` is used as the canonical escrow identifier. For each
   * recorded deposit revision we load the TBC777P state and compute the precise
   * transfer amount via the pre/post-deposit balance delta.
   */
  static async computeDeposits(states: Escrow[], root: string): Promise<bigint> {
    if (states.length === 0) return 0n

    const escrowId = states[0]._id

    const depositRevs = new Set(
      states.flatMap((state) => state.deposits.filter(([r]) => r === root).map(([, rev]) => rev)),
    )

    const deposits = await Promise.all(
      [...depositRevs].map((rev: string) => computer.sync<typeof TBC777M>(rev)),
    )

    const depositAmounts = await Promise.all(
      deposits.map((deposit) => TBC777M.computeDeposit(deposit as TBC777M, escrowId, root)),
    )

    return depositAmounts.reduce((prev, curr) => curr + prev, 0n)
  }

  /**
   * Computes the exact number of tokens transferred into the escrow by this
   * particular deposit transaction.
   *
   * Uses `computer.prev` to obtain the token state *before* the deposit, then
   * subtracts the post-deposit balance. This value is independent of any data
   * supplied by the escrow.
   *
   * A malicious escrow cannot claim a deposit that was made to a different
   * escrow: we only credit the deposit if the *historical* token state at
   * deposit time recorded `token.escrowId === escrowId`.
   */
  static async computeDeposit(token: TBC777M, escrowId: string, root: string): Promise<bigint> {
    if (token.escrowId !== escrowId) return 0n
    if (token._root !== root) return 0n

    const prevRev = await computer.prev(token._rev)
    const prevToken = await computer.sync<typeof TBC777M>(prevRev)

    return prevToken.amount - token.amount
  }

  /**
   * Sums every withdrawal amount the escrow has ever recorded across all of its
   * historical states for the given root. This is the "claimed" side of the
   * audit.
   */
  static async computeWithdraws(allStates: Escrow[], root: string): Promise<bigint> {
    let total = 0n
    for (const state of allStates) {
      const claimsForRoot = state.withdraws.filter(([r]) => r === root).map(([, , amt]) => amt)

      total += claimsForRoot.reduce((prev, amt) => prev + amt, 0n)
    }
    return total
  }
}
