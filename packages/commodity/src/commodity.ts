/**
 * Digital Commodity Standard on Bitcoin Computer
 *
 * Commodity is a functional utility standard for digital-commodity issuance on
 * the Bitcoin Computer. It carries no governance rights, no claim on protocol
 * or interface revenue, and no expectation of profits from the efforts of BCDB
 * or others. Supply integrity is enforced by the deterministic min-revision
 * selection rule, the immutable `_root` genuineness check, and module-level
 * fungibility (`mod` / `root`).
 *
 * Issuance is bound 1:1 to host-chain blocks (LTC, BTC, …). At most one subsidy
 * is issued per host block. The unique winner for height H is the genuine mint
 * whose creation revision is the lexicographically smallest among all smart
 * objects of this module created inside that block.
 *
 * Only pure mints (constructor called with non-empty salt) may claim. Transfer
 * and split children are permanently ineligible, even at creation.
 *
 * The sole “work” is grinding a salt until the mint’s creation produces a
 * competitively small revision, then obtaining inclusion of that transaction in
 * a host block. claim() awards the subsidy only when this object holds the
 * absolute minimum creation revision of a genuine mint root.
 *
 * Design points
 * - Issuance inherits the host’s difficulty adjustment, heaviest-chain rule,
 *   finality, and sequential linking of mints.
 * - Canonical selection uses only cheap, deterministic InnerComputer queries
 *   (txIdToBlockHeight, decode, getOTXOs). No candidate objects are ever
 *   materialised or synced; claim() is history-independent and identical for
 *   every validator.
 * - Genuineness is enforced by the framework’s immutable `_root`.
 *   isGenuine() checks that the mint root carries a non-empty salt.
 * - Fungibility is the deployed module specifier, stored as `mod` and
 *   exposed as `root`. `claim()` stamps `mod` from the creation tx; every
 *   genuine mint of the same module is one token.
 * - claim() may succeed only on a mint’s creation revision (_rev === _root).
 *   Any subsequent update spends that UTXO; children are permanently ineligible
 *   because their _root points to the original mint.
 *
 * Host-miner inclusion Host miners decide which mint creations are included in
 * a block and can therefore favour their own. Competitive minting activity can
 * generate additional fee demand that helps secure the host chain. Ordinary
 * transfers and splits have no MEV surface with respect to the subsidy.
 *
 * Sticky subsidies Once claim() has succeeded the credited amount is not
 * revoked by a later reorg that would have selected a different winner
 * (provided the claimed object itself is not orphaned). Clients may wait for
 * extra host confirmations before claiming (analogous to coinbase maturity).
 *
 * Mining / claiming workflow
 * 1. Off-chain: grind a salt for a fresh mint until the creation revision is
 *    competitively small.
 * 2. Broadcast the mint transaction.
 * 3. Once confirmed, call await mint.claim() while still at the creation
 *    revision (_rev === _root). Succeeds only if it is the canonical min for
 *    its host block.
 *
 * Commodity is experimental open-source software. Participation involves
 * material risks, including smart-contract vulnerabilities, user or wallet
 * errors that may result in permanent loss of funds, blockchain
 * reorganizations, and regulatory change. BCDB Inc. does not endorse any
 * particular use of Commodity. Creators and participants are solely responsible
 * for compliance with the laws of their jurisdiction, including securities laws
 * (Howey analysis), sanctions, tax, and any applicable state or local rules. Do
 * your own research. Only use funds you can afford to lose.
 *
 * The Protocol remains fully accessible through multiple independent methods,
 * including the open @bitcoin-computer libraries together with a local node,
 * direct object ID navigation, raw transactions, and community or self-hosted
 * renderers.
 *
 * @see https://docs.bitcoincomputer.io
 * @see
 * https://github.com/bitcoin-computer/monorepo/blob/staging/packages/docs-2/docs/intro.md
 * @see
 * https://medium.com/@clemensley/how-to-build-a-token-on-bitcoin-in-javascript-c2439cf1b273
 */

