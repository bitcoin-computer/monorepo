# waitForIndex

_Waits until an on-chain object revision is indexed by the Bitcoin Computer node._

## Type

```ts
;(rev: string) => Promise<void>
```

### Parameters

- `rev`: The revision of the on-chain object (`<txid>:<vout>`).

### Return Value

A `Promise` that resolves when the revision has been indexed and is available via `sync` / `query`.

### Syntax

```js
await computer.waitForIndex(rev)
```

## Example

```js
const counter = await computer.new(Counter, [0])

// Wait until the object is indexed before reading its state
await computer.waitForIndex(counter._rev)

const latest = await computer.sync(counter._rev)
```
