---
title: Introduction
sidebar_position: 1
---

# Introduction to Bitcoin Computer

_Bitcoin Computer lets you build decentralized applications directly on Bitcoin,
Litecoin, Dogecoin, Pepecoin, and other UTXO-based blockchains using ordinary
JavaScript and TypeScript._

You define smart contract classes exactly like normal JavaScript classes. When
you create an instance or call a method that changes state, the library turns
that operation into a Bitcoin transaction. Everyone who replays the same
transactions ends up with identical application state — consensus comes directly
from Bitcoin.

The result is a developer experience that feels familiar while giving you
Bitcoin’s native ownership model, predictable costs, and strong security
guarantees.

## Why Bitcoin Computer?

Bitcoin Computer eliminates the difficult trade-offs developers normally
encounter when building on UTXO-based blockchains.

**Familiar developer experience**  
Write smart contracts in JavaScript or TypeScript using the tools, patterns, and
libraries you already know. There is no new language to learn and no new virtual
machine to master.

**Native ownership with automatic consent**  
Smart objects are bound to Bitcoin outputs. You can only update an object if you
can spend the output that holds it — giving your data the same ownership
protections as regular Bitcoin.

**Security that is easy to reason about**  
An object can only be changed by calling one of the methods you defined on its
class. Direct property assignment, method replacement, prototype changes, and
`super` calls are blocked at runtime by a dual-layer proxy system.

**Efficient scaling**  
The system uses node copying (see Driscoll, 1989) to maintain a partially
persistent object graph so that unchanged parts of the state are shared between
revisions. Applications only load and re-execute the objects they actually
depend on.

**Multichain by default**  
Change a single configuration value and the same contract code runs on Bitcoin,
Litecoin, Dogecoin, Pepecoin, or any other supported UTXO chain.

:::info[Key Difference from Other Smart Contract Platforms]

On most smart contract platforms, every node must re-execute every transaction
to maintain a shared global state. As the network becomes more decentralized,
total computational work grows with the number of nodes.

Bitcoin Computer has no such requirement. Smart contract logic executes only for
the parties participating in each transaction; uninvolved parties perform no
computation.

As a result, the cost of sophisticated smart contracts does not increase with
network size. This makes computationally complex decentralized applications
economically practical in ways that global-execution platforms cannot support.
:::

## What Bitcoin Computer Is Not

Most Bitcoin smart contract and L2 projects introduce centralizing components
such as sequencers, admin keys, bridges, or separate consensus layers. Bitcoin
Computer avoids them entirely.

- **No sequencer or privileged operator** — Application state changes are
  ordinary Bitcoin transactions. There is no centralized or semi-centralized
  sequencer that can order, censor, or delay them. Transaction ordering is
  performed by the base chain’s miners.

- **No admin keys, upgradeability, or pause mechanisms** — Deployed contracts
  have no team-controlled multisig or privileged path that can alter logic or
  halt execution. A strict dual-layer proxy system ensures that only the methods
  defined on the class can mutate state. Direct assignment, method replacement,
  prototype changes, and `super` calls are blocked at runtime.

- **No bridge or wrapped-asset custody** — Smart objects _are_ Bitcoin (or
  Litecoin, etc.) UTXOs. Ownership and update rights are native: you can only
  spend or update what you control. Creating or changing a reference to another
  object requires the target owner’s co-authorization in the same transaction.

- **No separate sidechain consensus or validator set** — All state transitions
  are real, verifiable transactions on the base UTXO chain. There is no new
  consensus mechanism, federated peg, or weaker security model.

- **No global shared-state execution** — Smart contract logic executes locally
  on the devices of the participating parties only. A partially persistent
  object graph (node-copying with explicit version handles) ensures unchanged
  state is reused efficiently across revisions.

- **Not limited to simple tokens or client-side validation** — You get full
  Turing-complete smart contracts in JavaScript/TypeScript, including objects,
  methods, references, history inspection, and atomic multi-party coordination —
  all while producing public, replayable on-chain transactions.

- **No new gas token or fee abstraction** — The system uses the native chain’s
  transaction fees directly.

In short, Bitcoin Computer adds no new trusted intermediary between developers
and Bitcoin’s security model. It delivers general-purpose smart contracts whose
ownership, consent, and security properties are native to the UTXO model.

## How the Programming Model Works

Bitcoin Computer makes smart contract development feel like normal
object-oriented programming while automatically enforcing Bitcoin’s ownership
rules and security model. A few key ideas enable this.

- **Revisions instead of direct mutation** — Every state change is bound to a
  **specific, immutable revision** of an object (a particular UTXO) rather than
  to the latest mutable state. When you build a transaction with `encode` or
  `encodeCall`, you explicitly choose the input revisions. This gives you full
  visibility into the exact future state before anyone signs, makes conflicts
  explicit and recoverable, and enables safe atomic multi-party coordination.

- **References carry real ownership consent** — When one smart object creates or
  changes a reference to another, the owner of the target object must
  co-authorize the Bitcoin transaction. You cannot unilaterally create
  dependencies on other people’s objects. This is the smart contract equivalent
  of “you cannot spend someone else’s UTXO without their signature.” It delivers
  Bitcoin-native ownership and consent without bridges or extra trust
  assumptions.

