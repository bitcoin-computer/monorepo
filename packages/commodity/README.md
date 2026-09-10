<div align="center">
  <h1>Commodity — Canonical Min-Revision Digital Commodity Standard</h1>
  <p>
    <a href="https://bitcoincomputer.io/">website</a> ·
    <a href="https://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

Commodity implements a fixed subsidy issued for every host-chain block (LTC,
BTC, …). The unique winner of the subsidy for height _H_ is the genuine mint
whose creation revision is the lexicographically smallest among all objects of
this module created in that block.

The standard is intended for digital commodities whose supply should be issued
in lock-step with the security of the underlying chain. Because selection and
eligibility are enforced by pure, deterministic queries against the host chain,
every honest validator reaches the same conclusion without materialising
candidate objects or replaying histories.

## Issuance Design

Commodity is designed for competitive, transparent issuance with the following
mechanical properties:

- No premine and no team or insider allocation.
- Issuance parameters (subsidy schedule, selection rule, eligibility) are fully
  public and independently checkable by anyone using pure host-chain queries.
- The only work is grinding a salt until the resulting creation revision is
  competitively small, then obtaining inclusion in a host-chain block.
- Selection uses only cheap InnerComputer queries (`txIdToBlockHeight`,
  `decode`, `getOTXOs`). No candidate objects are ever synced.

Any third party can confirm that a given object is a genuine mint of a genuine
lineage and that a successful claim credited exactly the scheduled subsidy.

## Utility Positioning

Commodity is a functional utility standard for digital-commodity issuance on the
Bitcoin Computer. It carries no governance rights, no claim on protocol or
interface revenue, and no expectation of profits from the efforts of BCDB or
others. Supply integrity is enforced solely by the deterministic min-revision
selection rule and the immutable `_root` lineage check.

## The Core Guarantee

- At most one successful claim per host block.
- Only a genuine mint (non-empty salt) that is still at its creation revision
  (`_rev === _root`) may claim.
- The winner is selected solely with cheap InnerComputer queries. No candidate
  objects are ever synced.
- Lineage authenticity is checked via the immutable `_root`: `isGenuine()`
  verifies that the root itself carries a non-empty salt. Transfer and split
  children inherit the same `_root` and are therefore valid Commodities of the
  lineage, but they are permanently ineligible to claim.

If the absolute minimum creation revision in a block happens to belong to a
transfer or split child, the subsidy for that host block is permanently lost.
There is no economic incentive to produce such a child, so the practical impact
is negligible once the Commodity has utility.

## Key Properties

- Issuance rate and finality inherited from the host chain.
- Canonical min-revision selection with zero candidate materialisation.
- Genuine-mint lineage enforced by the framework’s immutable `_root`.
- Flat subsidy of `4294967296` units (`2^32`) per host block for `210000`
  blocks (~364.6 days on Litecoin, the reference host), then zero. Total if
  every block is claimed: `901943132160000` units.
- Claimed Commodities remain ordinary fungible objects (transfer, split, burn).
- Inherits the full escrow-capable machinery of TBC777 (programmable deposits,
  audited withdrawals, no-inflation invariant).
- Host miners control inclusion of new mint creations; competitive minting
  activity can increase fee demand on the host chain. Ordinary transfers and
  splits have no MEV surface with respect to the subsidy.
- Subsidies are sticky after a successful claim (deep reorgs do not revoke
  already-credited amounts).
- Fully permissionless: anyone can mint, claim, transfer, or split using the
  open libraries or alternative implementations.

## Public Surface

