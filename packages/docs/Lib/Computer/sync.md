# sync

_Returns smart objects given a location on the blockchain._

## Type

```ts
;(location: string) => Promise<unknown>
```

### Parameters

#### `location`

The location can either be

- a revision encoded as `<transaction-id>:<output-number>`
- a transaction id

### Return Value

If the argument is a revision the return value is the on-chain object with the specified revision.

If the argument is a transaction id, the return value is an object `{ res, env }` where

- `res` is the result of evaluating the expression on the transaction with the given id and
- `env` is an object that has the same keys as the blockchain environment of the transaction, but the values are on-chain objects after the expression is evaluated.

If the parameter is not a valid revision or transaction id, an error is thrown.

## Description

If the function is called with a revision, it returns the smart object stored at the provided revision. Note that the revision must not be a latest revision. In that case a historical state of the revision is returned.

If the function is called with a transaction id, it returns an object of type `{ res: Json; env: Json }`. The value of `res` is the result of evaluating the expression inscribed into the transaction. The `env` object has the same keys as the blockchain environment of the transaction, the values of `env` are the smart objects at these revisions _after_ evaluating the expression.

### Inside smart contracts (`InnerComputer`)

The location’s transaction must be **confirmed**. Missing or mempool-only locations invalidate the contract evaluation. Objects returned inside contracts are deep-cloned plain data (not live proxies for mutation). See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

`computer.sync(location, chain)` reads one confirmed object on another built-in chain. `location` is a transaction id or `txid:vout` on that chain. `chain` is that chain’s name (`'BTC'`, any case) and is the second argument. The node URL comes from the computer’s [`remoteChains`](./constructor.md) configuration, not from the contract. The result is the same plain JSON as a one-argument `sync`: methods are removed, `bigint` is kept, and `_rev` stays `txid:vout` with no chain prefix. One-argument `sync`, including `sync('BTC')`, is still a read on this computer’s own chain: that string is a location, not a chain name. Passing this computer’s own chain name as the second argument uses that same one-argument read. An unknown chain, a chain with no `remoteChains` entry, a chain that is not a string, or a location that is not a transaction id or revision invalidates the evaluation. The outer `Computer.sync` shown above does not take a chain. Inside a contract, every inner-computer method takes the chain as its second argument, with the same rules as `sync(location, chain)`. Those methods are listed in [Cross-chain reads](../Contract/cross-chain.md). A host that wants a live object on another chain constructs a `Computer` for that chain and calls one-argument `sync`.

The location has to be confirmed on the chain being read before the contract calls `sync`. The value has data fields only. Calling a method on it throws a normal JavaScript error and does not invalidate the evaluation.

```ts
const ltc = new Computer({
  chain: 'LTC',
  url: ltcUrl,
  remoteChains: { BTC: { url: btcUrl } },
})

class Reader extends Contract {
  async readN(location: string) {
    const obj = await computer.sync(location, 'BTC')
    return obj.n
  }
}

const reader = await ltc.new(Reader, [])
// onBtc was created on the BTC node at btcUrl, then confirmed
const n = await reader.readN(onBtc._rev)
```

<!-- TODO: explain other type of errors:
- code validation errors like super not allowed
- validate that the object re-created with the contract matches the object stored at that location
- Cannot call a function on a smart object that is pointed to
-  -->

## Example

:::code source="../../../lib/test/lib/computer/sync.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/sync.test.ts" target=_blank>Source</a>
