# sync

_Returns smart objects given a location on the blockchain._

## Type

```ts
;(location: string, cls?: Class) => Promise<unknown>
```

### Parameters

#### `location`

The location can either be

- a revision encoded as `<transaction-id>:<output-number>`
- a transaction id

#### `cls`

Optional. A class that a module exports, as `computer.load` returns it. Only for a revision. If it is passed, `sync` throws unless the object at the revision is an instance of that class (see [instanceof](#instanceof)). Any other value is refused, also a class that no module exports (a class defined in the app, or `Contract`): it is not checked with plain `instanceof`.

### Return Value

If the argument is a revision the return value is the on-chain object with the specified revision.

If the argument is a transaction id, the return value is an object `{ res, env }` where

- `res` is the result of evaluating the expression on the transaction with the given id and
- `env` is an object that has the same keys as the blockchain environment of the transaction, but the values are on-chain objects after the expression is evaluated.

If the parameter is not a valid revision or transaction id, an error is thrown.

## Description

If the function is called with a revision, it returns the smart object stored at the provided revision. Note that the revision must not be a latest revision. In that case a historical state of the revision is returned.

If the function is called with a transaction id, it returns an object of type `{ res: Json; env: Json }`. The value of `res` is the result of evaluating the expression inscribed into the transaction. The `env` object has the same keys as the blockchain environment of the transaction, the values of `env` are the smart objects at these revisions _after_ evaluating the expression.

### instanceof

A class that a deployed module exports is identified by the module's transaction id and its export name. `obj instanceof Token` is true when `obj` is a smart object created by that module's `Token` or by a subclass of it, for every load of the module, on every client and inside smart contracts. When a module loads, the lib sets this check on each class it exports, and the classes and their prototypes can no longer be changed. A `static [Symbol.hasInstance]` in the module's source does not change the check, and a module whose class cannot take it does not load. A class that no module exports keeps the plain JavaScript `instanceof`.

`computer.new(C, args, mod)` creates the object with the module's class only when the source of `mod` has `export class C` with exactly the source of `C`. Otherwise `C` is pasted into the expression: the object is not an instance of the module's class of that name, but it is an instance of a module class that `C` extends.

In the app:

```js
const { Token } = await computer.load(mod)
const token = await computer.sync(rev, Token) // throws if the object at rev is not a Token
token instanceof Token // true
```

### Inside smart contracts (`InnerComputer`)

The location’s transaction must be **confirmed**. Missing or mempool-only locations invalidate the contract evaluation. Objects returned inside contracts are deep-cloned plain data (not live proxies for mutation). `computer.sync(rev, Token)` checks the class of the object before the copy is made and throws an error the contract can catch. The copy itself is plain data, so it is not `instanceof Token`. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

<!-- TODO: explain other type of errors:
- code validation errors like super not allowed
- validate that the object re-created with the contract matches the object stored at that location
- Cannot call a function on a smart object that is pointed to
-  -->

## Example

:::code source="../../../lib/test/lib/computer/sync.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/sync.test.ts" target=_blank>Source</a>
