# txIdToBlockTime

_Returns the Unix block time at which a transaction was mined._

## Type

```ts
txIdToBlockTime(txId: string): Promise<bigint | undefined>
```

### Parameters

#### `txId`

A Bitcoin transaction id (64-character hex string).

### Return Value

A `Promise` that resolves to:

- A **bigint** — Unix timestamp in seconds (`blocktime` from `getrawtransaction`) when the transaction is confirmed.
- **`undefined`** — when the transaction is unconfirmed or the field is absent.

## Description

Looks up the transaction and returns the time of the block that included it. Prefer this helper over calling [`rpc`](./rpcCall.md) when you only need the inclusion time.

Related: [`txIdToBlockHeight`](./txIdToBlockHeight.md), [`txIdToBlockHash`](./txIdToBlockHash.md).

### Inside smart contracts (`InnerComputer`)

The transaction must be **confirmed**. Unconfirmed or missing transactions invalidate the evaluation (there is no stable `undefined` success path). See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
const txId = counter._id.slice(0, 64)

// Unconfirmed: usually undefined on the outer Computer API
const pending = await computer.txIdToBlockTime(txId)

// After the transaction is confirmed (e.g. mine a block on regtest)
await computer.faucet(1e8)
const blockTime = await computer.txIdToBlockTime(txId)
// blockTime is a bigint (seconds since Unix epoch)
```
