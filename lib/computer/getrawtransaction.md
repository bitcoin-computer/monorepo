# getRawTransaction

_Returns a transaction as a raw hex string._

## Type

```ts
getRawTransaction(txId: string): Promise<string>
```

### Parameters

#### `txId`

A Bitcoin transaction id (64-character hex string).

### Return Value

A `Promise` that resolves to the serialized transaction as a **hex string**.

## Description

Returns the raw-hex form of a transaction. Parse with `Transaction.fromHex` when you need a structured object. For JSON metadata, use [`rpc`](./rpcCall.md) with verbosity `1` or `2`, or higher-level helpers such as [`txIdToBlockTime`](./txIdToBlockTime.md).

### Inside smart contracts (`InnerComputer`)

The transaction must be **confirmed**. Unconfirmed or missing transactions invalidate the evaluation. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await computer.faucet(1e8)
const txId = counter._id.slice(0, 64)

const hex = await computer.getRawTransaction(txId)
const tx = Transaction.fromHex(hex)
// tx.getId() === txId
```
