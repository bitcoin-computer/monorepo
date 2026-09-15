# last

_Returns the last revision of an on-chain object after its tip has been spent (for example after `delete`)._

## Type

```ts
last(rev: string): Promise<string | undefined>
```

### Parameters

#### `rev`

A revision encoded as a string of the form `<transaction-id>:<output-number>`.

### Return Value

A `Promise` that resolves to:

- The **latest revision** of the object when that tip is **spent**.
- **`undefined`** when the latest revision is still **unspent**.

## Description

Unlike [`latest`](./latest.md), which returns the current tip whether spent or unspent, `last` only returns a value when the tip is spent. That makes it suitable for **terminal** checks (escrow settlement, final withdraws) rather than reading the live tip.

Typical flow:

1. Update or finalize the object.
2. Spend the tip (for example with `delete`).
3. Wait for confirmation.
4. Call `last(rev)` to obtain the terminal revision.

### Inside smart contracts (`InnerComputer`)

Behavior is stricter than the outer client API:

- The starting revision, the returned tip, and the tip’s **spending** transaction must all be **confirmed**.
- An **unspent** tip (or a mempool-only spend) **invalidates** the evaluation — there is no stable `undefined` success path inside contracts.
- Do **not** treat `last` as “current live tip”; use confirmed history ([`first`](./first.md) / [`prev`](./prev.md) / [`getAncestors`](./getAncestors.md)) for that style of walk.

See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

```ts
const counter = await computer.new(Counter, [])
await counter.inc()

// Tip is still unspent → undefined
const open = await computer.last(counter._rev)

// Spend the tip, then last returns the terminal revision
const tip = await computer.latest(counter._id)
await computer.delete([tip])
// For InnerComputer callers: wait until the spend is confirmed
const terminal = await computer.last(counter._id)
// terminal === tip
```
