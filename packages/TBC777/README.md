<div align="center">

  <h1>TBC777</h1>
  <p>
    Programmable Escrow Token Standard for Bitcoin Computer
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

TBC777 extends [TBC20](../TBC20) with native on-chain escrow primitives. It lets
developers write programmable escrow logic as ordinary JavaScript/TypeScript
classes while guaranteeing that the total supply of any token lineage can never
be inflated — even if the escrow contract itself is buggy or malicious.

This combination of simple contract authoring and a strong, token-enforced
supply invariant makes TBC777 particularly well-suited for games, vesting,
atomic multi-party settlements, cross-chain claims, and other applications that
need to lock and release value under custom rules.

## The Core Guarantee

The `EscrowAuditor` walks the complete revision history (prev-chain) of an
escrow and computes an audited balance for every token lineage.

**How deposits are handled:**

- `token.deposit(escrowId, amount)` records the deposit **unconditionally** (as
  long as the token has sufficient balance). The call stores
  `token.depositTuple`, which captures the token’s **pre-mutation** `_rev`.
- Only deposits that later pass **both** `isEqualTo(other)` **and**
  `isValidMint(candidate)` contribute to `totalDeposited`. This check is
  performed lazily inside `EscrowAuditor.sumDeposits()` when a claim is
  attempted.

**How claims are handled:**

- All historical regular claims (`withdraws`) are collected from the **full**
  prev-chain of the escrow.
- Final claims (`finalWithdraws`) are read **only from the latest (terminal)
  revision**.
- `availableBalance = totalDeposited − totalRegularAuthorized −
totalFinalAuthorized`

The resulting `availableBalance` can **never exceed** the amount that was
validly deposited for that lineage. Any attempt to withdraw more is rejected by
the token. Over-authorization by an escrow can only make the available balance
smaller (or negative); it cannot create new tokens.

**Important design implication (mechanism design):** If an escrow
over-authorizes claims such that `availableBalance < 0`, **all withdrawals** for
that lineage on that escrow are blocked until the escrow state evolves in a way
that restores a non-negative balance. This strongly protects the supply
invariant but can temporarily lock funds for claimants. Choose or audit escrows
carefully.

**Scope**

- **Protected**: total supply of a token lineage (the core no-inflation
  invariant).
- **Not protected**: permanent locking of funds, incorrect beneficiary
  selection, buggy business logic inside the escrow, or liveness of claims (an
  escrow can simply refuse to authorize legitimate withdrawals).

## Key Features

- Programmable escrows written as ordinary JavaScript classes
- Full-history audit that enforces the no-inflation invariant on the token side
- Support for cross-chain (remote-root) tokens
- A single token may deposit into many escrows; an escrow may accept deposits
  from many tokens
- Transfers always produce a clean recipient instance (no inherited claim or
  escrow state)
- `merge()` is disabled — use an escrow for atomic merges instead

## Public Surface

```typescript
class TBC777 extends TBC20 {
  // Lock value in an escrow
  deposit(escrow: Id, amount: bigint): void

  // Claim value back
  async withdraw(rev: Rev): Promise<void>
  async finalWithdraw(rev: Rev): Promise<void>

  // Audited remaining balance for this lineage
  async getBalance(escrowRev: Rev): Promise<bigint>

  // Lineage checks
  async isEqualTo(other: TBC777): Promise<boolean>
  sameLineage(other: TBC777): boolean // synchronous fast path
}
```

```typescript
// Minimal interface every compatible escrow must satisfy.
// The auditor only reads these three append-only arrays.
abstract class Escrow extends Contract {
  deposits!: [Root, Rev][] // [root, pre-mutation token rev]
  withdraws!: [Root, Id, bigint][] // regular claims (full history)
  finalWithdraws!: [Root, Id, bigint][] // terminal claims only (latest rev)
}
```

Escrows may contain arbitrary additional state and methods. The auditor ignores
everything except the three arrays above.

## Writing Compatible Escrows

1. On deposit, call `token.deposit(this._id, amount)` and record
   `token.depositTuple` (this captures the token’s **pre-mutation** revision).
2. Record claims by **appending** (`push`) to `withdraws` or `finalWithdraws`.
   Claims are always keyed by the specific token `_id` (and `root` for lineage).
3. Keep authorization logic simple and auditable. Complex rules belong in the
   escrow; the token only enforces the supply invariant.
4. `finalWithdraws` are claimable only from the **terminal (latest)** revision
   of the escrow. The auditor enforces this via the `isTerminal` check.

## Remote-Root (Cross-Chain) Tokens

To bring external value on-chain under the same no-inflation rules, create a
remote-root token with zero balance and record the claim at construction time:

```typescript
new TBC777({
  amount: 0n,
  remoteRoot: sourceRoot,
  name: 'Bridged',
  symbol: 'BRG',
  to: recipient,
  withdrawn: [escrowRev], // or finalWithdrawn: [escrowRev]
})
```

