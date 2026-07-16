---
icon: log
---

# Contract

The `Contract` class allows you to create objects whose properties can only be updated through its methods. This enables the development of smart contracts in JavaScript. For details, please see [here](../../language.md).

If a class `C` extends from `Contract` and if `c` is an instance of `C` then an error is thrown if

- a property of `c` is created, updated or deleted outside of a method of `c`
- a property `_id`, `_rev` or `_root` of `c` is created, updated, or deleted.

In order to provide the two guarantees above we also need to forbid assigning to `this` inside of constructors. Instead, an object can be passed into `super` to initialize an object.

## Examples

### Updating Properties Outside of Methods

```js
class C extends Contract {
  constructor() {
    super({ n: 0 })
  }

  set(n: number) {
    this.n = n
  }
}

const c = new C()

// Assigning n through a method works
c.set(1)

expect(() => {
  // Assigning to property outside of a method throws an error
  c.n = 2
}).to.throw("Cannot set property 'n' directly")
```

### Updating `_id`, `_rev` or `_root`

```js
class C extends Contract {
  set(rev) {
    this._rev = rev
  }
}

const c = new C()

expect(() => {
  // Assigning a provenance property throws an error, even inside a method
  c.set('rev')
}).to.throw('Cannot set _rev')
```

### Using the Initialization Object

```js
class C extends Contract {
  n: number

  constructor() {
    // Use the initialization object
    super({ n: 0 })
  }
}

const c = new C()
expect(c.n).eq(0)
```

## Querying inside of a Contract

Smart contracts can access several built-in functions to explore information related to revisions, transaction outputs, trace transaction ancestry or query for balances. These functions do not modify blockchain data. Instead, they allow a contract to traverse its own revision graph, another contract's revision graph or access contextual information derived from transactions.

### Determinism rule

The build-in functions are designed to be deterministic, ensuring that they yield consistent results across different instances of the same blockchain state. This means that given two instances of the same blockchain state, executing a contract method with the same parameters will always return the same result.

Definition

```ts
Given two identical blockchain states and two identical Bitcoin Computer Node states, a contract method invoked with the same parameters must always return the same result.
```

To warrant this determinism, the functions will throw an error if they are called with invalid arguments, such as malformed revisions/transactionIds, a revision identifier that does not correspond to a Bitcoin Computer revision or a transaction ID that does not correspond to a Bitcoin Computer transaction.

### Available Functions

These functions are:

#### `prev`

Returns the immediate previous revision of the provided revision identifier, or undefined if there is no immediate previous object.
If the provided revision identifier is not valid or does not correspond to a Bitcoin Computer revision, the full execution is invalidated and an error is thrown.

```ts
prev(rev: string): Promise<string | undefined>
```

#### `next`

Returns the immediate next revision that follows the provided revision identifier, if any.
If the provided revision identifier is not valid, does not correspond to a Bitcoin Computer revision, or there is no next object, the full execution is invalidated and an error is thrown.

```ts
next(rev: string): Promise<string | undefined>
```

#### `first`

Returns the first revision in the lineage of the given revision, i.e., the original revision from which it was derived.
If the provided revision identifier is not valid or does not correspond to a Bitcoin Computer revision, the full execution is invalidated and an error is thrown.

```ts
first(rev: string): Promise<string>
```

#### `getAncestors`

Returns the ancestry of a transaction identifier, describing how it was derived.
If there is no ancestor, returns an empty array.
If the provided transaction identifier is malformed, the full execution is invalidated and an error is thrown.

```ts
getAncestors(location: string): Promise<string[] | Map<string, string>>
```

### `sync`

The `sync` the latest state for a revision, and returns the object representation of that state. If the provided revision identifier is not valid or does not correspond to a Bitcoin Computer revision, the full execution is invalidated and an error is thrown.

```ts
sync(rev: string): Promise<any>
```

### `decode`

Parses a Bitcoin transaction ID and returns its metadata if it is a Bitcoin Computer transaction. If the provided transaction identifier is malformed or does not correspond to a Bitcoin Computer transaction, the full execution is invalidated and an error is thrown.

```ts
decode(txId: string) =>
  Promise<{
    exp: string
    env?: { [s: string]: string }
    mod?: string
  }>
```

### `load`

Loads a module from a given module specifier. If the provided module specifier is malformed or does not correspond to a valid Bitcoin Computer module, the full execution is invalidated and an error is thrown.

```ts
load(location: string): Promise<ModuleExportsNamespace>
```
