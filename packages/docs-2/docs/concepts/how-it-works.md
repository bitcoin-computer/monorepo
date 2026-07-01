---
title: "How It Works"
---

# How It Works

## Under the Hood (Technical Foundation)

The library is built on four core technical ideas that together solve several
long-standing challenges when building applications on UTXO chains.

> **For technical readers**: The footnotes at the end of this page provide
> precise details on the underlying algorithms, security model, and type system.

### 1. Partially Persistent Objects with Built-in Consent

Smart objects are stored using a **partially persistent data structure**[^1].
Every version of an object has its own identity and can be accessed
independently. When you update an object, only the paths to the changed data is
copied, unchanged parts of the data structure are shared with previous versions.
This produces an efficient, immutable history that can be reconstructed on
demand while keeping memory usage and on-chain transaction sizes low.

Because the system runs on a blockchain with explicit ownership, it adds an
important consent rule on top of classical persistence: when you create or
change a reference from object A to object B, the library eagerly copies B into
the new version[^2]. This forces B’s current owner to co-authorize the
transaction. Predecessor propagation then ensures that every object pointing to
B is also refreshed atomically. Objects that B itself points to remain
untouched.

Every in-flight version is represented by an explicit `VersionHandle`[^3]. This
handle owns private sets of active nodes, mutated nodes, and newly created nodes
for that specific evaluation. The design removes all global mutable state from
the persistence layer, enables safe concurrent evaluation, and makes both
pre-commit and post-commit rollback correct and idempotent.

All structural changes are applied in two strictly separated phases[^4]. The
first phase writes scalar information fields and deletions without touching any
pointers. Only in the second phase are references established and predecessor
propagation performed. This ordering is essential when objects contain mutual or
cyclic references, because it prevents the system from updating inverse-pointer
snapshots while the graph is still being constructed.

When a side input has been updated by another transaction since it was last
read, the evaluation layer automatically detects the stale side-predecessor,
rolls back the temporary version, refreshes the relevant history, and retries
the transition (up to a configurable limit). This ensures correctness and
liveness in concurrent and multi-party scenarios without requiring application
code to manage versioning.

The library reconstructs objects on demand and preserves their original
prototypes so that `instanceof` checks and methods continue to work as expected.

### 2. The Inner Computer — Deterministic On-Chain Read Access

Inside every contract method you have access to a global `computer` object that
provides deterministic, read-only access to on-chain state. You can fetch other
smart objects with `sync(rev)`, inspect historical transactions with
`decode(txId)`, traverse ancestor chains, follow revision history with
`first`/`prev`/`next`/`latest`, and retrieve block times with `txIdToBlockTime`.

Because every participant executes exactly the same sequence of deterministic
queries when replaying a transaction, the system remains safe and predictable.
This capability enables powerful patterns such as programmable escrows whose
release conditions can depend on the state of other contracts or on verifiable
timing information from the blockchain.

**Important design note.** These programmable conditions apply to smart objects
and tokens. The actual satoshis are still controlled by Bitcoin’s native script
derived from the object’s `_owners` field. For applications that need complex
logic over satoshis themselves, the recommended pattern is to wrap them in a
token (for example via a DEX), apply the logic, and unwrap later if needed.

### 3. Security Model

An object can only be changed by calling one of the methods you defined on its
class. Direct property assignment, method replacement, prototype changes, and
`super` calls are all blocked at runtime.

This guarantee is enforced by a **dual-layer proxy system**[^5] that wraps every
contract instance:

- The inner proxy protects the special metadata fields (`_id`, `_rev`, `_root`),
  prevents updates to functions (method immutability), blocks `__proto__`
  access, and implements the reflection traps that expose the internal brand
  symbols.
- The outer proxy ensures methods are always bound to the correct `this` and
  prevents external code from mutating the object.

All wrapped objects are registered in a recording system so the library can
detect attempts to bypass the security model. Inside contract methods, the
`computer` global provides only read-only access to on-chain data. Any failure
during these reads marks the evaluation as invalid[^6]; `Db.eval` rejects the
transition after the secure compartment returns.

There are no admin keys, no privileged operators, and no hidden bypass paths.
The only way to mutate on-chain state is through the code you wrote.

### 4. Type-Safe Method Lifting

When you call a method on a contract instance, the call may need to construct,
sign, and broadcast a Bitcoin transaction. All such methods are therefore lifted
to return `Promise` values.

The TypeScript types are generated by a covariant recursive lifting system
(`SmartContract<T>`)[^7] that:

