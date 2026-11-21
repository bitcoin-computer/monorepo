---
icon: link
---

# Cross-chain reads

Inside a contract, every [InnerComputer](./index.md#querying-inside-of-a-contract) method can read another built-in chain. The host chooses the node. The contract passes `{ chain }` as the second argument. The outer [`Computer`](../Computer/index.md) does not take that argument. A host that wants a live object on another chain constructs a `Computer` for that chain.

The node URL is [`remoteChains`](../Computer/constructor.md) on the computer that evaluates the contract. Each entry is `{ url }` for one other built-in chain. This computer’s own chain is not a key. The contract cannot pass a URL.

## Argument order

The subject comes first. The second argument is a plain object, `{ chain }`. `chain` is the chain name. Omit the argument, or omit `chain`, to read this computer. Passing `undefined` counts as a second argument and invalidates. Each method is typed as one argument, or a required `{ chain }` object, the same two forms as `sync`.

```ts
sync(location, { chain }?)
decode(txId, { chain }?)
load(location, { chain }?)
getAncestors(location, { chain }?)
first(rev, { chain }?)
prev(rev, { chain }?)
next(rev, { chain }?)
last(rev, { chain }?)
txIdToBlockTime(txId, { chain }?)
txIdToBlockHeight(txId, { chain }?)
txIdToBlockHash(txId, { chain }?)
getBlockHash(height, { chain }?)
getBlockHeight(hash, { chain }?)
getRawTransaction(txId, { chain }?)
getRawBlock(blockHash, { chain }?)
getBlockHeader(blockHash, { chain }?)
getTXOs(query, { chain }?)
getOTXOs(query, { chain }?)
```

```ts
await computer.sync(btcRev, { chain: 'BTC' })
await computer.prev(rev, { chain: 'BTC' })
await computer.getTXOs(query, { chain: 'BTC' })
await computer.getOTXOs(query, { chain: 'BTC' })
```

One argument is a read of this computer’s chain. That includes `sync('BTC')`, `getBlockHash('BTC')`, and `getTXOs('BTC')`: the string is a location, a height, or a query, not a chain name. `{ chain: 'LTC' }` on a Litecoin computer is that same read. The published type is the uppercase id. Any other case is accepted at runtime and read as that id. Keys in `remoteChains` are already the uppercase id. `{}` is that same read, because `chain` is omitted.

The second argument has to be a plain object. A string, a number, `null`, or an array invalidates. The only key is `chain`; `sync` also takes `class` and `exact` (see [`sync`](../Computer/sync.md#instanceof)). Any other key invalidates, so a later option can be added without a new positional argument. A third argument invalidates. A value that is not a string in `chain` invalidates. An unknown chain, or a chain with no `remoteChains` entry, invalidates.

`chain` is not a field of a `getTXOs` or `getOTXOs` query. A query that contains `chain` is an unknown parameter and invalidates.

A revision that comes back is `txid:vout`. It has no chain prefix. Passing that revision to a one-argument method reads this computer’s chain, not the chain the revision was read from.

## Same rules, on that chain

`chain` does not add a new read. It runs the one-argument method against the named chain’s node. Confirmation, the block tip, and the indexed prefix are that chain’s.

- `sync` returns the same plain JSON as a one-argument `sync`: methods are removed, `bigint` is kept, and a missing or unconfirmed location invalidates. When `chain` is set, a location that is not a transaction id or revision also invalidates. Calling a method on the JSON throws a normal JavaScript error and does not invalidate.
- `prev` of a confirmed root returns `undefined` and does not invalidate.
- `next` with no confirmed successor invalidates. `last` invalidates unless the tip is spent by a confirmed transaction.
- `getBlockHash` rejects a height above that chain’s tip.
- `getTXOs` and `getOTXOs` still require a stabilizer (`lteBlockHeight`, `blockHeight`, or `blockHash`). The height has to be inside that chain’s tip and its indexed prefix. `getOTXOs` still sets `isObject: true` and does not filter on spentness.
- `getAncestors` returns the ancestor set. The order of that array is not part of the result.
- `getBlockHeight`, `getRawBlock`, and `getBlockHeader` still answer for the hash they are given. They do not gain a best-chain check.

`try/catch` does not commit a read that marks the evaluation. The public error does not include the node URL. It ends with one copy of “Accessing non-existent on-chain state inside a smart contract is forbidden.”

These locations do not use `sync`’s location check. `load`, `getAncestors`, `first`, `prev`, `next`, and `last` parse a revision inside their own body. A value that is not a revision throws `Invalid Rev` and does not mark the evaluation, even when `{ chain }` is set. By contrast, `sync(notARev, { chain })` marks the evaluation. `sync(notARev)` and `sync(notARev, {})` do not: an omitted `chain` is treated as a one-argument read.

## Code that runs

`sync` replays the transition on that chain. `load` evaluates the module there. Data exports are the stable result. A function exported by the module, called after `load` returns, runs on the computer of the evaluation that called it. Called from the home contract, that is the home chain.

A deployed module cannot use top-level `await`. The compartment evaluates the module as a script, and the failure is reported as `Revision … not found by load.`

`decode` returns the expression. It does not run it.

## Example

On a local regtest, `npm run up:regtest` in `packages/node` publishes one node per chain. With the quickstart `.env`, LTC is `http://127.0.0.1:1031` and BTC is `http://127.0.0.1:1032`. That command mounts a copy of each chain's example conf. `npm run up` mounts the package-root conf instead. See [Several regtest chains](../../Node/index.md#several-regtest-chains).

```ts
const ltc = new Computer({
  chain: 'LTC',
  url: ltcUrl,
  remoteChains: { BTC: { url: btcUrl } },
})

class Reader extends Contract {
  n!: number
  genesis!: string
  count!: number

  constructor() {
    super({ n: 0, genesis: '', count: 0 })
  }

  async pin(location: string) {
    const obj = await computer.sync(location, { chain: 'BTC' })
    this.n = obj.n
    this.genesis = await computer.getBlockHash(0, { chain: 'BTC' })
    const rows = await computer.getTXOs({ lteBlockHeight: 0 }, { chain: 'BTC' })
    this.count = rows.length
  }
}
```

`this.n` and `this.genesis` are Bitcoin’s. A later `computer.sync(ltcRev)` in the same method, with no options argument, still reads Litecoin. A contract method cannot return that object literal. Store the fields on `this`.

## What this is not

The contract cannot spend, sign, fund, or broadcast on the other chain. Stored revisions stay `txid:vout`. A second argument that is not a plain object, an unknown key, a third argument, a `chain` that is not a string, an unknown chain, a chain with no `remoteChains` entry, and a node that does not answer all invalidate.
