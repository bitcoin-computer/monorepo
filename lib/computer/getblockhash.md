# getBlockHash

_Returns the block hash at a given height in the best chain._

## Type

```ts
getBlockHash(height: number): Promise<string>
```

### Parameters

#### `height`

A non-negative block height in the best chain.

### Return Value

A `Promise` that resolves to the **block hash** (64-character hex string) at that height.

## Description

Returns the hash of the block at the given height. Round-trips with [`getBlockHeight`](./getBlockHeight.md): `getBlockHash(await getBlockHeight(hash))` yields the same hash for blocks in the best chain.

### Inside smart contracts (`InnerComputer`)

- Negative heights invalidate the evaluation.
- Heights **greater than the current tip** (future blocks) invalidate the evaluation.

See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await computer.faucet(1e8)
const txId = counter._id.slice(0, 64)
const blockHash = await computer.txIdToBlockHash(txId)
const height = await computer.getBlockHeight(blockHash)

const hashFromHeight = await computer.getBlockHash(height)
// hashFromHeight === blockHash
```
