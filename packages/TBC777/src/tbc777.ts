/**
 * TBC777 - Inflation-proof TBC20 token for arbitrary Escrow contracts
 *
 * Any TBC777 token can be safely deposited into *any* smart contract (even one
 * that does not inherit from the provided `Escrow` convenience base) that
 * exposes the public shape `{ claimable: [string, bigint][], status: string }`.
 *
 * The TBC777 contract itself — not the escrow — is solely responsible for
 * guaranteeing that **no inflation is ever possible**, no matter how the escrow
 * is implemented, even if the escrow is malicious or contains bugs.
 *
 * Inflation is impossible; however, a buggy or malicious escrow may still fail
 * to release tokens (the token contract cannot fix escrow logic, only prevent
 * over-issuance).
 *
 * The no-inflation invariant is enforced entirely inside TBC777:
 *
 * - `deposit(escrow: string, amount: bigint)` is the only public method that
 *   moves tokens into an escrow. It records the escrow identifier and reduces
 *   the token's balance by the deposited amount.
 *
 * - `claim(rev: string)` is the only place where `this.amount` can ever
 *   increase after a deposit. Before crediting any tokens it performs an
 *   on-chain audit of the escrow's linear revision history (the "prev-chain")
 *   using the trusted inner-computer primitives (`computer.sync` and
 *   `computer.prev`).
 *
 * The audit guarantees the following on the linear revision history (where
 * `_root` = root revision of this TBC20 token lineage and `this._rev` = the
 * specific deposit revision):
 *
 *   1. The supplied `rev` is the *first* revision in the prev-chain that
 *      reaches `status === 'final'` (no earlier finalization exists). Later
 *      revisions may also be marked 'final', but claiming is intentionally
 *      restricted to the first final state to prevent repeated claims /
 *      double-spending.
 *
 *   2. The sum of all `claimable` amounts published in that first final state
 *      never exceeds the sum of amounts that were verifiably removed from this
 *      exact token lineage (`_root`) when they entered the escrow.
 *
 * Only the portion of `claimable` entries that reference the specific deposit
 * revision (`this._rev`) is actually credited back to the token.
 *
 * Pseudo-code of the on-chain audit performed inside `claim`:
 *
 *   ```ts
 *   let cur = computer.sync(rev)
 *   while (cur && cur.status !== 'final') cur = computer.prev(cur)
 *   // assert cur is the *first* final state
 *   // assert sum(claimable for this._root) <= deposited for this lineage
 *   ```
 *
 * Note: The design currently assumes that every entry in `claimable` refers to
 * a deposit from the *same* token lineage (same `_root`). Deposits from
 * unrelated TBC777 tokens (or mixed-lineage escrows) will cause the claim to
 * fail, but inflation is still impossible.
 */

import { Computer } from '@bitcoin-computer/lib'
import { TBC20, type TBC20ConstructorParams } from './tbc20.js'

declare global {
  const computer: Computer
}

export {}

/**
 * Minimal interface that *any* escrow contract must satisfy for TBC777
 * compatibility.
 *
 * The TBC777 `claim` method performs an on-chain audit against any contract
 * exposing this exact public shape. No inheritance from `Escrow` is required.
 */
export abstract class Escrow extends Contract {
  claimable: [string, bigint][]
  status: string

  constructor() {
    super()
  }
}

/**
 * TBC777 - Inflation-proof TBC20 token.
 *
 * Extends the base TBC20 with secure `deposit`/`claim` mechanics that use the
 * inner-computer (`computer.sync` + `computer.prev`) to enforce a strict
 * no-inflation invariant, even when the escrow is completely untrusted.
 */
export class TBC777 extends TBC20 {
  escrow?: string

  constructor(args: TBC20ConstructorParams) {
    super(args)
  }

  /**
   * Deposits tokens into an escrow contract.
   *
   * This is the *only* public method that moves tokens out of the TBC777
   * contract. It records the escrow identifier and reduces the token balance
   * accordingly. The token remains locked until a successful `claim`.
   */
  deposit(escrow: string, deposit: bigint) {
    if (deposit <= 0n) throw new Error('Deposit amount must be positive')
    if (this.amount < deposit) throw new Error('Insufficient balance for deposit')
    if (this.escrow) throw new Error('Token already in escrow')

    this.escrow = escrow
    this.amount -= deposit
  }

