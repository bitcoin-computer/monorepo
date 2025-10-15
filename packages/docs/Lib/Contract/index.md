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

Smart contracts that extend the `Contract` class can access several built-in functions to explore information related to revisions, transaction outputs, trace transaction ancestry or query for balances. These functions do not modify blockchain data. Instead, they allow a contract to traverse its own revision graph, another contract's revision graph or access contextual information derived from transactions.

### Determinism rule

The build-in functions are designed to be deterministic, ensuring that they yield consistent results across different instances of the same blockchain state. This means that given two instances of the same blockchain state, executing a contract method with the same parameters will always return the same result.

Definition

```ts
Given two identical blockchain states and two identical Bitcoin Computer Node states, a contract method invoked with the same parameters must always return the same result.
```

### Available Functions

These functions are:

#### `getTXOs`

Returns the unspent transaction outputs (UTXOs) that match a given parameter. Common use cases:

- Retrieve TXOs belonging to a specific address.
- Retrieve TXOs associated with a particular module specifier.

```ts
getTXOs(query: GetTXOsQuery & { verbosity?: 0 }): Promise<string[]>
getTXOs(query: GetTXOsQuery & { verbosity: 1 }): Promise<DbOutput[]>
getTXOs(query: GetTXOsQuery): Promise<string[] | DbOutput[]>
```

#### `getBalance`

Retrieves the balance of a specified address.

```ts
getBalance(address: string): Promise<Balance>
```

#### `prev`

Returns the immediate previous revision of the provided revision identifier.

```ts
prev(rev: string): Promise<string | undefined>
```

#### `next`

Returns the immediate next revision that follows the provided revision identifier, if any.

```ts
next(rev: string): Promise<string | undefined>
```

#### `first`

Returns the first revision in the lineage of the given revision, i.e., the original revision from which it was derived.

```ts
first(rev: string): Promise<string>
```

#### `last`

Returns the most recent revision derived from the provided revision, following the chain of updates.

```ts
latest(rev: string): Promise<string>
```

#### `getAncestors`

Returns the ancestry of a transaction or revision, describing how it was derived.

- When called with low verbosity, it returns an array of ancestor transaction IDs.
- With higher verbosity, it returns a Map of { txId → rawHex } pairs containing full transaction data.

```ts
getAncestors(location: string, verbosity?: number): Promise<string[] | Map<string, string>>
```
