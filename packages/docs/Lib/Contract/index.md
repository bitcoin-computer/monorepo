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

Smart contracts can access a restricted global `computer` (the **InnerComputer**) to read on-chain history and block metadata. These helpers do not write blockchain state. They exist so contracts can traverse revision graphs, load modules, or base decisions on confirmed chain data in a **deterministic** way.

The outer [`Computer`](../Computer/index.md) client API is **not** the same surface: many client methods may return `undefined` for mempool data or live tips. Inside a contract, almost every “not yet known / not yet confirmed” observation **invalidates** the whole evaluation so two validators can never disagree under chain extension.

### Determinism property (observation stability)

Let `b₁` and `b₂` be chain states such that `b₂` extends `b₁` (every block and transaction present in `b₁` is also in `b₂`).

For any InnerComputer method `m` and arguments `args`:

> If `computer.m(...args)` **succeeds without invalidation** against `b₁`, then the same call against `b₂` must succeed and return the **same value**.

Successful observations must therefore be **invariant under future chain growth**. Transient facts (mempool-only txs, “no next revision yet”, unspent tip as “last”, future block heights) must not become part of a valid transition.

### How invalidation works

1. On a forbidden observation, InnerComputer marks the **current evaluation-stack frame** invalid and throws. Frames are pushed/popped around each `Db.eval` evaluate and each `Modules.load` import (not a process-wide singleton), so concurrent evaluations cannot cross-talk.
2. Free-variable `computer` in methods may be the create-time or module-load instance (SES lexical binding), different from the eval endowment. Invalidation still applies to the **active frame**, so catch-and-continue cannot soft-succeed.
3. A contract `try/catch` **cannot** clear the flag (reset requires admin privilege). After the compartment returns, `Db.eval` rejects the transition if the active frame is invalid.

#### Error message shape

All invalidation errors exposed to callers end with **exactly one** copy of:

> Accessing non-existent on-chain state inside a smart contract is forbidden.

- Direct policy rejections (for example, future `getBlockHash` height, missing `getTXOs` stabilizer) store a short reason; when the contract catches and continues, `Db.eval` re-throws via a shared formatter so the standard suffix is still present **once**.
- Uncaught throws and catch-and-continue paths therefore share the same single-suffix convention (no doubled “forbidden” text).

Clients and tests should match with `message.endsWith(...)` (or equivalent), not assume a doubled suffix.

### Confirmed locations only

Most location-based APIs require the referenced **transaction to be confirmed** (in a block) before the call may succeed. Unconfirmed / mempool locations are treated as transient.

| API                                                   | Confirmation rule                                                                                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `sync`, `decode`, `getAncestors`, `getRawTransaction` | Starting location / txId must be confirmed                                                                                        |
| `load`                                                | Module deploy location (`txId:vout`) must be confirmed                                                                            |
| `first`, `prev`                                       | Starting revision’s tx must be confirmed                                                                                          |
| `next`                                                | Starting revision **and** returned successor must be confirmed                                                                    |
| `last`                                                | Starting revision, returned tip, and the tip’s **spending** tx must be confirmed (unspent tip or mempool-only spend → invalidate) |
| `txIdToBlockTime`                                     | Tx must be confirmed (no nullish “not mined yet”)                                                                                 |
| `txIdToBlockHeight` / `txIdToBlockHash`               | Unconfirmed → invalidate (via throw / nullish fail-closed)                                                                        |
| `getTXOs` (+ `getUTXOs` / `getOTXOs` / `getOUTXOs`)   | Must include a **stabilizing filter** (below); future heights forbidden                                                           |

**App / test implication:** after `deploy`, `new`, method calls, or `delete`, wait for confirmation before on-chain code that walks history, loads modules, or calls `last` / `next` / `txIdToBlockTime` on those locations.

### Full API reference (InnerComputer)

| Function                         | Signature                         | Returns                    | Invalidates when                                             |
| -------------------------------- | --------------------------------- | -------------------------- | ------------------------------------------------------------ |
| `sync`                           | `sync(location: string)`          | Object state (deep-cloned) | Missing / unconfirmed location                               |
| `decode`                         | `decode(txId: string)`            | `{ exp, env?, mod? }`      | Missing / unconfirmed tx                                     |
| `load`                           | `load(location: string)`          | Module exports             | Missing / unconfirmed module location                        |
| `getAncestors`                   | `getAncestors(location: string)`  | `string[]` (may be empty)  | Missing / unconfirmed start; empty array is **valid**        |
| `first`                          | `first(rev: string)`              | Creation rev (`string`)    | Missing / unconfirmed start                                  |
| `prev`                           | `prev(rev: string)`               | `string \| undefined`      | Missing / unconfirmed start; **`undefined` at root is OK**   |
| `next`                           | `next(rev: string)`               | next rev (`string`)        | No next yet; unconfirmed start or unconfirmed successor      |
| `last`                           | `last(rev: string)`               | Spent tip rev (`string`)   | Unspent tip; mempool-only spend; unconfirmed start/result    |
| `txIdToBlockTime`                | `txIdToBlockTime(txId: string)`   | block time                 | Unconfirmed or missing tx                                    |
| `txIdToBlockHeight`              | `txIdToBlockHeight(txId: string)` | height                     | Unconfirmed or missing tx                                    |
| `txIdToBlockHash`                | `txIdToBlockHash(txId: string)`   | block hash                 | Unconfirmed or missing tx                                    |
| `getBlockHash`                   | `getBlockHash(height: number)`    | hash                       | Negative or **future** height; missing block                 |
| `getBlockHeight`                 | `getBlockHeight(hash: string)`    | height                     | Unknown hash                                                 |
| `getRawTransaction`              | `getRawTransaction(txId: string)` | hex                        | Unconfirmed / missing                                        |
| `getRawBlock` / `getBlockHeader` | by block hash                     | hex                        | Unknown hash                                                 |
| `getTXOs`                        | `getTXOs(q: TXOQuery)`            | revs or records            | No stabilizer; future/negative height filters; query failure |

