/**
 * TBC777M - Programmable inflation-proof TBC20 token for arbitrary Escrow
 * contracts.
 *
 * TBC777M tokens can be safely deposited into *any* smart contract that exposes
 * the public properties `deposits: [string, string][]`, `withdraws: [string,
 * string, bigint][]` and `finalWithdraws: [string, string, bigint][]` (even if
 * it does not inherit from the provided `Escrow` convenience base class).
 *
 * **Key guarantees**
 *
 * - **No inflation is ever possible**, even if the escrow is malicious or
 *   buggy. The TBC777M token contract alone enforces the invariant using a
 *   complete on-chain audit.
 *
 * - Escrows can implement *any* computable distribution logic (e.g. chess
 *   rules, auctions, lotteries) and safely hold **multiple independent token
 *   roots** in one instance.
 *
 * ### How the no-inflation guarantee works
 *
 * - `deposit(escrowId: string, amount: bigint)` is the *only public method that
 *   decreases `this.amount` as part of an escrow deposit flow*. Normal
 *   `transfer`, `burn`, and `merge` operations inherited from `TBC20` continue
 *   to work unchanged. The target escrow identifier is recorded on-chain so the
 *   later audit can associate this deposit with the correct escrow instance.
 *
 * - `withdraw(rev: string)` is the only place where `this.amount` can increase.
 *   Before crediting any tokens, it performs a full on-chain audit of the
 *   escrow’s entire linear revision history (the “prev-chain”) using the inner
 *   computer primitives (`computer.sync`, `computer.prev`, `computer.next`, and
 *   `computer.last`).
 *
 * The audit walks the complete prev-chain from the supplied `rev`, then:
 *
 * - Computes total *actual* deposits for this token’s `_root` (collecting every
 *   matching `[root, rev]` from `deposits` and calculating the precise transfer
 *   amount via the pre/post-deposit balance delta).
 *
 * - Computes total withdrawals ever offered across *all* historical states (sum
 *   of every matching `[root, id, amount]` entry in `withdraws` and
 *   `finalWithdraws`).
 *
 * Withdrawal succeeds only if `totalDeposits >= totalWithdraws +
 * totalFinalWithdraws`.
 *
 * **Note on performance and security**: The full-history audit is intentionally
 * conservative and O(n) in the number of escrow revisions. It guarantees
 * correctness even for long-lived escrows, but may become gas-intensive for
 * contracts with hundreds of revisions. This is the deliberate price of the
 * strong no-inflation guarantee.
 *
 * ### Important requirements for escrow implementers
 *
 * 1. **Deposit recording**: Push the *pre-deposit* revision of the token
 *    (`token._rev` *before* calling `token.deposit(...)`). This is the
 *    recommended pattern; the atomic pattern (escrow calling `deposit`
 *    internally) is also fully supported.
 *
 * 2. **`withdraws` is cumulative across history**: Every entry that ever
 *    appears in *any* revision of the escrow is counted by the audit (the lists
 *    are never “reset”). Do not duplicate the same `[root, id, amount]` tuple
 *    across revisions unless you intend the amount to be claimable multiple
 *    times. Most escrows should *replace* the array (`=`) rather than `push`
 *    (except for the `deposits` list, which should accumulate).
 *
 * 3. **`finalWithdraws`** are only paid when the supplied `rev` *is* the last
 *    revision of the escrow. Use this array for one-time final payouts (e.g.
 *    game winner takes all, auction settlement). The audit counts them
 *    conservatively from the provided revision’s `finalWithdraws` list.
 */

import { TBC20, type TBC20ConstructorParams } from './tbc20.js'

/**
 * Minimal interface that any escrow contract must satisfy to be compatible with
 * TBC777M. The token contract never trusts the escrow’s internal logic — it
 * only reads these three public arrays during the on-chain audit.
 *
 * Any contract (even one that does not extend this base class) can be used as
 * long as it exposes `deposits`, `withdraws`, and `finalWithdraws` using the
 * flat tuple format below. This representation works perfectly with the Bitcoin
 * Computer output model (no nested objects).
 */
export abstract class Escrow extends Contract {
  /**
   * Flat list of all deposits ever accepted. Format: [tokenRoot, depositRev]
   * for every deposit.
   */
  deposits!: [string, string][]

  /**
   * List of all withdrawals that can be claimed for the current revision.
   * Format: [tokenRoot, tokenId, amount].
   *
   * The audit sums *every* entry that has ever existed in any historical
   * revision.
   */
  withdraws!: [string, string, bigint][]

  /**
   * List of all withdrawals that can be claimed only in the final revision.
   * Format: [tokenRoot, tokenId, amount].
   *
   * The audit counts these from the revision passed to `withdraw`.
   */
  finalWithdraws!: [string, string, bigint][]
}