  /**
   * Claims tokens back from a finalized escrow.
   *
   * This is the *only* place where `this.amount` can ever increase after a
   * deposit. Before crediting any tokens, it performs a complete on-chain audit
   * of the escrow's linear revision history using the trusted inner-computer
   * primitives.
   *
   * Security guarantees (enforced on-chain):
   *   1. The supplied `rev` is the *first* revision that reaches `status ===
   *      'final'`. Prevents double-claiming if the escrow finalizes again
   *      later.
   *   2. The total `claimable` amounts published in that first final state
   *      never exceed the amounts that were verifiably deposited from this
   *      exact token lineage (`_root`). This is what makes inflation
   *      impossible.
   *
   * Only the slice of `claimable` entries that reference *this* deposit
   * revision (`this._rev`) is credited back to the caller.
   */
  async claim(rev: string) {
    if (!this.escrow) throw new Error('Token not in escrow')

    // Load the claimed revision (must already be in final state)
    const finalState = await computer.sync<typeof Escrow>(rev)
    if (finalState.status !== 'final') throw new Error('Escrow is not in final state')

    // Walk backwards through the entire prev-chain to confirm this is the
    // *first* finalization. If any earlier revision was already final, the
    // escrow has been finalized multiple times → reject to prevent
    // double-spending.
    let currentRev = rev
    while (true) {
      const prevRev = await computer.prev(currentRev)
      if (!prevRev) break

      const prevState = await computer.sync<typeof Escrow>(prevRev)
      if (prevState.status === 'final')
        throw new Error('Escrow was already finalized in a previous state')

      currentRev = prevRev
    }

    const escrowId = finalState._id
    const { claimable } = finalState

    // Collect all unique deposit revisions referenced by the escrow's claimable
    // list
    const uniqueDepositRevs = [...new Set(claimable.map((claim) => claim[0]))]

    // For each referenced deposit revision, compute the *actual* deposited
    // amount by inspecting the token's own revision history (delta between
    // deposit state and its immediate predecessor). This is the source-of-truth
    // for deposited funds.
    const depositAmounts = await Promise.all(
      uniqueDepositRevs.map((depositRev: string) =>
        TBC777.computeDeposit(depositRev, this._root, escrowId),
      ),
    )
    const depositAmount = depositAmounts.reduce((sum, amt) => sum + amt, 0n)

    const claimableAmount = finalState.claimable.reduce((sum, [, amt]) => sum + amt, 0n)

    // Core security invariant: total claimable must never exceed what was
    // actually deposited from this token lineage. This check makes inflation
    // impossible no matter what the escrow contract does.
    if (claimableAmount > depositAmount) throw new Error('Escrow created tokens')

    // Credit back only the portion of the claimable list that belongs to *this*
    // specific deposit revision (prevents claiming someone else's deposit).
    const myClaim = finalState.claimable
      .filter(([rev]) => rev === this._rev)
      .reduce((sum, [, amt]) => sum + amt, 0n)

    this.amount += myClaim
    this.escrow = undefined
  }

  /**
   * Private helper used **only inside the on-chain `claim` audit**.
   *
   * **This method runs inside the inner-computer context** (the `computer`
   * global injected by the Bitcoin Computer runtime). It must **never** be
   * called from off-chain JavaScript — tests temporarily override the global
   * `computer` for this purpose.
   *
   * It loads the deposit state and its immediate predecessor, then returns the
   * delta (`prev.amount - deposit.amount`). This value is guaranteed to be the
   * exact amount that left the token contract during that deposit call.
   */
  private static async computeDeposit(
    depositRev: string,
    root: string,
    escrowId: string,
  ): Promise<bigint> {
    const deposit = await computer.sync<typeof TBC777>(depositRev)
    if (deposit.escrow !== escrowId || deposit._root !== root) throw Error('Found invalid deposit')

    const prevRev = await computer.prev(depositRev)
    if (!prevRev) throw Error('Something went wrong')
    const prev = await computer.sync<typeof TBC777>(prevRev)

    const delta = prev.amount - deposit.amount
    if (delta < 0n) throw new Error('Something went wrong')

    return delta
  }
}