```typescript
import { TBC777, TBC777Params } from '@bitcoin-computer/TBC777'

export type CommodityConstructorParams = {
  to: string
  /** Token amount. Default `0n` (must be `0n` for genuine mints). */
  amount?: bigint
  /** Optional display name. Default `''`. */
  name?: string
  /** Free-form grinding salt; non-empty marks a genuine mint root. Default `''`. */
  salt?: string
  /** Module specifier. Stamped by `claim()`; copied onto transfer children. */
  mod?: string
  symbol?: string
  remoteRoot?: TBC777Params['remoteRoot']
  // …plus other optional TBC777Params fields
}

/**
 * Canonical min-revision digital commodity.
 *
 * Extends TBC777 so modules can reuse escrow-capable token machinery.
 * Deployed modules must export the full inheritance chain
 * (TBC20, EscrowAuditor, TBC777, Commodity).
 */
export class Commodity extends TBC777 {
  amount!: bigint
  salt!: string
  mod!: string

  /**
   * Two constructor paths (single params object, same style as TBC777 / TBC20):
   * - salt non-empty, amount === 0n  → genuine mint root (only these can claim)
   * - salt === '', amount ≥ 0n       → transfer / split child (inherits `_root`)
   * `claim()` stamps `mod` from the creation tx; `root` returns `mod`.
   */
  constructor(params: CommodityConstructorParams)

  /** Module specifier after claim, else `''`. All claimed mints of this module share this. */
  get root(): string

  /** True iff this object descends from a genuine mint (non-empty salt at `_root`). */
  async isGenuine(): Promise<boolean>

  /**
   * Whole-balance transfer or partial split (classic fungible shape).
   * Advances `_rev`. Children are constructed with `salt === ''` and copied
   * `mod`, and are therefore permanently ineligible to claim.
   */
  transfer(to: string, amount?: bigint): this | undefined

  /** Sets amount to 0n and advances `_rev`. */
  burn(): void

  /**
   * TBC20 merge via `isFungibleWith` (same `mod`, both genuine). TBC777 refuses
   * bags with escrow history.
   */
  async merge(tokens?: TBC20[]): Promise<void>

  /**
   * Credits the host-block subsidy if and only if this object is the
   * lexicographically smallest genuine mint creation in its block.
   * May be called only while `_rev === _root`.
   */
  async claim(): Promise<void>

  /** Off-chain convenience; must match the inlined cutoff in getSubsidy. */
  static ISSUANCE_BLOCKS = 210000

  /** Off-chain convenience; must match the inlined return in getSubsidy. */
  static SUBSIDY = 4294967296n

  /**
   * Flat 4294967296n units per host block for heights in [0, 210000).
   * 0n outside that window. Literals are inlined (the on-chain schedule).
   */
  static getSubsidy(hostBlockHeight: number): bigint
}

export const config = {
  DEFAULT_CHAIN: 'LTC',
  DEFAULT_NETWORK: 'regtest',
  DEFAULT_URL: 'http://localhost:1031',
  FAUCET_AMOUNT: Number(process.env.FAUCET_AMOUNT) || 100_000_000,
}
```

Commodity inherits the complete TBC777 escrow surface (`deposit`, audited
withdrawals, etc.). Deployed modules must export the full inheritance chain
(`TBC20`, `EscrowAuditor`, `TBC777`, `Commodity`) — see the package tests for
the canonical deploy helper.

## Mining & Claiming Workflow

1. **Off-chain** – Grind a salt until the resulting creation revision is
   competitively small. (The revision is determined by the creation transaction;
   any pure function of the salt can be used.)
2. **Broadcast** – `const mint = await helper.mint(owner, salt)` (or
`computer.new(Commodity, [{ to: owner, salt, amount: 0n }], mod)`).
3. **Claim** – Once the mint is confirmed and while it is still at the creation
   revision (`_rev === _root`), call `await mint.claim()`. The call succeeds
   only if this mint holds the absolute minimum creation revision of the module
   in its host block.

After a successful claim the object behaves like any other fungible Commodity of
its lineage and can participate in TBC777 escrows.

Clients that want extra safety against reorgs can wait for additional host
confirmations before calling `claim()` (analogous to coinbase maturity).

## Subsidy Schedule

```typescript
static ISSUANCE_BLOCKS = 210000
static SUBSIDY = 4294967296n

static getSubsidy(hostBlockHeight: number): bigint {
  // Inlined, no numeric separators: Class.toString() / moduleSource() grep.
  // Do not read Commodity.ISSUANCE_BLOCKS / SUBSIDY from here.
  if (hostBlockHeight < 0) return 0n
  if (hostBlockHeight >= 210000) return 0n
  return 4294967296n
}
```

Units are the host chain’s base unit (satoshis / litoshis / …).

The window is calibrated to Litecoin (`config.DEFAULT_CHAIN`, ~2.5 min blocks):
`210000 × 150 s = 364.58` days. After the cutoff `getSubsidy` is `0n` and
`claim()` throws `Issuance window closed`.

If every host block in the window is claimed, total supply is
`210000 × 4294967296 = 901943132160000` units (~9.02 million coins at `1e8`).
A successful claim is one `2^32` bag.

On-chain source of truth is the inlined literals inside `getSubsidy` (they are
what `CommodityHelper.moduleSource()` / `Class.toString()` deploy). The static
fields are off-chain conveniences for UI and tests; they do not appear in the
deployed class body. Edit both in the same change. This package ships one
Litecoin-calibrated module; a Bitcoin-calibrated window would be a later
deploy of edited source, not a second module in this package.

## Design Notes

**Host-miner inclusion**  
Host miners decide which mint creations are included in a block and can
therefore favour their own. Competitive minting activity can generate additional
fee demand that helps secure the host chain. Ordinary transfers and splits have
no MEV surface with respect to the subsidy.

**Sticky subsidies**  
Once `claim()` has succeeded the credited amount is not revoked by a later reorg
that would have selected a different winner (provided the claimed object itself
is not orphaned).

