# spendingInput

_Returns the spending input identifier for a given revision, if it has been spent._

## Type

```ts
spendingInput(rev: string): Promise<string | undefined>
```

### Parameters

#### `rev`

Revision of the form `<txid>:<vout>`.

### Return Value

A string identifying the spending input (as returned by the node), or `undefined` if the output is unspent / not found.

## Description

Queries the node for the input that spent the given output. Complements [`prev`](./prev.md) / [`next`](./next.md) for graph traversal.