- Preserves exact structural shape at every nesting level using `Exact<T>` and
  `DeepExact<T>`.
- Safely handles cycles via **root unification** (nested contract types collapse
  to `SmartContract<Root>`).
- Automatically lifts constructor parameters and method arguments with matching
  precision.

You can opt into fully branded metadata (`Id`, `Rev`, `Root`, `PublicKeyHex`,
etc.) using `precise(obj, { branded: true })` or the `branded()` helper[^8]. The
familiar class syntax remains unchanged; the library handles the mapping to
blockchain operations and provides full IDE support.

## Technical Footnotes

[^1]:
    Classical path-copying persistence (node-copying method). Each version is
    a chain of nodes in which only the path from a root to a mutated field is
    copied; all unchanged substructures remain shared with previous versions.
    This produces space-efficient immutable histories while supporting
    independent access to every version. See Driscoll, Sleator & Tarjan, “Making
    Data Structures Persistent,” JACM 1989.

[^2]:
    When a reference from object A to object B is created or changed, B is
    eagerly copied into the new version (performed in
    `VersionHandle.applyChanges` when processing pointer updates). This enforces
    a consent invariant: B’s current owner must co-authorize the transaction.
    Predecessor propagation then atomically refreshes every object that holds a
    reference to B via `updateInversePointers`. Objects reachable from B remain
    untouched. The rule is a blockchain-specific layer added on top of classical
    path-copying persistence to respect UTXO ownership semantics.

[^3]:
    Every in-flight transaction receives an isolated `VersionHandle` that owns
    its private `activeNodes`, `mutatedNodes`, `newNodesCreated`, and
    `propagated` sets. The design removes all global mutable state from
    `Structure` and `Cache`, enables safe concurrent evaluation, and guarantees
    that both pre-commit and post-commit rollback (via `handle.rollback()`) are
    correct and idempotent. See `cache.ts: createTransactionHandle` and
    `VersionContext`.

[^4]:
    All structural changes are applied in two strictly separated phases
    (`Cache.applyInformationPhase` followed by `applyPointerPhase`). The first
    phase writes scalar information fields and deletions without modifying any
    pointers. The second phase establishes references and performs predecessor
    propagation. The separation prevents premature inverse-pointer snapshot
    updates while objects that contain mutual references are still being
    constructed. See the ordering comment inside `VersionHandle.applyChanges`
    and the implementation in `cache.ts`.

[^5]:
    Every contract instance is wrapped by a dual-layer proxy security model
    (`InsideCallHandler` then `OutsideCallHandler`). The inner proxy enforces
    keyword protection on metadata fields, method immutability, blocks
    `__proto__` access, and implements the
    `has`/`getOwnPropertyDescriptor`/`ownKeys` traps that expose `BC_BRAND` and
    `PROXY_TAG`. The outer proxy guarantees correct `this` binding for methods
    and prevents any external mutation of the object. All wrapped instances are
    registered in a weak set (`record.ts`) so that attempts to bypass the
    security model can be detected at runtime.

[^6]:
    Inside contract methods the `computer` global exposes only deterministic,
    read-only on-chain queries. Any failure during such a query (missing
    revision, RPC error, etc.) raises an internal invalidation flag
    (`globalInvalidState` in `inner-computer.ts`). After the secure compartment
    returns, `Db.eval` inspects the flag and rejects the entire transition if it
    was set. Controlled mutations required for reconstruction and metadata
    attachment are performed under an explicit privilege guard (`_sudo` /
    `AdminContext` in `admin.ts`) that restores the normal security invariants
    afterward.

[^7]:
    The `SmartContract<T>` type is produced by a covariant recursive lifting
    transformation (a covariant recursive endofunctor over the contract class).
    Every method is lifted so that it returns `Promise<SmartContract<R>>` while
    exact structural shape is preserved at every nesting level by deep exactness
    constraints (`Exact<T>` and `DeepExact<T>`). Cycles are terminated safely by
    root unification: any nested contract type collapses to
    `SmartContract<Root>`. See `types.ts`.

[^8]:
    `precise(obj, { branded: true })` (and the `branded()` helper) narrow the
    type to a branded view of the contract. This replaces plain-string metadata
    with the branded primitives (`Id`, `Rev`, `Root`, `PublicKeyHex`, …) while
    still enforcing full structural exactness. The runtime objects already carry
    the brand symbols; the operation is a compile-time type assertion only.