**Module identity**  
`claim()` recovers the module identifier from the creation transaction and
queries `getOTXOs({ mod, blockHeight })`. All competing mints must therefore be
created from the same deployed module.

**Inheritance & deployment**  
Commodity extends TBC777 so that the resulting tokens reuse the escrow-capable
token machinery and the no-inflation invariant. A deployed module must therefore
export the full chain `TBC20` → `EscrowAuditor` → `TBC777` → `Commodity`.

## Example

```typescript
import { Computer } from '@bitcoin-computer/lib'
import { Commodity, CommodityHelper, config } from '@bitcoin-computer/commodity'

const computer = new Computer({
  chain: config.DEFAULT_CHAIN,
  network: config.DEFAULT_NETWORK,
  url: config.DEFAULT_URL,
})

await computer.faucet(config.FAUCET_AMOUNT)

const helper = new CommodityHelper(computer)
const mod = await helper.deploy()

// Off-chain: produce a competitive salt (implementation left to the miner)
const salt = '…' // result of grinding

// Mint
const mint = await helper.mint(computer.getPublicKey(), salt)

// After confirmation, claim while still at the creation revision
await mint.claim()
console.log(mint.amount === Commodity.getSubsidy(/* block height of mint */))

// The claimed Commodity can now be transferred or split normally
const recipient = '…' // public key
const child = mint.transfer(recipient, mint.amount / 2n)

// …and can participate in TBC777 escrows
```

A test skeleton covering constructor paths, lineage checks, eligibility guards,
same-block selection, the end-to-end workflow and post-claim lifecycle is
provided in `commodity.test.ts`.

## Scope

**Protected**

- One subsidy per host block.
- Only genuine mints at their creation revision can claim.
- No inflation of a claimed lineage (inherited from TBC777 / TBC20).

**Not protected**

- Whether a competitive salt is actually ground.
- Whether a host miner censors competing mints.
- Liveness of claims after deep reorgs (clients should wait for confirmations).
- Business logic that uses the claimed Commodities.

## Relation to Other Standards

Commodity extends TBC777 (and therefore TBC20). It inherits the full
escrow-capable token surface and the token-side no-inflation invariant of
TBC777, while adding the min-revision issuance rule, the `salt`-based genuine-
mint check, and the `claim()` / `getSubsidy()` machinery. Unlike TBC20 (one mint `_root` = one token), Commodity treats every genuine mint
of the same module as one fungible token: `claim()` stamps `mod` from the
creation tx, `root` returns `mod`, and `merge` (TBC20 + TBC777 escrow guard)
combines genuine bags of that module.

After a successful claim the resulting objects are ordinary fungible tokens of a
genuine lineage. They can be used anywhere a Bitcoin Computer token or TBC777
token is accepted, including as inputs to other protocols and programmable
escrows.

Deployed modules must export the complete inheritance chain (`TBC20`,
`EscrowAuditor`, `TBC777`, `Commodity`).

## Risks and Disclaimers

Commodity is experimental open-source software. Participation involves material
risks, including smart-contract vulnerabilities, user or wallet errors that may
result in permanent loss of funds, blockchain reorganizations, and regulatory
change.

BCDB Inc. does not endorse any particular use of Commodity. Creators and
participants are solely responsible for compliance with the laws of their
jurisdiction, including securities laws (Howey analysis), sanctions, tax, and
any applicable state or local rules. Do your own research. Only use funds you
can afford to lose.

The Protocol remains fully accessible through multiple independent methods,
including the open `@bitcoin-computer` libraries together with a local node,
direct object ID navigation, raw transactions, and community or self-hosted
renderers. Reference infrastructure controls (when used) do not alter or censor
the underlying permissionless Protocol.

## Installation

```bash
git clone https://github.com/bitcoin-computer/monorepo.git
cd monorepo
npm install
```

## Usage

```bash
# from the package directory (once integrated)
npm run test      # requires a live Bitcoin Computer node (LTC regtest by default)
npm run types
npm run lint
```

## Documentation

- [Bitcoin Computer documentation](https://docs.bitcoincomputer.io/)
- [Current
  introduction](https://github.com/bitcoin-computer/monorepo/blob/staging/packages/docs-2/docs/intro.md)
- [How to build a token on
  Bitcoin](https://medium.com/@clemensley/how-to-build-a-token-on-bitcoin-in-javascript-c2439cf1b273)
  — explains the `_root` / lineage model used by `isGenuine()`
- Monorepo: https://github.com/bitcoin-computer/monorepo

## Getting Help

- Telegram: https://t.me/thebitcoincomputer
- X: https://twitter.com/TheBitcoinToken
- Email: clemens@bitcoincomputer.io

## License

MIT License (see `LICENSE.md`).  
Patented technology requires payment for mainnet / production use; see project
legal materials for details.
