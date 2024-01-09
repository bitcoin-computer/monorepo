# sync

Returns the smart object stored at a given location (revision or transaction id).

### Syntax
```js
const location = '0324ba3...ba2:0'
const result = await computer.sync(location)
```

### Type
```ts
<T extends new (...args: any) => any>(
  location: string
) => Promise<unknown>;
```

### Parameters
#### location
An string encoding a revision (transaction id `:` output number) where the smart object is located; or an string encoding a transaction id.

### Return value
If a revision is provided as parameter, returns the smart object stored at the provided `location`. 
If a transaction id is provided as parameter, returns an object of type `Effect` encoding the result and the environment of the expression encoded in that transaction. In this case, the `sync` function will try to find any smart object over the outputs list.
If the parameter is not a valid revision or transaction id, an error is thrown.
<!-- TODO: explain other type of errors:
- inconsistent state if the smart object synced or any other smart object on the environment was not created with the library 
- code validation errors like super not allowed
- validate that the object re-created with the contract matches the object stored at that location
- Cannot call a function on a smart object that is pointed to
-  -->

### Examples
```ts
// Compute smart object from revision
const synced = await computer.sync(a._rev)

// Evaluates to true for all smart objects "a"
expect(synced).to.deep.equal(a)

// Compute smart object from a transaction id
const txId = getTxId(a._rev)
const effect = await computer.sync(txId)

expect(effect).to.deep.eq({ res: a, env: {} })

```
