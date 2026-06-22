# TBC20 Standardization — swap2 / ft2 settlement blocker

## TL;DR

Migrating the `Token` in `@bitcoin-computer/TBC20` to the standardized TBC20 (mirrored
from TBC777) **breaks atomic settlement in swap2 and therefore ft2**. The break is in the
asset-token leg of every trade, where a buyer can **pay and receive nothing**. The
payment/satoshi leg is _not_ affected. This is an architectural incompatibility, not a
test fix — swap2/ft2 should **not** be migrated until exchange settlement is reworked.

## Root cause: transfer semantics changed

- **Old** `Token.transfer(to)` (full): reassigns ownership **in place** — same UTXO, owner flips.
  Identical to `NFT.transfer` and `Payment.transfer`.
- **Standard** `Token.transfer(to)`: never touches `_owners`. It **splits** value into a
  **new** token output owned by the recipient and leaves the sender a zero-amount husk.
  (Required for partial transfers and for TBC777's escrow-state sanitization.)
  - `monorepo/packages/TBC20/src/token.ts` → `transfer()` / `_createTransferToken()`

## Why settlement breaks

swap2 settles trades with the `Sale` contract (`@bitcoin-computer/swap`):

- `monorepo/packages/swap/src/sale.ts` → `Sale.exec(o, p)`:
  ```ts
  o.transfer(ownerP) // token  -> buyer
  p.transfer(ownerN) // payment -> seller
  ```
- Encoded with `SIGHASH_SINGLE | ANYONECANPAY`, a **fixed 2-in / 2-out** layout.
  `SaleHelper.checkSaleTx` reads `tx.outs[0].value`; `SaleHelper.finalizeSaleTx` patches
  `output[1]`'s scriptPubKey to the real buyer. Both assume the token stays at a fixed output.

With the standard Token, `o.transfer(ownerP)` no longer flips `o`'s owner. Instead:

1. During `createSaleTx` the payment is a **mock** whose owner is a throwaway
   `randomPublicKey` (`monorepo/packages/swap/src/payment.ts` → `PaymentMock`), so
   `ownerP = randomPublicKey`.
2. `o` becomes a **husk (amount 0) still owned by the seller**, and a **new
   full-amount token is minted to `randomPublicKey`** at a new output index that
   `finalizeSaleTx` never patches.
3. Result: **buyer pays, asset lands on an unspendable key, seller keeps a 0 husk.**

## Evidence (empirical)

With the standardized Token, constructors updated only to compile, the very first
settlement test fails on ownership (broadcast succeeds, outcome is wrong):

- `packages/swap2/test/buy-order.test.ts:30` — _"Should work with helper classes when the
  seller has a matching token"_
- Fails at line 77: `expect(tokenAfter._owners).deep.eq([buyer.getPublicKey()])`
  → actual owner is the **seller** (the husk), not the buyer.

All Sale-settlement paths are affected:

- `packages/swap2/src/buy-order.ts` → `closeBuyOrder` / `settleBuyOrder` / `eatBuyOrders`
- `packages/swap2/src/sell-order.ts` → `_broadcastSellOrder` / `closeAndSettleSellOrder` / `eatSellOrders`

## What is NOT affected

- **Payment / satoshi leg.** `Payment` and `BuyOrder` carry value in `_satoshis` and define
  their **own in-place `transfer`** (`this._owners = [to]`); they are not TBC20 tokens, so
  standardization does not touch them.
  - `monorepo/packages/swap/src/payment.ts` → `Payment.transfer`
  - `packages/swap2/src/buy-order.ts` → `BuyOrder.transfer`
- **Token split/merge in helpers.** swap2 only does **partial** `token.transfer(to, amount)`
  (identical semantics) and same-lineage `head.merge(tail)` (all filtered by root) — both fine.
- **ft2 cancel buttons** (`token.transfer(self)` in `MyOrders/SellOrders/BuyOrders`): still
  cancel the order (token UTXO is spent, value returns to a new self-owned token); they only
  leave a harmless 0-amount dust husk.
- **swap (NFT) package**: `Sale`/`Swap` keep working for NFTs (`NFT.transfer` is in-place).

## ft2 impact

ft2 is built on swap2's `BuyHelper` / `SellOrderHelper`. Buying and selling both settle
through `Sale`, so **ft2's core exchange function breaks** exactly as above. The
payment/satoshi handling and order cancellation are fine; the asset delivery to the buyer is not.

## Options for the team

1. Make settlement split-aware (token-specific sale that captures the new token output and
   directs it to the real buyer / fixes output ordering under SIGHASH_SINGLE).
2. Move fungible settlement to **TBC777 escrow** (deposit → withdraw), which is designed for
   the standard Token.
3. Keep an in-place-transfer fungible token for the exchange and reserve standard TBC20 for
   non-exchange use.

Until one of these lands, **do not migrate swap2 / ft2** to the standardized Token.
(TBC20 package, dao-contracts, and swap (NFT) have been migrated successfully.)
</content>
