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
- Bitcoin-style subsidy schedule (50 coins, halving every 210 000 host blocks).
- Claimed Commodities remain ordinary fungible objects (transfer, split, burn).
- Host miners control inclusion of new mint creations; competitive minting
  activity can increase fee demand on the host chain. Ordinary transfers and
  splits have no MEV surface with respect to the subsidy.
- Subsidies are sticky after a successful claim (deep reorgs do not revoke
  already-credited amounts).
- Fully permissionless: anyone can mint, claim, transfer, or split using the
  open libraries or alternative implementations.

## Public Surface

```typescript
export class Commodity extends Contract {
  amount!: bigint
  salt!: string

  /**
   * Two constructor paths:
   * - salt non-empty, amount === 0n  → genuine mint root (only these can claim)
   * - salt === '', amount ≥ 0n       → transfer / split child (inherits _root)
   */
  constructor(to: string, salt: string = '', amount: bigint = 0n)

  /** True iff this object descends from a genuine mint (non-empty salt at root). */
  async isGenuine(): Promise<boolean>

  /** Whole-balance transfer or partial split. Advances _rev. */
  transfer(to: string, amount?: bigint): Commodity | undefined

  /** Sets amount to 0n and advances _rev. */
  burn(): void

  /** Always throws. Merge is disabled. */
  merge(): void

  /**
   * Credits the host-block subsidy if and only if this object is the
   * lexicographically smallest genuine mint creation in its block.
   * May be called only while _rev === _root.
   */
  async claim(): Promise<void>

  /** Bitcoin-style subsidy for the given host block height. */
  static getSubsidy(hostBlockHeight: number): bigint
}

export const config = {
  DEFAULT_CHAIN: 'LTC',
  DEFAULT_NETWORK: 'regtest',
  DEFAULT_URL: 'http://localhost:1031',
  FAUCET_AMOUNT: Number(process.env.FAUCET_AMOUNT) || 100_000_000,
}
```

## Mining & Claiming Workflow

1. **Off-chain** – Grind a salt until the resulting creation revision is
   competitively small. (The revision is determined by the creation transaction;
   any pure function of the salt can be used.)
2. **Broadcast** – `const mint = await computer.new(Commodity, [owner, salt,
0n])`.
3. **Claim** – Once the mint is confirmed and while it is still at the creation
   revision (`_rev === _root`), call `await mint.claim()`. The call succeeds
   only if this mint holds the absolute minimum creation revision of the module
   in its host block.

After a successful claim the object behaves like any other fungible Commodity of
its lineage.

Clients that want extra safety against reorgs can wait for additional host
confirmations before calling `claim()` (analogous to coinbase maturity).

## Subsidy Schedule

```typescript
static getSubsidy(hostBlockHeight: number): bigint {
  if (hostBlockHeight < 0) return 0n
  const halvings = Math.floor(hostBlockHeight / 210_000)
  if (halvings >= 64) return 0n
  const COIN = 100_000_000n
  return (50n * COIN) / (1n << BigInt(halvings))
}
```

Units are the host chain’s base unit (satoshis / litoshis / …).

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

## Example

```typescript
import { Computer } from '@bitcoin-computer/lib'
import { Commodity, config } from './commodity'

const computer = new Computer({
  chain: config.DEFAULT_CHAIN,
  network: config.DEFAULT_NETWORK,
  url: config.DEFAULT_URL,
})

await computer.faucet(config.FAUCET_AMOUNT)

// Off-chain: produce a competitive salt (implementation left to the miner)
const salt = '…' // result of grinding

// Mint
const mint = await computer.new(Commodity, [computer.getPublicKey(), salt, 0n])

// After confirmation, claim while still at the creation revision
await mint.claim()
console.log(mint.amount === Commodity.getSubsidy(/* block height of mint */))

// The claimed Commodity can now be transferred or split normally
const recipient = '…' // public key
const child = mint.transfer(recipient, mint.amount / 2n)
```

A test skeleton covering constructor paths, lineage checks, eligibility guards,
same-block selection, the end-to-end workflow and post-claim lifecycle is
provided in `commodity.test.ts`.

## Scope

**Protected**

- One subsidy per host block.
- Only genuine mints at their creation revision can claim.
- No inflation of a claimed lineage.

**Not protected**

- Whether a competitive salt is actually ground.
- Whether a host miner censors competing mints.
- Liveness of claims after deep reorgs (clients should wait for confirmations).
- Business logic that uses the claimed Commodities.

## Relation to Other Standards

Commodity is self-contained; it does not extend TBC20 or TBC777. After a
successful claim the resulting objects are ordinary fungible tokens of a genuine
lineage and can be used anywhere a Bitcoin Computer token is accepted, including
as inputs to other protocols.

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