The constructor rejects any remote-root token created with a positive amount.
`isValidMint` later verifies that the token was born with zero balance at its
`_id` **and** recorded a valid claim. This pattern guarantees that the minted
representation exactly matches an audited claim without inflating supply.

Remote-root tokens are especially useful for bridging, cross-chain settlement,
and representing claims on lineages from other Bitcoin Computer instances or
sidechains while preserving the same security guarantees.

## Example

```typescript
class NaiveEscrow extends Contract {
  deposits = []
  withdraws = []
  finalWithdraws = []

  acceptDeposit(token, amount) {
    token.deposit(this._id, amount)
    this.deposits.push(token.depositTuple) // pre-mutation rev
  }

  authorizeClaim(id, amount, root) {
    this.withdraws.push([root, id, amount]) // append, not overwrite
  }

  authorizeFinalClaim(id, amount, root) {
    this.finalWithdraws.push([root, id, amount])
  }
}

// 1. Create escrow
const escrow = await computer.new(NaiveEscrow, [])

// 2. Atomic deposit (recommended pattern)
const { tx, effect } = await computer.encode({
  exp: `escrow.acceptDeposit(token, ${amount}n)`,
  env: { escrow: escrow._rev, token: token._rev },
})
await computer.broadcast(tx)
const updatedToken = effect.env.token

// 3. Authorize and claim
await escrow.authorizeClaim(updatedToken._id, amount, updatedToken.root)
await updatedToken.withdraw(escrow._rev)

// Token balance restored; escrow reference cleared on non-final withdraw
```

A complete multi-party chess escrow (two players fund a pot, winner claims
everything) is included in the test suite (`test/tbc777.test.ts`) and
demonstrates the intended atomic style with real on-chain state transitions.

## Relation to TBC20

TBC777 is a drop-in extension of TBC20. Ordinary mint, transfer, burn, and
balance operations continue to work unchanged. The additional surface is purely
for escrow participation.

Because transfers sanitize all escrow-related mutable state (`withdrawn`,
`finalWithdrawn`, `escrow`), a TBC777 token remains usable anywhere a plain
TBC20 is expected. `merge()` is intentionally disabled — perform atomic merges
through an escrow instead so the supply invariant is enforced.

## Installation

```sh
git clone https://github.com/bitcoin-computer/monorepo.git
cd monorepo
npm install
```

## Usage

From `packages/TBC777`:

```bash
npm run test      # full suite, including no-inflation invariant tests
npm run types
npm run lint
```

The test suite deploys stripped versions of `TBC20`, `EscrowAuditor`, and
`TBC777` together in a single module (required because `TBC777` methods call
into `EscrowAuditor` at validation time).

## Documentation

- [Bitcoin Computer documentation](https://docs.bitcoincomputer.io/)
- [How to build a token on
  Bitcoin](https://medium.com/@clemensley/how-to-build-a-token-on-bitcoin-in-javascript-c2439cf1b273)
  — explains the `_root` / lineage model that underpins TBC777’s ability to
  track and audit supply per lineage.
- Source: [`src/tbc777.ts`](./src/tbc777.ts) (extensive JSDoc)
- Tests: [`test/tbc777.test.ts`](./test/tbc777.test.ts) — includes the core
  no-inflation tests and a full Chess escrow example.

## Design Notes & Security Considerations

- **No-inflation is token-enforced**: Even a completely malicious or buggy
  escrow cannot inflate the supply of any lineage. The `EscrowAuditor` runs as
  part of the deployed module, so the checks in `_withdraw()` are executed
  during on-chain validation.
- **Trade-off**: Over-authorization can make `availableBalance` negative and
  temporarily block legitimate withdrawals. This is intentional and
  conservative.
- **Remote-root tokens** do not mint new supply; they represent a validated
  claim on an existing lineage. Use them for bridging and cross-chain value
  transfer.
- The decision to disable `merge()` forces developers to use escrows for atomic
  multi-party value consolidation, keeping all supply changes auditable.

## Getting Help

Telegram: [t.me/thebitcoincomputer](https://t.me/thebitcoincomputer)  
Twitter: [@TheBitcoinToken](https://twitter.com/TheBitcoinToken)  
Email: clemens@bitcoincomputer.io

## Development Status

See the [library status
page](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#development-status).

The reference implementation has strong test coverage of the core no-inflation
invariant, remote-root minting, lineage compatibility, and common escrow
patterns (including a Chess game example). Some advanced scenarios (concurrent
claims, cross-escrow interactions, malicious revision injection) continue to be
hardened.

## Contributing

Bug reports and small fixes are welcome via
[issues](https://github.com/bitcoin-computer/monorepo/issues) and [pull
requests](https://github.com/bitcoin-computer/monorepo/pulls). For larger
features we recommend forking; let us know what you build and we can link to it.

## License

MIT License — see [LICENSE.md](./LICENSE.md).

This software includes patented technology that requires payment for use on
mainnet or production environments. Please review [LEGAL.md](./LEGAL.md) for
details.
