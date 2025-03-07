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
- inconsistent state if the smart object synced or any other smart object on the environment was not created with the library
- code validation errors like super not allowed
- validate that the object re-created with the contract matches the object stored at that location
- Cannot call a function on a smart object that is pointed to
-  -->

## Example

```ts
import { Computer, Countract } from '@bitcoin-computer/lib'

class Counter extends Contract {
  n: number

  constructor() {
    super({ n: 0 })
  }
  inc() {
    this.n += 1
  }
}

const computer = new Computer()
await computer.faucet(1e8)

// Create on-chain object
const { tx, effect } = await computer.encode({
  exp: `${Counter} new Counter()`,
})
const counter = effect.res
await computer.broadcast(tx)
const initialCounter = {
  n: 0,
  _id: `${tx.getId()}:0`,
  _rev: `${tx.getId()}:0`,
  _root: `${tx.getId()}:0`,
  _owners: [computer.getPublicKey()],
  _amount: chain === 'LTC' ? 5820 : 582,
}
expect(counter).deep.eq(initialCounter)

// Update on-chain object
await counter.inc()

// Sync to initial revision
expect(await computer.sync(counter._id)).deep.eq(initialCounter)

// Sync to latest revision
expect(await computer.sync(counter._rev)).deep.eq(counter)

// Sync to initial transaction id
const initialTxId = counter._id.slice(0, 64)
expect(await computer.sync(initialTxId)).deep.eq({
  res: initialCounter,
  env: {},
})

// Sync to latest transaction id
const latestTxId = counter._rev.slice(0, 64)
expect(await computer.sync(latestTxId)).deep.eq({
  res: undefined,
  env: {
    __bc__: counter,
  },
})
```