import type { TBC20 } from '@bitcoin-computer/TBC20'
import { TBC777, TBC777Params } from '@bitcoin-computer/TBC777'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T

/**
 * Constructor arguments accepted by Commodity.
 *
 * Aligns with TBC777 / TBC20 (single params object). Typical call sites:
 * - Mint: `new Commodity({ to, salt, amount: 0n })`
 * - Transfer child: `new Commodity({ to, amount, salt: '', mod })`
 *
 * `amount` and `name` are optional at the call site (default `0n` / `''`).
 * `mod` is stamped by `claim()` on genuine mints and copied onto split children.
 * Other fields match TBC777Params (including optional `symbol`, `remoteRoot`, …).
 */
export type CommodityConstructorParams = {
  to: string
  /** Token amount. Default `0n` (must be `0n` for genuine mints). */
  amount?: bigint
  /** Optional display name. Default `''`. */
  name?: string
  /** Free-form grinding salt; non-empty marks a genuine mint root. Default `''`. */
  salt?: string
  /** Module specifier. Set by `claim()`; copied onto transfer children. */
  mod?: string
  symbol?: string
  remoteRoot?: TBC777Params['remoteRoot']
  withdrawn?: TBC777Params['withdrawn']
  finalWithdrawn?: TBC777Params['finalWithdrawn']
  escrow?: TBC777Params['escrow']
  [s: string]: unknown
}

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
 * Canonical min-revision digital commodity.
 *
 * Commodity is a functional utility standard for digital-commodity issuance. It
 * carries no governance rights, no claim on protocol or interface revenue, and
 * no expectation of profits from the efforts of BCDB or others. Supply
 * integrity is enforced by the min-revision selection rule, the `_root`
 * genuineness check, and module-level fungibility (`mod` / `root`).
 *
 * One subsidy is issued for every host-chain block that contains a successful
 * mint. The winner is the genuine mint whose creation revision is the
 * lexicographically smallest module creation in that block. claim() performs
 * the selection and credits only the winner.
 *
 * The Bitcoin Computer framework guarantees every transfer/split child inherits
 * the same `_root` as the original mint. Consequently isGenuine() only needs to
 * verify that the root itself is a genuine mint (non-empty salt). Fungibility
 * across mints of the same module is `mod` (the module specifier), stamped by
 * `claim()` and exposed as `root`.
 *
 * Eligibility: claim() succeeds only while the object is still at its mint
 * creation revision (_rev === _root). After any mutation that UTXO is spent.
 * Transfer/split children are permanently ineligible.
 *
 * Extends TBC777 so modules can reuse escrow-capable token machinery. Deployed
 * modules must export the full inheritance chain (TBC20, EscrowAuditor, TBC777,
 * Commodity) — see the package tests for the canonical deploy helper.
 */
export class Commodity extends TBC777 {
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
   * Module specifier of this Commodity. Empty until a successful `claim()`.
   * Split children copy it from the parent. `get root()` returns this.
   */
  mod!: string

  /**
   * Two construction paths (via a single params object, same shape as TBC777):
   *
   * 1. Mining / minting (salt non-empty):
   *    - amount must be 0n
   *    - creates a new mint root (amount = 0n)
   *    - `mod` is forced to `''`; `claim()` stamps it from the creation tx
   *    - this object is the only kind eligible to claim a subsidy
   *
   * 2. Transfer / split (salt === ''):
   *    - amount taken from the parent
   *    - child inherits the parent's `_root` (framework guarantee)
   *    - `mod` is copied from the parent so the child stays the same token
   *    - permanently ineligible to claim (its `_rev` never equals its `_root`)
   *
   * Transfer factories call `new Ctor({ to, amount, salt: '', mod, ... })`.
   */
  constructor(params: CommodityConstructorParams) {
    const { to, salt = '', amount = 0n, name = '', mod: modParam = '', ...rest } = params

    if (salt) {
      if (amount !== 0n) throw new Error('Mined Commodity must start with amount === 0n')
      // Ignore caller-supplied mod; claim() is the only writer for mints.
      super({ to, amount, salt, name, ...rest, mod: '' })
    } else {
      if (amount < 0n) throw new Error('Amount cannot be negative')
      super({ to, amount, salt, name, ...rest, mod: modParam })
    }
  }

