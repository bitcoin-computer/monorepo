# sync

Returns smart objects given a location on the blockchain. The location can either be a revision (a string of the for \<transaction id\>:\<output number\>) or a transaction id.

### Type

```ts
;(location: string) => Promise<unknown>
```

### Syntax

```js
await computer.sync('0324ba3...ba2')
await computer.sync('0324ba3...ba2:0')
```

### Parameters

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| location | An string encoding a revision or a transaction id.|

### Return value

If the function is called with a revision, it returns the smart object stored at the provided revision. Note that the revision must not be a latest revision. In that case a historical state of the revision is returned.

If the function is called with a transaction id, it returns an object of type `{ res: Json; env: Json }`. The value of `res` is the result of evaluating the expression inscribed into the transaction. The `env` object has the same keys as the blockchain environment of the transaction, the values of `env` are the smart objects at these revisions _after_ evaluating the expression.

If the parameter is not a valid revision or transaction id, an error is thrown.

<!-- TODO: explain other type of errors:
- inconsistent state if the smart object synced or any other smart object on the environment was not created with the library
- code validation errors like super not allowed
- validate that the object re-created with the contract matches the object stored at that location
- Cannot call a function on a smart object that is pointed to
-  -->

### Examples

#### Sync to a Revision

Synchronizing to the revision returns a smart object.

```ts
import { Contract, Computer } from '@bitcoin-computer/lib'

// A smart contract
class A extends Contract {
  constructor(n) {
    this.n = n
  }
}

// Create a smart object
const computer = new Computer({ mnemonic: ... })
const a = await computer.new(A, [1])

// Synchronizing to the revision of a smart object always
// returns a value that is deep equal the smart object
expect(await computer.sync(a._rev)).to.deep.equal(a)
```

#### Sync to a transaction id

Synchronizing to a transaction id returns all smart objects on that transaction.

```ts
import { Computer, Contract } from '@bitcoin-computer/lib'

// A smart contract
class C extends Contract {
  constructor(n) {
    this.n = n
  }
}

// Encode the expression into a transaction
const { effect, tx } = await computer.encode({
  exp: `${C} new C(1)`,
})

// The tx can be broadcast to commit the change
const txId = await computer.broadcast(tx)

// Synchronizing to a transaction id is always equal
// to the effect object returned from encode.
expect(await computer.sync(txId)).to.deep.eq(effect)
```