- **Only methods can change state** — Smart contract instances are protected at
  runtime by a dual-layer proxy system. Only the methods you defined on the
  class can modify them. Direct property assignment, method replacement,
  prototype changes, and `super` calls are blocked. State can only change
  through code you wrote.

- **Local execution with future-state visibility** — All computation happens on
  your machine. You can inspect the exact objects and environment a transaction
  will produce before it is broadcast or co-signed by others. Because
  transitions are bound to specific revisions (not “latest state”), conflicts
  are explicit and easy to recover from.

- **TypeScript that matches runtime behavior** — Methods that produce on-chain
  effects are lifted to return promises. The type system provides exact shapes,
  safely handles nesting and cycles via “Root unification,” and includes helpers
  like `precise()` and `branded()` for when you need stronger guarantees or
  metadata types.

These ideas create a familiar programming model with strong guarantees around
ownership, security, and predictability. The Architecture section explains how
they are implemented in more detail.

## What Does It Feel Like to Use?

You work with ordinary JavaScript or TypeScript classes that extend `Contract`.
The library turns method calls that change state into Bitcoin transactions,
while giving you a familiar, imperative programming model.

### The High-Level Experience (Recommended)

Most of the time you use the high-level API. Creating an object or calling a
mutating method feels like normal object-oriented code:

```ts
class Counter extends Contract {
  n: number;

  constructor() {
    super({ n: 0 });
  }

  inc() {
    this.n += 1;
  }
}

const counter = await computer.new(Counter); // → SmartContract<Counter>
await counter.inc(); // builds, funds, signs & broadcasts a tx
console.log(counter.n); // 1 (local object is updated)
```

- `computer.new(Class, args?, mod?)` creates a new smart object on-chain and
  returns a fully typed, proxied instance.
- Calling a method that mutates state (`await instance.method(...)`)
  automatically constructs the transaction, funds it from your wallet, signs it,
  broadcasts it, and updates the local object with the new `_rev`.
- Methods that only read state execute quickly and resolve without creating a
  transaction (though they still go through the secure evaluation pipeline).
- Plain property access and getters are synchronous.

Every smart object carries Bitcoin Computer metadata (`_id`, `_rev`, `_root`,
`_owners`, `_satoshis`, `_readers`, `_url`) that is automatically kept
consistent.

### Security You Can Feel

The objects you work with are protected by a dual-layer security proxy. You
**cannot** mutate them directly:

```ts
counter.n = 5; // throws: "Cannot set property 'n' directly"
counter.inc = function () {}; // throws: "Cannot define or update a function..."
Object.setPrototypeOf(counter, {}); // throws
```

All changes must go through the methods you defined on the class. This is
enforced at runtime even if someone tries to bypass TypeScript.

### Inside Contract Methods: The `computer` Global

When your contract methods run, they have access to a global `computer` object.
This lets you deterministically read any on-chain state:

```ts
class Escrow extends Contract {
  // ...

  async claim(tokenRev: string) {
    const token = await computer.sync(tokenRev); // InnerComputer.sync
    if (token.amount > 0) {
      // complex conditional logic based on real on-chain data
    }
  }
}
```

**Important distinction**: The `computer` available _inside_ your contract
methods is a restricted `InnerComputer`. It only exposes safe read operations
(`sync`, `decode`, `load`, `first`/`prev`/`next`/`last`, `getAncestors`, etc.).
It cannot create or broadcast transactions. This is a deliberate security
boundary. The implementation also uses a global invalid-state flag as a safety
net: if a contract attempts to access non-existent on-chain state, the entire
evaluation is rejected.

### Low-Level Control for Complex Protocols

For atomic multi-party interactions (swaps, AMMs, games with deposits,
conditional escrows, etc.) you drop down to the lower-level `encodeCall` /
`encode` APIs. These let you build a transaction _without_ immediately
broadcasting it:

```ts
// Seller side
const { tx, effect } = await sellerComputer.encodeCall({
  target: nft,
  property: "sell",
  args: [payment],
});

// Inspect the exact future state before anyone signs
console.log(effect.res); // the resulting objects after the transaction
console.log(effect.env); // the full post-transaction environment

// Buyer signs the same transaction
await buyerComputer.sign(tx);
await sellerComputer.sign(tx);

// Now broadcast
const txId = await computer.broadcast(tx);
const result = await computer.sync(txId);
```

`encodeCall` (and `encodeNew`) are convenient higher-level wrappers. They
construct a `Transition` internally and delegate to the more general `encode`
method.

When you need more control — for example to **batch multiple operations into a
single atomic transaction**, to coordinate several objects precisely, or to make
the set of inputs explicit — use `computer.encode({ exp, env, mod })` directly:

```ts
const { tx, effect } = await computer.encode({
  exp: `
    const soldNft = nft.sell(payment);
    new Receipt({ nft: soldNft, from: seller, to: buyer });
  `,
  env: {
    nft: currentNftRev,
    payment: paymentRev,
    seller: sellerRev,
    buyer: buyerRev,
  },
});
```

