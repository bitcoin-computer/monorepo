/**
 * POW.TS – Canonical Min-Revision Meta-Token on Bitcoin Computer
 *
 * Issuance is bound 1:1 to host-chain blocks (LTC, BTC, …). At most one
 * meta-block / subsidy is issued per host block. The unique winner for height H
 * is the genuine mint whose creation revision is the lexicographically smallest
 * among all smart objects of this module created inside that block.
 *
 * Only pure mints (constructor called with non-empty salt) may claim. Transfer
 * and split children are permanently ineligible, even at creation.
 *
 * The sole “work” is grinding a salt until the mint’s creation produces a
 * competitively small revision, then getting that transaction into a host
 * block. claim() awards the subsidy only when this object holds the absolute
 * minimum creation revision of a genuine mint root.
 *
 * Design points
 * - Issuance inherits the host’s difficulty adjustment, heaviest-chain rule,
 *   finality, and sequential linking of mints.
 * - Canonical selection uses only cheap, deterministic InnerComputer queries
 *   (txIdToBlockHeight, decode, getOUTXOs). No candidate objects are ever
 *   materialised or synced; claim() is history-independent and identical for
 *   every validator.
 * - Lineage authenticity is enforced by the framework’s immutable _root.
 *   isGenuine() checks that the root is a genuine mint (non-empty salt). Only
 *   objects belonging to such a lineage may claim.
 * - claim() may succeed only on a mint’s creation revision (_rev === _root).
 *   Any subsequent update spends that UTXO; children are permanently ineligible
 *   because their _root points to the original mint.
 *
 * Host-miner advantage (intentional and desirable) Host miners control which
 * mint creations are included and can ensure their own is the smallest (or
 * censor competitors). This is a feature: when the meta-token is valuable it
 * generates extra fee/inclusion revenue that helps secure the host chain.
 * Ordinary transfers, splits and exchange activity have no MEV surface with
 * respect to the subsidy.
 *
 * Reorg note After a successful claim() the subsidy is sticky. A later deep
 * reorg that would have made a different creation canonical (without orphaning
 * this object) does not revoke the credited amount. Clients may wait for extra
 * host confirmations before claiming (analogous to coinbase maturity).
 *
 * Mining / claiming workflow
 * 1. Off-chain: grind a salt for a fresh mint until the creation revision is
 *    competitively small.
 * 2. Broadcast the mint transaction.
 * 3. Once confirmed, call await mint.claim() while still at the creation
 *    revision (_rev === _root). Succeeds only if it is the canonical min for
 *    its host block.
 *
 * @see https://docs.bitcoincomputer.io
 * @see
 * https://github.com/bitcoin-computer/monorepo/blob/staging/packages/docs-2/docs/intro.md
 * @see
 * https://medium.com/@clemensley/how-to-build-a-token-on-bitcoin-in-javascript-c2439cf1b273
 */

import { Contract } from '@bitcoin-computer/lib'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T

/**
 * Chain-specific configuration defaults.
 */
export const config = {
  DEFAULT_CHAIN: 'LTC',
  DEFAULT_NETWORK: 'regtest',
  DEFAULT_URL: 'http://localhost:1031',
  FAUCET_AMOUNT: Number(process.env.FAUCET_AMOUNT) || 100000000,
}

/**
 * Canonical min-revision meta-token.
 *
 * One subsidy is issued for every host-chain block that contains a successful
 * mint. The winner is the genuine mint whose creation revision is the
 * lexicographically smallest module creation in that block. claim() performs
 * the selection and credits only the winner.
 *
 * The Bitcoin Computer framework guarantees every transfer/split child inherits
 * the same _root as the original mint. Consequently isGenuine() only needs to
 * verify that the root itself is a genuine mint (non-empty salt).
 *
 * Eligibility: claim() succeeds only while the object is still at its mint
 * creation revision (_rev === _root). After any mutation that UTXO is spent.
 * Transfer/split children are permanently ineligible.
 */
export class Pow extends Contract {
  amount!: bigint

  /**
   * Free-form grinding salt. Miners vary this string (or any free field) until
   * the resulting mint obtains a competitively small creation revision. Stored
   * for transparency; never cryptographically checked.
   *
   * Only objects created with a non-empty salt are genuine mints for the
   * purpose of isGenuine() / lineage authenticity. Transfers and splits
   * deliberately pass the empty string so that only original mint roots
   * authenticate a lineage.
   */
  salt!: string

  /**
   * Two constructor paths:
   *
   * 1. Mining / minting (salt non-empty):
   *    - amount must be 0n
   *    - creates a new mint root (amount = 0n)
   *    - salt is a pure grinding parameter that influences the creation
   *      revision of the smart object
   *    - this object becomes the root of a genuine lineage and is the only kind
   *      eligible to claim a subsidy
   *
   * 2. Transfer / split (salt === ''):
   *    - amount taken from the parent
   *    - child inherits the parent's _root (framework guarantee)
   *    - valid token of the same lineage but permanently ineligible to claim
   *      (its _rev never equals its _root)
   */
  constructor(to: string, salt: string = '', amount: bigint = 0n) {
    if (salt) {
      if (amount !== 0n) throw new Error('Mined PoW must start with amount === 0n')
    } else {
      if (amount < 0n) throw new Error('Amount cannot be negative')
    }

    super({ _owners: [to], amount, salt })
  }

  /**
   * Returns true iff this object is a legitimate descendant of a genuine mint.
   * Walks to the immutable _root and verifies that the root carries a non-empty
   * salt. Because the framework forces every child to inherit its parent's
   * _root, this single check authenticates the whole lineage.
   *
   * Syncs only the short root mint; never called on the candidate list inside
   * claim().
   */
  async isGenuine(): Promise<boolean> {
    const root = this._root === this._rev ? this : await computer.sync<typeof Pow>(this._root)
    return !!root.salt
  }

