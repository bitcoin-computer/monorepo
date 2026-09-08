# waitForIndexed

_Polls until the Bitcoin Computer Node has indexed a transaction (or a revision’s transaction)._

## Type

```ts
waitForIndexed(
  location: string,
  opts?: { timeoutMs?: number; pollMs?: number },
): Promise<{ indexed: boolean; hasOutputs: boolean; hasInputs: boolean }>
```

### Parameters

#### `location`

A transaction id (`64` hex chars) or a revision (`<txid>:<vout>`). The node status is looked up by transaction id.

#### `opts` (optional)

{.compact}
| Key | Description | Default |
| --------- | -------------------------------- | ------- |
| timeoutMs | Give up after this many milliseconds | `30000` |
| pollMs | Delay between polls | `100` |

### Return Value

Resolves with the same shape as [`isIndexed`](./isIndexed.md) when `indexed` becomes `true`. Throws if the timeout elapses first.

## Description

After `broadcast`, `new`, or an external payment, the node may not yet have written `Output` rows. Prefer `waitForIndexed` when the next step needs the indexer (for example `sync`, `getOUTXOs`, or [`getModules`](./getModules.md) for a just-deployed module).

This method repeatedly calls [`isIndexed`](./isIndexed.md) until the node reports `indexed: true` or the timeout is reached.

## Example

```ts
const counter = await computer.new(Counter, [0])
await computer.waitForIndexed(counter._rev)

const latest = await computer.sync(counter._rev)
```

## See also

- [isIndexed](./isIndexed.md)
