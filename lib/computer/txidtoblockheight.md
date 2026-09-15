# txIdToBlockHeight

_Returns the block height at which a transaction was mined._

## Type

```ts
txIdToBlockHeight(txId: string): Promise<number>
```

### Parameters

#### `txId`

A Bitcoin transaction id (64-character hex string).

### Return Value

A `Promise` that resolves to the **block height** of the block that included the transaction.

## Description

Resolves the transaction’s block hash, then reads the height from the block header. Prefer this helper over calling [`rpc`](./rpcCall.md) when you only need the inclusion height.

Throws if the transaction is **not yet confirmed** (no block hash available).

Related: [`txIdToBlockTime`](./txIdToBlockTime.md), [`txIdToBlockHash`](./txIdToBlockHash.md), [`getBlockHash`](./getBlockHash.md).

### Inside smart contracts (`InnerComputer`)

The transaction must be **confirmed**. Unconfirmed or missing transactions invalidate the evaluation. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await computer.faucet(1e8) // confirm the create transaction on regtest
const txId = counter._id.slice(0, 64)

const height = await computer.txIdToBlockHeight(txId)
// height is a positive number
```