  /**
   * Fungibility identifier: the module specifier, or `''` before claim.
   * All claimed genuine mints of the same module share this `root`.
   */
  get root(): string {
    return this.mod
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
    const root = this._root === this._rev ? this : await computer.sync<typeof Commodity>(this._root)
    return !!root.salt
  }

  /**
   * Split factory used by transfer(). Always builds a non-mint child (salt '')
   * and copies `mod` so the child stays the same fungible token. Drops
   * escrow bookkeeping so recipients do not inherit claim history.
   */
  protected _createTransferToken(to: string, amount: bigint): this {
    const Ctor = this.constructor as Constructor<this>
    return new Ctor({
      to,
      amount,
      salt: '',
      mod: this.mod,
      name: this.name ?? '',
      symbol: this.symbol ?? '',
    })
  }

  /**
   * Same module (non-empty `mod`, stamped by claim) and both genuine.
   * Fakes can pass a `mod` through the child constructor path; isGenuine()
   * rejects those.
   */
  protected async isFungibleWith(other: TBC20): Promise<boolean> {
    const o = other as Commodity
    if (!this.mod || this.mod !== o.mod) return false
    return (await this.isGenuine()) && (await o.isGenuine())
  }

  async isEqualTo(other: TBC777): Promise<boolean> {
    return this.isFungibleWith(other)
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
   * 5. Query every object revision of that module that appears in the same
   *    block (cheap getOTXOs – no object materialisation). Both genuine mints
   *    and transfer/split children are returned. Spent creations are included
   *    so claim remains history-stable under re-evaluation (sync after claim).
   * 6. Select the lexicographically smallest creation revision.
   * 7. If it equals this object’s _id (and therefore this is a mint that holds
   *    the absolute minimum), set amount to the subsidy (via getSubsidy);
   *    otherwise throw.
   * 8. Confirm lineage authenticity with the cheap isGenuine() check (only the
   *    short root is synced).
   *
   * Because getOTXOs / decode / txIdToBlockHeight are pure functions of the
   * immutable host-chain state, every honest validator reaches the identical
   * conclusion. No deep histories are ever replayed.
   *
   * Important: use getOTXOs (all object TXOs), not getOUTXOs (unspent only).
   * claim() spends the creation UTXO; if selection used getOUTXOs, replaying
   * claim during sync would see an empty candidate set, and a same-block loser
   * could claim after the winner spent their creation.
   *
   * If the absolute minimum creation revision in the block belongs to a
   * transfer or split child, no mint can claim and the subsidy for that host
   * block is permanently lost. In practice this is negligible: there is no
   * economic incentive to grind a non-mint (it can never claim), and once the
   * token has any utility modest grinding by real minters reliably produces the
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

    // Retrieve all object revisions of this module that appeared in the host
    // block (spent or unspent). Pure index query – no objects materialised.
    // Must be getOTXOs, not getOUTXOs: after a successful claim the creation is
    // spent, and validators re-evaluate claim() when syncing the claimed rev.
    const candidateRevs = await computer.getOTXOs({ mod, blockHeight })

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

    this.mod = mod
    this.amount = Commodity.getSubsidy(blockHeight)
  }

  /**
   * Subsidy schedule modelled on Bitcoin’s: 50 coins that halve every 210 000
   * host-chain blocks. Returns 0n after 64 halvings. Units are the host chain’s
   * base unit (satoshis / litoshis / …).
   *
   * The schedule is fully public and independently checkable; it forms part of
   * the deterministic issuance parameters of this utility standard.
   */
  static getSubsidy(hostBlockHeight: number): bigint {
    if (hostBlockHeight < 0) return 0n
    const halvings = Math.floor(hostBlockHeight / 210000)
    if (halvings >= 64) return 0n
    const COIN = 100_000_000n
    return (50n * COIN) / (1n << BigInt(halvings))
  }
}
