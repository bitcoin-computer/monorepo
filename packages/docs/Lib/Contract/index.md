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

Smart contracts can access several built-in functions (provided by `InnerComputer`) to explore information related to revisions, transaction ancestry, on-chain state, and block metadata. These functions do not modify blockchain data. Instead, they allow a contract to traverse its own revision graph, another contract's revision graph, load modules, or access contextual information derived from transactions in a safe and deterministic way.

### Determinism and Safety Rules

The built-in functions are designed to be **deterministic**: given two identical blockchain states and two identical Bitcoin Computer node states, a contract method invoked with the same parameters must always return the same result.

To enforce safety and determinism:

- Accessing **non-existent on-chain state** (a revision, transaction, or module that cannot be found) is **forbidden** inside smart contracts.
- If a query function is called with malformed identifiers, or identifiers that do not correspond to actual Bitcoin Computer state, **the entire contract evaluation is invalidated**.
- Internally, a global invalid-state flag is set. After evaluation, `Db.eval` checks this flag; if set, the evaluation (and thus the transaction) is rejected.
- The flag is reset at the start of every new compartment evaluation.

When invalidation occurs, the function throws an error with a message like:

> "Accessing non-existent on-chain state inside a smart contract is forbidden."

This acts as a hard safety boundary: contracts cannot silently read missing data or depend on off-chain assumptions.

### Full API Reference

All query functions available inside `Contract` methods (injected via the secure `InnerComputer` compartment):

| Function          | Signature                                                     | Returns                              | Invalidates on missing / error?      | Notes                                                         |
| ----------------- | ------------------------------------------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------------------------------------- |
| `sync`            | `sync(location: string): Promise<any>`                        | The latest object state              | Yes                                  | Deep-cloned with BigInt support                               |
| `decode`          | `decode(txId: string): Promise<TransitionJSON>`               | `{ exp, env?, mod? }` transition metadata | Yes                             | Transition txs only; module deploys must use `load`           |
| `load`            | `load(location: string): Promise<Record<string, any>>`        | Module exports namespace             | Yes                                  | For dynamic module loading inside contracts                   |
| `getAncestors`    | `getAncestors(location: string): Promise<string[]>`           | Array of ancestor locations          | Yes (on error)                       | Empty array `[]` if no ancestors                              |
| `first`           | `first(rev: string): Promise<string>`                         | First revision in lineage            | Yes                                  | Always returns a string for valid input                       |
| `prev`            | `prev(rev: string): Promise<string \| undefined>`             | Previous revision or `undefined`     | Only on underlying error             | Safe to call on tip; returns `undefined` without invalidation |
| `next`            | `next(rev: string): Promise<string \| undefined>`             | Next revision or throws              | **Yes, including if no next exists** | Strict: absence of next **invalidates** execution             |
| `last`            | `last(rev: string): Promise<string \| undefined>`             | Latest (tip) revision or `undefined` | Only on underlying error             | Returns tip of lineage                                        |
| `txIdToBlockTime` | `txIdToBlockTime(txId: string): Promise<bigint \| undefined>` | Block time as `bigint`               | Yes                                  | Requires mined Bitcoin Computer transaction                   |

**Quick tip:** Use `getAncestors`, `first`, `last`, and `prev` for safe traversal. Be cautious with `next()` — it will invalidate the contract if you call it on the current tip revision.

### Detailed Function Documentation

#### `sync`

Returns the latest on-chain state for the given `location` (revision identifier) as a plain JavaScript object.

```ts
sync(location: string): Promise<any>
```

- Performs a deep clone (via `stringify`/`parse` with BigInt support) so contracts receive a plain, side-effect-free object.
- If the location does not exist or cannot be synced, the evaluation is **invalidated** and an error is thrown.

#### `decode`

Parses a Bitcoin transaction ID and returns its Bitcoin Computer metadata if it is a valid Bitcoin Computer transaction.

```ts
decode(txId: string): Promise<TransitionJSON>
```

Returned shape (approximate):

```ts
{
  exp: string
  env?: { [s: string]: string }
  mod?: string
}
```

- If `mod` is falsy in the raw transition, it is normalized to `undefined`.
- If the `txId` is malformed or does not correspond to a Bitcoin Computer transaction, the evaluation is **invalidated**.

#### `load`

Dynamically loads a module by its specifier (location) and returns its exports.

```ts
load(location: string): Promise<Record<string, any>>
```

- Useful for importing shared contract logic or libraries inside a contract method.
- If the module specifier is invalid or the module cannot be loaded, the evaluation is **invalidated**.

#### `getAncestors`

Returns the full ancestry chain for a revision/location as an array of revision identifiers.

```ts
getAncestors(location: string): Promise<string[]>
```

- Returns `[]` if there are no ancestors.
- If the location is invalid or cannot be resolved, the evaluation is **invalidated**.
- This is the recommended safe way to traverse history without risking invalidation from `next()`.

#### `first`

Returns the very first (root/original) revision in the lineage of the given revision.

```ts
first(rev: string): Promise<string>
```

- Always returns a `string` for a valid revision.
- Invalidates the evaluation if the revision does not exist.

#### `prev`

Returns the immediately preceding revision in the lineage, or `undefined` if the given revision is the first in its chain.

```ts
prev(rev: string): Promise<string | undefined>
```

- Safe to call on any revision: if there is no previous revision, it returns `undefined` **without** invalidating the contract.
- Only invalidates on malformed input or internal retrieval errors.

#### `next`

Returns the immediately following revision in the lineage.

```ts
next(rev: string): Promise<string | undefined>
```

- **Critical behavior**: If there is no next revision (i.e. you are at the tip of the lineage), this function **invalidates the entire contract evaluation** and throws.
- This is stricter than `prev()`. Use it only when you are certain a next revision must exist, or prefer `last()` / `getAncestors()` for safer traversal.
- Invalidates on malformed input or retrieval errors as well.

#### `last`

Returns the most recent (tip) revision in the lineage of the given revision.

```ts
last(rev: string): Promise<string | undefined>
```

- Returns the current latest revision for that object lineage.
- Only invalidates on errors retrieving the lineage; may return `undefined` in edge cases without invalidation.

#### `txIdToBlockTime`

Returns the Unix block time (as `bigint`) at which the given transaction was included in a block.

```ts
txIdToBlockTime(txId: string): Promise<bigint | undefined>
```

- Useful for time-based logic inside contracts (e.g. vesting, expiration, chess time locks).
- If the transaction is not found or has no associated block time (e.g. unmined or non-Bitcoin-Computer tx), the evaluation is **invalidated**.

### Usage Notes & Best Practices

1. **Prefer safe traversal methods**: Use `getAncestors()`, `first()`, `last()`, and `prev()` when exploring history. Reserve `next()` for cases where you have already verified a successor must exist.
2. **Handle `undefined`**: Several functions (`prev`, `last`, possibly `txIdToBlockTime`) can legitimately return `undefined`. Always check before using the result.

This querying API, combined with the strict property update rules of `Contract`, enables powerful, verifiable, and safe on-chain logic while protecting the network from non-deterministic or invalid contract executions.