Aliases `getUTXOs`, `getOTXOs`, and `getOUTXOs` inherit the same rules as `getTXOs`.

**`latest` is not exposed** on InnerComputer (the live tip is inherently non-deterministic under chain extension).

### Detailed notes

#### `sync` / `decode` / `load`

```ts
sync(location: string): Promise<any>
decode(txId: string): Promise<TransitionJSON>
load(location: string): Promise<Record<string, any>>
```

- `sync` deep-clones the object (BigInt-safe) so contracts cannot mutate live graph state.
- `decode` requires a confirmed Bitcoin Computer transaction.
- `load` accepts a module rev (`txId:outputIndex`); the deploy transaction must be confirmed.
- Missing or unconfirmed targets invalidate the evaluation.

#### `getAncestors`

```ts
getAncestors(location: string): Promise<string[]>
```

- Starting location must be confirmed.
- An empty array is a stable result when there are no ancestors; it does **not** require special “allow null” handling (empty arrays are not nullish).

#### `first` / `prev` / `next` / `last`

```ts
first(rev: string): Promise<string>
prev(rev: string): Promise<string | undefined>
next(rev: string): Promise<string>
last(rev: string): Promise<string>
```

- **`first`**: starting rev must be confirmed; returns the creation revision.
- **`prev`**: starting rev must be confirmed. `undefined` at the **confirmed root** is stable and does **not** invalidate. This is the only nullish success path among these helpers.
- **`next`**: “no successor yet” is transient → **invalidates**. A mempool-only successor also invalidates; the returned next rev must be confirmed.
- **`last`**: does **not** mean “current unspent tip”. An unspent tip yields `undefined` from the underlying API and **invalidates**. A definite last is the tip of a lineage whose tip is **spent in a confirmed transaction** (e.g. after a confirmed `delete`). Use this for terminal escrow checks, not for reading the live tip.

#### Block and time helpers

```ts
txIdToBlockTime(txId: string): Promise<bigint>
txIdToBlockHeight(txId: string): Promise<number>
txIdToBlockHash(txId: string): Promise<string>
getBlockHash(height: number): Promise<string>
getBlockHeight(hash: string): Promise<number>
```

- Unconfirmed transactions cannot be observed as stable times/heights/hashes.
- `getBlockHash` rejects negative heights and heights **greater than the current tip** (future blocks are non-deterministic).

#### `getTXOs` (and aliases)

```ts
getTXOs(q: TXOQuery): Promise<string[] | TXORecord[]>
```

Inside a contract the query **must** include one stabilizing filter:

- `lteBlockHeight` — must be ≤ current tip (not in the future)
- `blockHeight` — must be ≤ current tip
- `blockHash` — fixed historical block

Queries without a stabilizer, or with a future height, invalidate. Empty result sets with a valid stabilizer are fine.

### Usage notes & best practices

1. **Confirm before query.** Deploy modules, create objects, update or delete tips, then wait for confirmation before contract methods that call InnerComputer on those locations.
2. **Prefer `prev` / `getAncestors` / `first` for history walks.** Use `next` only when a confirmed successor must exist (e.g. deposit pre/post pair).
3. **Do not treat `last` as “latest live tip”.** For terminal claims, spend the tip (e.g. `delete`) and wait for confirmation, then call `last`.
4. **`try/catch` does not soft-fail invalidation.** Catching the throw still rejects the transition if the invalid flag was set. The public error still ends with a **single** “Accessing non-existent…” suffix (whether the throw was uncaught or re-raised by `Db.eval`).
5. **Stabilize TXO queries** with `lteBlockHeight`, `blockHeight`, or `blockHash`.
6. **Off-chain code** using the outer `Computer` may still see mempool data; only the in-contract `computer` global enforces these rules.

This API, together with `Contract` property rules, enables verifiable on-chain logic while keeping evaluations fail-closed under non-deterministic observations.