export class TBC777M extends TBC20 {
  /** Tracks every withdraw revision that has already been claimed. Prevents
   * double-spends and replay attacks across revisions.
   */
  withdrawn!: string[]

  /** The escrow that is being deposited into in this revision (recorded
   * on-chain so the audit can verify the deposit was made to the correct escrow
   * instance and prevent cross-escrow claims by a malicious escrow).
   */
  escrowId: string | undefined

  constructor(args: TBC20ConstructorParams) {
    super({ withdrawn: [], escrowId: undefined, ...args })
  }

  /**
   * Moves tokens from the caller's balance into an escrow.
   *
   * This is the only public method that decreases `this.amount` as part of an
   * escrow deposit flow. The escrow identifier is recorded on-chain so the
   * later audit can associate this deposit with the correct escrow instance.
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
   *
   * The `withdrawn` array prevents claiming the same revision multiple times.
   */
  async withdraw(rev: string) {
    const { _id, _root } = this
    if (this.withdrawn.includes(rev)) throw new Error('Cannot withdraw multiple times')
    if (!(await TBC777M.isValid(rev, _root))) throw new Error('Escrow balance too low')

    this.withdrawn.push(rev)
    const withdraw = await TBC777M.computeWithdraw(rev, _id, _root)
    const finalWithdraw = await TBC777M.computeFinalWithdraw(rev, _id, _root)
    this.amount += withdraw + finalWithdraw
  }

  /**
   * Returns the amount this specific token instance (`_id`) is allowed to
   * withdraw according to the escrow's `withdraws` list at the given revision.
   * Only matching entries for the token’s root are summed.
   */
  static async computeWithdraw(rev: string, _id: string, _root: string): Promise<bigint> {
    const { withdraws } = await computer.sync<typeof Escrow>(rev)
    return withdraws.reduce(
      (total, [root, id, amount]) => (root === _root && id === _id ? total + amount : total),
      0n,
    )
  }

  /**
   * Returns the amount this specific token instance (`_id`) is allowed to
   * withdraw according to the escrow's `finalWithdraws` list. The amount is
   * only returned if the supplied `rev` is the final (last) revision of the
   * escrow (checked via `computer.last(rev)`); otherwise returns `0n`. Only
   * matching entries for the token’s root and id are summed. Intended for
   * one-time final payouts (e.g. winner-takes-all).
   */
  static async computeFinalWithdraw(rev: string, _id: string, _root: string): Promise<bigint> {
    if ((await computer.last(rev)) !== rev) return 0n

    const { finalWithdraws } = await computer.sync<typeof Escrow>(rev)
    return finalWithdraws.reduce(
      (total, [root, id, amount]) => (root === _root && id === _id ? total + amount : total),
      0n,
    )
  }

  /**
   * Performs the no-inflation invariant check.
   *
   * Walks the complete linear revision history ("prev-chain") of the escrow
   * starting from `rev`, then compares total actual deposits against total
   * claimed withdrawals for this token's `_root`.
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
    const finalWithdraws = await TBC777M.computeFinalWithdraws(states, root)

    return deposits - (withdraws + finalWithdraws) >= 0
  }

  /**
   * Sums the *actual* deposited amounts for a given token lineage (`root`)
   * across all escrow states.
   *
   * `states[0]._id` is used as the canonical escrow identifier. For each
   * recorded deposit revision we load the TBC777M state and compute the precise
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
    if (token._root !== root) return 0n

    const nextRev = await computer.next(token._rev)
    const nextToken = await computer.sync<typeof TBC777M>(nextRev!)
    if (nextToken.escrowId !== escrowId) return 0n

    return token.amount - nextToken.amount
  }

  /**
   * Sums every withdrawal amount the escrow has ever recorded across all of its
   * historical states for the given root. This is the "claimed" side of the
   * audit.
   */
  static async computeWithdraws(states: Escrow[], root: string): Promise<bigint> {
    let total = 0n
    for (const state of states) {
      const amounts = state.withdraws.filter(([r]) => r === root).map(([, , amt]) => amt)
      total += amounts.reduce((prev, amt) => prev + amt, 0n)
    }
    return total
  }

  /**
   * Sums finalWithdraws from the *first* state in the chain (the revision
   * passed to `withdraw`). This is intentionally conservative: even if the
   * supplied revision is not yet the final revision, the audit will still count
   * these amounts. (The runtime `computeFinalWithdraw` additionally checks
   * `computer.last(rev)` before actually paying.)
   */
  static async computeFinalWithdraws(states: Escrow[], root: string): Promise<bigint> {
    if (states.length === 0) return 0n
    const [finalState] = states
    const amounts = finalState.finalWithdraws.filter(([r]) => r === root).map(([, , amt]) => amt)
    return amounts.reduce((prev, amt) => prev + amt, 0n)
  }
}
