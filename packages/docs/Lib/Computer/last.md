# last

_Returns the latest revision of an object if that latest revision is spent; otherwise `undefined`._

## Type

```ts
last(rev: string): Promise<string | undefined>
```

### Parameters

#### `rev`

Any revision of the on-chain object (`<txid>:<vout>`).

### Return Value

- The latest revision string if that UTXO is **spent**
- `undefined` if the latest revision is still **unspent**

## Description

Computes [`latest`](./latest.md) for `rev`, then checks whether that output is still unspent via [`isUnspent`](./isUnspent.md). Useful when you want the tip of a spent chain rather than the live UTXO tip.

## See also

- [latest](./latest.md)
- [isUnspent](./isUnspent.md)
