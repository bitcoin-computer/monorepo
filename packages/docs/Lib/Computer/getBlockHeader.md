# getBlockHeader

_Returns a block header as a raw hex string._

## Type

```ts
getBlockHeader(blockHash: string): Promise<string>
```

### Parameters

#### `blockHash`

A block hash (64-character hex string).

### Return Value

A `Promise` that resolves to the **80-byte block header** as a hex string (160 hex characters).

## Description

Returns the first 80 bytes of the serialized block (the header). Useful when you need the wire-format header without the full block body; for the complete block, see [`getRawBlock`](./getRawBlock.md).

### Inside smart contracts (`InnerComputer`)

An unknown block hash invalidates the evaluation. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await computer.faucet(1e8)
const txId = counter._id.slice(0, 64)
const blockHash = await computer.txIdToBlockHash(txId)

const headerHex = await computer.getBlockHeader(blockHash)
// headerHex.length === 160
```
