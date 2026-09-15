# txIdToBlockHash

_Returns the hash of the block that included a transaction._

## Type

```ts
txIdToBlockHash(txId: string): Promise<string | undefined>
```

### Parameters

#### `txId`

A Bitcoin transaction id (64-character hex string).

### Return Value

A `Promise` that resolves to:

- A **64-character hex string** — the block hash when the transaction is confirmed.
- **`undefined`** — when the transaction is unconfirmed.

## Description

Returns the inclusion block hash for a transaction. Combine with [`getBlockHeight`](./getBlockHeight.md) or [`getBlockHeader`](./getBlockHeader.md) for further block metadata.

Related: [`txIdToBlockTime`](./txIdToBlockTime.md), [`txIdToBlockHeight`](./txIdToBlockHeight.md).

### Inside smart contracts (`InnerComputer`)

The transaction must be **confirmed**. Unconfirmed or missing transactions invalidate the evaluation (no nullish success). See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await computer.faucet(1e8) // confirm the create transaction on regtest
const txId = counter._id.slice(0, 64)

const blockHash = await computer.txIdToBlockHash(txId)
// blockHash is a 64-character hex string
```
