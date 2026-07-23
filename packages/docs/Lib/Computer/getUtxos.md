# getUtxos

!!!
**Deprecated** (wallet helper). On `Computer`, use [`getUTXOs`](./getUTXOs2.md) with a query, for example:

```ts
await computer.getUTXOs({ address: computer.getAddress(), isObject: false })
```

The lowercase `getUtxos` name remains on the internal wallet for compatibility and logs a deprecation warning.
!!!

_Legacy: returns payment UTXOs (not smart objects) for an address._

## Prefer instead

```ts
const revs = await computer.getUTXOs({
  address: computer.getAddress(),
  isObject: false,
})
```

See [getUTXOs](./getUTXOs2.md) and [getTXOs](./getTXOs.md).