The key differences and advantages are:

- The `exp` can contain arbitrary JavaScript — multiple method calls, object
  creation, loops, conditionals, etc. Everything executes atomically in one
  transaction.
- The `env` maps names used in `exp` to the exact revisions that will become the
  smart-object inputs of the Bitcoin transaction.
- You still receive both the un-broadcast transaction `tx` and an `effect`
  (`res` + updated `env`) so you can inspect the precise future state before any
  party signs or broadcasts.

Because transitions are always bound to **specific, immutable revisions**
(particular UTXOs) rather than to the latest mutable state, conflicts are
explicit and recoverable. If another transaction spends one of your inputs, your
transaction fails cleanly. In the low-level path you already hold the exact
resulting `effect` before broadcasting; after a failure you can simply re-encode
against the current revisions and decide — with full visibility into the new
outcome — whether to proceed, adapt, or abort.

`decode(tx)` is the inverse of `encode` for any state-changing transition. This
makes it easy to inspect, modify, or re-encode transactions in complex
workflows.

This pattern is used heavily in real applications (see the Swap, AMM, and Chess
examples in the test suite). You get full visibility and control while still
benefiting from the library’s transaction construction and state reconstruction
logic.

### TypeScript Support

TypeScript users get excellent IDE support out of the box:

- Methods that produce on-chain effects are automatically **lifted** to return
  `Promise<SmartContract<R>>`.
- `precise<typeof MyClass>(obj)` gives you safe narrowing to a specific contract
  type.
- `branded(obj)` lets you work with the fully branded `Id` / `Rev` / `Root`
  types when you need them.
- The type system enforces exact structural types (`Exact` / `DeepExact`) and
  safely handles cycles via “Root unification”.

### Modules

Reusable contract code is deployed and loaded as modules:

```ts
const mod = await computer.deploy(`export ${MyContract}`);
const instance = await computer.new(MyContract, args, mod);

const ns = await computer.load(mod); // inside or outside contracts
```

## What You Can Build

Because smart contract logic executes locally for only the small number of
interested parties, complex conditional behavior, history inspection, and
multi-object coordination become orders of magnitude cheaper than on
account-model chains. This cost advantage makes entire categories of
applications practical that would otherwise be economically infeasible.

### Programmable Escrows with Strong Guarantees

You can build sophisticated escrow contracts whose release conditions inspect
on-chain state, enforce complex multi-party rules, or depend on verifiable
timing. These escrows can safely audit full histories of deposits and claims
while preserving strict no-inflation invariants—even when the escrow logic
itself is buggy or adversarial. This enables trust-minimized conditional
settlement for marketplaces, collateralized lending, prediction markets, and
cross-chain value with provable backing.

### On-Chain Games and Interactive Protocols

Rich, stateful games and interactive experiences become viable. Players can
deposit value, make moves that update shared state or transfer control, and
settle outcomes atomically. Because only participants re-execute the logic, you
can support deep game trees, history-dependent win conditions, and many
concurrent sessions without prohibitive costs or global state bloat.

### Atomic Multi-Party Composition

The `encode` and `encodeCall` workflow lets you construct a transaction, inspect
the exact future state it will produce, and have multiple parties co-authorize
it. This makes atomic protocols practical—coordinating many objects and
contracts in a single step. It powers advanced swaps, automated market makers
with individual liquidity positions, royalty-bearing sales, fee splitting, and
other composable financial primitives that would otherwise require fragile
sequences of transactions.

### Programmable Tokens with Real Business Logic

Tokens can embed sophisticated on-chain behavior—dynamic rules, built-in escrow
and vesting, state sanitization on transfer, and cross-chain provenance
guarantees—because even non-trivial methods remain cheap to execute locally.

### History-Aware and Auditable Systems

Applications that traverse revision histories, aggregate data across
interactions, or prove invariants over time become practical. Efficient
persistent data structures combined with cheap client-side evaluation enable
on-chain provenance, reputation systems, supply-chain verification, and other
audit-intensive use cases.

These patterns are powered by the same tools you use daily: the global
`computer` object for deterministic on-chain reads inside contracts, the
`encode` + `effect` workflow for safe multi-party transactions, and reusable
modules for composing sophisticated behavior. The result is a platform where
sophisticated decentralized applications become practical.

The architectural ideas that make this possible—partially persistent objects,
deterministic on-chain reads, strong runtime security, and type-safe method
lifting—are covered in the next section.

## Getting Started

Ready to try it?

- Follow the [Quickstart](getting-started/quickstart) to deploy your first
  contract in minutes.
- Learn the core concepts (revisions, transitions, modules, evaluation) in the
  [Concepts](/docs/concepts/) section.
- Work through guided examples in the [Tutorials](/docs/tutorials/).
- Find every method and type in the [Reference](/docs/reference/).

Join the community on [Telegram](https://t.me/thebitcoincomputer) or
[X](https://x.com/BTC_Computer). Try the live wallet at
[wallet.bitcoincomputer.io](https://wallet.bitcoincomputer.io/).
