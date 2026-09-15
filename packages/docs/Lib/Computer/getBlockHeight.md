# getBlockHeight

_Returns the height of a block given its hash._

## Type

```ts
getBlockHeight(hash: string): Promise<number>
```

### Parameters

#### `hash`

A block hash (64-character hex string).

### Return Value

A `Promise` that resolves to the **block height** of the block with the given hash.

## Description

Returns the height of the block identified by `hash`. Pairs with [`getBlockHash`](./getBlockHash.md) and the [`txIdToBlockHash`](./txIdToBlockHash.md) helper.

### Inside smart contracts (`InnerComputer`)

An unknown block hash invalidates the evaluation. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await computer.faucet(1e8)
const txId = counter._id.slice(0, 64)
const blockHash = await computer.txIdToBlockHash(txId)

const height = await computer.getBlockHeight(blockHash)
// height is a positive number
```
