/**
 * TBC777P - Programmable inflation-proof TBC20 token for arbitrary Escrow
 * contracts using the inner computer.
 *
 * TBC777P tokens can be safely deposited into *any* smart contract that
 * exposes the public properties `depositRevs: string[]` and
 * `amountByWithdrawId: [string, bigint][]` (even if it does not inherit from
 * the provided `Escrow` convenience base class).
 *
 * This design achieves two key goals simultaneously:
 *
 * - **No inflation is ever possible**, even if the escrow contract is malicious
 *   or buggy. The TBC777P token contract itself — not the escrow — is solely
 *   responsible for enforcing this invariant using on-chain audits.
 *
 * - The escrow contract can implement *any* computable distribution logic
 *   (for example, it could encode the rules of a chess game and guarantee that
 *   the winner receives both deposits).
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
 *   “prev-chain”) using the trusted inner-computer primitives
 *   (`computer.sync` and `computer.prev`).
 *
 * The audit walks the complete prev-chain from the provided `withdrawRev`,
 * then:
 *
 * - Computes total deposits for this token’s `_root` by collecting all
 *   `depositRevs` and calculating the actual amount moved in each deposit
 *   (via the difference between a token’s `prev` state and current state).
 *
 * - Computes total withdrawals claimed across all historical states
 *   (sum of every `amountByWithdrawId` entry).
 *
 * Withdrawal is only permitted if `totalDeposits >= totalWithdraws`.
 *
 * Note: The current design assumes that every entry in `amountByWithdrawId`
 * refers to a deposit from the *same* token lineage (same `_root`). Deposits
 * from unrelated TBC777P tokens (or mixed-lineage escrows) will cause the
 * withdraw to fail, but inflation is still impossible. A buggy or malicious
 * escrow may still fail to release tokens (the token contract cannot fix escrow
 * logic, only prevent over-issuance).
 */

import { TBC20, type TBC20ConstructorParams } from './tbc20.js'

/**
 * Minimal interface that any escrow contract must satisfy to be compatible
 * with TBC777P. The token contract never trusts the escrow's internal logic —
 * it only reads these two public arrays during the on-chain audit.
 *
 * Any contract (even one that does not extend this base class) can be used
 * as long as it exposes `depositRevs` and `amountByWithdrawId`.
 */
export abstract class Escrow extends Contract {
  /** List of all TBC777P deposit revision IDs accepted by this escrow */
  depositRevs: string[]

  /** New claims added in *this revision only* (non-cumulative). */
  amountByWithdrawId: [string, bigint][]
}

export class TBC777P extends TBC20 {
  /** Tracks every withdraw revision that has already been processed (prevents double-spends) */
  withdrawRevs: string[]

  /** The escrow that currently holds the deposited portion of this token */
  escrowId: string | undefined

  constructor(args: TBC20ConstructorParams) {
    super({ withdrawRevs: [], escrowId: undefined, ...args })
  }

  /**
   * Moves tokens from the caller's balance into an escrow.
   *
   * This is the *only* public method that can ever decrease `this.amount`.
   * The escrow identifier is recorded on-chain so the later audit can
   * associate this deposit with the correct escrow instance.
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
   * Before any tokens are credited, the escrow's entire revision history
   * is audited on-chain using the inner computer. This guarantees that
   * the escrow has never released more tokens than were deposited for
   * this exact token lineage (`_root`).
   */
  async withdraw(withdrawRev: string) {
    if (this.withdrawRevs.includes(withdrawRev)) throw new Error('Cannot withdraw multiple times')

    if (!(await TBC777P.isValidAtRev(withdrawRev, this._root)))
      throw new Error('Escrow balance too low')

    this.amount += await TBC777P.computeMyWithdraw(withdrawRev, this._id)
    this.withdrawRevs.push(withdrawRev)
  }

  /**
   * Returns the amount this specific token instance (`_id`) is allowed to
   * withdraw according to the escrow's `amountByWithdrawId` list at the
   * given revision. Only matching entries are summed.
   */
  static async computeMyWithdraw(withdrawRev: string, myId: string): Promise<bigint> {
    const { amountByWithdrawId } = await computer.sync<typeof Escrow>(withdrawRev)
    const myAmountByWithdrawId = amountByWithdrawId.filter(([id]) => id === myId)
    return myAmountByWithdrawId.reduce((prev, curr) => prev + curr[1], 0n)
  }

  /**
   * Performs the no-inflation invariant check.
   *
   * Walks the complete linear revision history ("prev-chain") of the escrow
   * starting from `withdrawRev`, then compares total actual deposits against
   * total claimed withdrawals for this token's `_root`.
   */
  static async isValidAtRev(withdrawRev: string, myRoot: string): Promise<boolean> {
    const allStates: Escrow[] = []
    let currentRev = withdrawRev

    // Collect every historical state. Deposits and withdrawals accumulate
    // across the entire lifetime of the escrow, so the audit must see them all.
    while (true) {
      allStates.push(await computer.sync<typeof Escrow>(currentRev))
      const prevRev = await computer.prev(currentRev)
      if (!prevRev) break
      currentRev = prevRev
    }

    const totalDeposits = await TBC777P.computeDeposits(allStates, myRoot)
    const totalWithdraws = await TBC777P.computeWithdraws(allStates)

    return totalDeposits - totalWithdraws >= 0
  }

  /**
   * Sums the *actual* deposited amounts for a given token lineage (`root`)
   * across all escrow states.
   *
   * `allStates[0]._id` is used as the canonical escrow identifier.
   * For each recorded deposit revision we load the TBC777P state and compute
   * the precise transfer amount via the pre/post-deposit balance delta.
   */
  static async computeDeposits(allStates: Escrow[], root: string): Promise<bigint> {
    if (allStates.length === 0) return 0n

    const escrowId = allStates[0]._id
    const allDepositRevs = new Set(
      allStates.reduce((prev, curr) => prev.concat(curr.depositRevs), []),
    )

    const deposits = await Promise.all(
      [...allDepositRevs].map((rev: string) => computer.sync<typeof TBC777P>(rev)),
    )

    const depositAmounts = await Promise.all(
      deposits.map((deposit) => TBC777P.computeDeposit(deposit as TBC777P, escrowId, root)),
    )

    return depositAmounts.reduce((prev, curr) => curr + prev, 0n)
  }

  /**
   * Computes the exact number of tokens transferred into the escrow by this
   * particular deposit transaction.
   *
   * Uses `computer.prev` to obtain the token state *before* the deposit,
   * then subtracts the post-deposit balance. This value is independent of
   * any data supplied by the escrow.
   *
   * A malicious escrow cannot claim a deposit that was made to a
   * different escrow: we only credit the deposit if the *historical*
   * token state at deposit time recorded `token.escrowId === escrowId`.
   */
  static async computeDeposit(token: TBC777P, escrowId: string, root: string): Promise<bigint> {
    if (token.escrowId !== escrowId) return 0n
    if (token._root !== root) return 0n

    const prevRev = await computer.prev(token._rev)
    const prevToken = await computer.sync<typeof TBC777P>(prevRev)

    return prevToken.amount - token.amount
  }

  /**
   * Sums every withdrawal amount the escrow has ever recorded across
   * all of its historical states. This is the "claimed" side of the audit.
   */
  static async computeWithdraws(allStates: Escrow[]): Promise<bigint> {
    let total = 0n
    for (const state of allStates) {
      total += state.amountByWithdrawId.reduce((prev, curr) => prev + curr[1], 0n)
    }
    return total
  }
}