  /**
   * Transfer ownership of the entire balance, or split off a portion.
   *
   * - transfer(to)          – re-assign the whole amount to a new owner
   * - transfer(to, amount)  – create a new Pow of the given amount owned by
   *                           `to` and deduct that amount from this object. The
   *                           new object inherits the same _root, so it remains
   *                           a valid token of the same lineage.
   *
   * After this call the original object’s _rev advances, so it can no longer
   * call claim() (only a mint’s creation revision is eligible). The newly
   * created child is also ineligible for any future claim.
   */
  transfer(to: string, amount?: bigint): Pow | undefined {
    if (typeof amount === 'undefined') {
      this._owners = [to]
      return undefined
    }
    if (this.amount >= amount) {
      this.amount -= amount
      const Ctor = this.constructor as Constructor<this>
      return new Ctor(to, '', amount)
    }
    throw new Error('Insufficient funds')
  }

  /**
   * Destroy this token by setting its amount to zero. Advances _rev, rendering
   * it ineligible for claim().
   */
  burn() {
    this.amount = 0n
  }

  /**
   * Merge is intentionally disabled for this meta-token.
   */
  merge() {
    throw new Error('Merge disabled.')
  }

  /**
   * Claim the block subsidy if and only if this smart object is a genuine mint
   * whose creation revision is the canonical (lexicographically smallest)
   * creation revision of the module in its host block.
   *
   * Eligibility: may be called successfully only while the object is still at
   * its mint creation revision (_rev === _root). After any mutation the
   * creation revision is spent and can never claim. Transfer and split children
   * are permanently ineligible.
   *
   * Algorithm (all steps are deterministic InnerComputer operations that never
   * sync candidate objects):
   *
   * 1. Assert we are still on the mint creation revision (_rev === _root).
   * 2. Recover the creation txid of this object from its _id.
   * 3. Look up the host-chain block height of that txid.
   * 4. Decode the creation transaction to obtain the module identifier.
   * 5. Query every creation revision of that module created in the same block
   *    (cheap getOUTXOs – no object materialisation). Both genuine mints and
   *    transfer/split children are returned.
   * 6. Select the lexicographically smallest creation revision.
   * 7. If it equals this object’s _id (and therefore this is a mint that holds
   *    the absolute minimum), set amount to the subsidy (via getSubsidy);
   *    otherwise throw.
   * 8. Confirm lineage authenticity with the cheap isGenuine() check (only the
   *    short root is synced).
   *
   * Because getOUTXOs / decode / txIdToBlockHeight are pure functions of the
   * immutable host-chain state, every honest validator reaches the identical
   * conclusion. No deep histories are ever replayed.
   *
   * If the absolute minimum creation revision in the block belongs to a
   * transfer or split child, no mint can claim and the subsidy for that host
   * block is permanently lost. In practice this is negligible: there is no
   * economic incentive to grind a non-mint (it can never claim), and once the
   * token has any value modest grinding by real minters reliably produces the
   * absolute minimum. Host miners also have a strong interest in including a
   * genuine winning mint.
   *
   * Note: host miners enjoy an inclusion advantage for new mint creations (see
   * file header). Ordinary transfers have no MEV surface with respect to the
   * subsidy.
   */
  async claim() {
    // Must be called on the mint creation revision itself (_rev === _root).
    // After any mutation the creation revision is spent and can no longer
    // claim. Transfer/split children are permanently ineligible.
    if (this._rev !== this._root)
      throw new Error('claim() can only be called on the mint creation revision of an object')

    // Extract txid robustly (never assumes fixed-length hex prefix).
    const creationTxId = this._id.split(':')[0].toLowerCase()
    const blockHeight = await computer.txIdToBlockHeight(creationTxId)
    const { mod } = await computer.decode(creationTxId)
    if (!mod) throw new Error('Could not recover module from creation tx')

    // Retrieve all creation revisions of this module that appeared in the host
    // block. Pure index query – no objects materialised, no histories replayed.
    // Both genuine mints and transfer/split children are included when
    // determining the absolute minimum.
    const candidateRevs = await computer.getOUTXOs({ mod, blockHeight })

    if (candidateRevs.length === 0)
      throw new Error(`No objects of this module found for block ${blockHeight}`)

    // Lexicographically smallest full revision (txid:vout). String sort is
    // deterministic and sufficient; a numeric-vout comparator can be
    // substituted later if extremely high vouts become common.
    candidateRevs.sort()
    const winnerRev = candidateRevs[0]

    if (this._id !== winnerRev)
      throw new Error(`Object ${this._id} is not canonical for host block ${blockHeight}. `)

    // Cheap lineage check (only the short root mint is ever synced). Prevents a
    // fake root (empty salt) from successfully claiming even if it happens to
    // hold the min revision.
    if (!(await this.isGenuine()))
      throw new Error('Only objects belonging to a genuine mint lineage may claim the subsidy')

    this.amount = Pow.getSubsidy(blockHeight)
  }

  /**
   * Subsidy schedule modelled on Bitcoin’s: 50 coins that halve every 210 000
   * host-chain blocks. Returns 0n after 64 halvings. Units are the host chain’s
   * base unit (satoshis / litoshis / …).
   */
  static getSubsidy(hostBlockHeight: number): bigint {
    if (hostBlockHeight < 0) return 0n
    const halvings = Math.floor(hostBlockHeight / 210000)
    if (halvings >= 64) return 0n
    const COIN = 100_000_000n
    return (50n * COIN) / (1n << BigInt(halvings))
  }
}
