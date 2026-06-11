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

<!-- TODO: explain other type of errors:
- code validation errors like super not allowed
- validate that the object re-created with the contract matches the object stored at that location
- Cannot call a function on a smart object that is pointed to
-  -->

## Example

:::code source="../../../lib/test/lib/computer/sync.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/sync.test.ts" target=_blank>Sources</a>
