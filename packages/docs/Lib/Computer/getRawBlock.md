# getRawBlock

_Returns a block as a raw hex string._

## Type

```ts
getRawBlock(blockHash: string): Promise<string>
```

### Parameters

#### `blockHash`

A block hash (64-character hex string).

### Return Value

A `Promise` that resolves to the full serialized block as a **hex string**.

## Description

Returns the complete block serialization (header plus transactions). For the 80-byte header only, use [`getBlockHeader`](./getBlockHeader.md).

### Inside smart contracts (`InnerComputer`)

An unknown block hash invalidates the evaluation. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await computer.faucet(1e8)
const txId = counter._id.slice(0, 64)
const blockHash = await computer.txIdToBlockHash(txId)

const blockHex = await computer.getRawBlock(blockHash)
// blockHex is hex; longer than 160 characters (header is the first 160 hex chars)
```
