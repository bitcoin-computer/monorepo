# sync

_Returns smart objects given a location on the blockchain._

## Type

```ts
;(location: string, options?: { class: Class; exact?: boolean }) => Promise<unknown>
```

### Parameters

#### `location`

The location can either be

- a revision encoded as `<transaction-id>:<output-number>`
- a transaction id

#### `options`

Optional, only for a revision: `{ class, exact }`. With a transaction id, `class` throws and nothing is read.

- `class`: a class that a module exports, as `computer.load` returns it. `sync` throws unless the object at the revision is an instance of that class (see [instanceof](#instanceof)). Any other value is refused: `undefined` (for example a name the loaded module does not export), and a class that no module exports (a class defined in the app, or `Contract`), which is not checked with plain `instanceof`.
- `exact`: `true` or `false`, with `class`. With `true`, `sync` throws unless the object was created by exactly that class: a subclass is refused too.

Any other key, or a third argument, throws.

### Return Value

If the argument is a revision the return value is the on-chain object with the specified revision.

If the argument is a transaction id (with no `class`), the return value is an object `{ res, env }` where

- `res` is the result of evaluating the expression on the transaction with the given id and
- `env` is an object that has the same keys as the blockchain environment of the transaction, but the values are on-chain objects after the expression is evaluated.

If the parameter is not a valid revision or transaction id, an error is thrown.

## Description

If the function is called with a revision, it returns the smart object stored at the provided revision. Note that the revision must not be a latest revision. In that case a historical state of the revision is returned.

If the function is called with a transaction id, it returns an object of type `{ res: Json; env: Json }`. The value of `res` is the result of evaluating the expression inscribed into the transaction. The `env` object has the same keys as the blockchain environment of the transaction, the values of `env` are the smart objects at these revisions _after_ evaluating the expression.

### instanceof

A class that a deployed module exports is identified by the module's transaction id and its export name. `obj instanceof Token` is true when `obj` is a smart object created by that module's `Token` or by a subclass of it, for every load of the module, on every client and inside smart contracts. When a module loads, the lib sets this check on each class it exports, and the classes, their prototypes and the classes they extend can no longer be changed. An exported class must be the constructor of its own prototype and extend `Contract` through classes: a module that exports a function sharing a class's prototype, or a class whose chain does not reach `Contract` that way, does not load. A `static [Symbol.hasInstance]` in the module's source does not change the check, and a module whose class cannot take it does not load. A class that no module exports keeps the plain JavaScript `instanceof`.

`instanceof` does not vouch for an object's values: a subclass counts, and a subclass can change what the class does. To require an object of exactly `Token`, add `exact: true`: `computer.sync(rev, { class: Token, exact: true })` throws for a subclass too. Only `Token`'s constructor gives an object that class: smart objects cannot change their prototype; in contract and module code `Reflect.construct` builds only the class it is given and there is no `Proxy`, so `new` builds the class it is called on; and only an export that is its prototype's constructor carries the class's name.

`computer.new(C, args, mod)` creates the object with the module's class of that name when `mod` has a class named `C`, its own or re-exported, whatever the source of `C` (see [`new`](./new.md)). Otherwise the source of `C` is pasted into the expression, and the object is not an instance of a module class of that name. If `C` extends a module class, the object is an instance of that class, as for any subclass.

In the app:

```js
const { Token } = await computer.load(mod)
const token = await computer.sync(rev, { class: Token }) // throws if the object at rev is not a Token
token instanceof Token // true
await computer.sync(rev, { class: Token, exact: true }) // also throws for a subclass of Token
```

### Inside smart contracts (`InnerComputer`)

The location’s transaction must be **confirmed**. Missing or mempool-only locations invalidate the contract evaluation. Objects returned inside contracts are deep-cloned plain data (not live proxies for mutation). `computer.sync(rev, { class: Token })` and `computer.sync(rev, { class: Token, exact: true })` check the class of the object before the copy is made and throw an error the contract can catch. With a transaction id, `class` throws an error the contract can catch once the transaction is confirmed; an unconfirmed transaction still invalidates, as for any read. A `class` that is not a module class, `undefined` included, also throws an error the contract can catch. `class` and `exact` go in the same object as `chain`: `computer.sync(rev, { chain: 'BTC', class: Token })` checks the class on that chain. There `Token` must come from `computer.load(mod, { chain: 'BTC' })`: a module is its transaction id on the chain it was deployed to, so a class loaded from this chain matches no object on another chain. The copy itself is plain data, so it is not `instanceof Token`. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

`computer.sync(location, { chain })` reads one confirmed object on another built-in chain. `location` is a transaction id or `txid:vout` on that chain. The second argument is a plain object. The published type writes `chain` as the uppercase id (`'BTC'`). Any other case is accepted at runtime and read as that id. Omit the argument, or omit `chain`, to read this computer. Passing `undefined` counts as a second argument and invalidates. The node URL comes from the computer’s [`remoteChains`](./constructor.md) configuration, not from the contract. The result is the same plain JSON as a one-argument `sync`: methods are removed, `bigint` is kept, and `_rev` stays `txid:vout` with no chain prefix. One-argument `sync`, including `sync('BTC')`, is still a read on this computer’s own chain: that string is a location, not a chain name. `{ chain: 'LTC' }` on a Litecoin computer is that same read. The only accepted key is `chain`, and for `sync` also `class` and `exact`; an `exact` that is not `true` or `false`, or `exact` without `class`, invalidates. A string, a number, `null`, an array, an unknown key, or a third argument invalidates. So does an unknown chain, a chain with no `remoteChains` entry, or a `chain` that is not a string. When `chain` is set, a location that is not a transaction id or revision invalidates `sync`, including when that name is this computer. `sync(notARev)` and `sync(notARev, {})` throw `Invalid Rev` and do not mark the evaluation. The outer `Computer.sync` shown above does not take `chain`. Inside a contract, every other inner-computer method takes that same options object. It does not use `sync`’s location check. `load`, `getAncestors`, `first`, `prev`, `next`, and `last` throw `Invalid Rev` for a value that is not a revision and do not mark the evaluation, so `try/catch` around those calls can still commit. A read that marks the frame cannot commit, caught or not. Those methods are listed in [Cross-chain reads](../Contract/cross-chain.md). A host that wants a live object on another chain constructs a `Computer` for that chain and calls one-argument `sync`.

The location has to be confirmed on the chain being read before the contract calls `sync`. The value has data fields only. Calling a method on it throws a normal JavaScript error and does not invalidate the evaluation.

```ts
const ltc = new Computer({
  chain: 'LTC',
  url: ltcUrl,
  remoteChains: { BTC: { url: btcUrl } },
})

class Reader extends Contract {
  async readN(location: string) {
    const obj = await computer.sync(location, { chain: 'BTC' })
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
