---
icon: unread
---

# Transaction

The `Transaction` class exported from `@bitcoin-computer/lib` extends the `Transaction` class exported from `@bitcoin-computer/nakamotojs` and therefore has all of its properties and methods (see [here](../../NakamotoJs/index.md)).

In addition it has methods and properties related to the Bitcoin Computer protocol, as well as convenience methods for developing Bitcoin-based applications.

## Properties

### <span class="mono">inRevs</span>

Returns the revisions of on-chain objects spent by the transaction.

### <span class="mono">outRevs</span>

Returns the revisions of on-chain objects created by the transaction.

### <span class="mono">onChainMetaData</span>

Parses the Bitcoin Computer metadata embedded in the transaction’s data outputs (when present) and returns a JSON object.

There are two protocol shapes:

#### Transition transactions (smart object create / update)

Metadata for expressions looks like:

```ts
{
  exp: string              // JavaScript expression
  env: { [name: string]: number }  // free variables → input indexes
  mod?: string             // optional module specifier
  v: string                // protocol version
  ioMap: number[]          // maps owner outputs to spent inputs
}
```

Optional encryption (`_readers`) and off-chain storage (`_url`) apply only to this shape. See [how it works](../../how-it-works.md).

#### Module deploy transactions (multisig storage)

Module deploys are **not** transitions. Multisig module metadata is cleartext and contains only the module source:

```ts
{
  ept: string // ECMAScript module source text
}
```

There is no `exp`, `env`, `mod`, or `v` field. Owner outputs are still created so the UTXO graph remains consistent (and appears in the node `Output` table).

Use [`computer.load`](../Computer/load.md) to evaluate a module. [`computer.decode`](../Computer/decode.md) rejects module deploy transactions.

#### Taproot module deploys

With `moduleStorageType: 'taproot'`, the module source is **not** in `onChainMetaData`. It lives in the reveal transaction’s input witness, inside a script-path envelope tagged with protocol id `BC` (Bitcoin Computer modules). Content type is typically `text/javascript`. In that case `onChainMetaData` is empty or unrelated payment data; recover the body with [`computer.load`](../Computer/load.md) or `Computer.getInscription(rawTx, inputIndex)`.

## Methods

### <span class="mono">fromTxId</span>

<!-- ```js
static fromTxId({
  txId,
  restClient,
}: {
  txId: string
  restClient: RestClient
}): Promise<Transaction>
``` -->

Returns a `Transaction` object from a transaction id.

<!-- ### <span class="mono">fromHex</span>

Returns a `Transaction` object from a transaction hex.

### <span class="mono">fromBuffer</span>

Returns a `Transaction` object from a transaction buffer. -->

## Example

```js
class A extends Contract {
  n: number
  constructor() {
    super({ n: 1 })
  }

  inc() {
    this.n += 1
  }
}

// Create and fund client side wallet
const computer = new Computer()
await computer.faucet(1e8)
const { wallet } = computer
const { restClient } = wallet

// Create on-chain object and retrieve its transaction
const a = await computer.new(A)
const txId1 = a._id.slice(0, 64)
const tx1 = await Transaction.fromTxId({ txId: txId1, restClient })

// tx1's inRevs and outRevs reflect the objects creation
expect(tx1.inRevs).deep.eq([])
expect(tx1.outRevs).deep.eq([a._id])

// tx1's metaData contains the constructor call (transition shape)
expect(tx1.onChainMetaData).deep.eq({
  exp: `${A} new A()`,
  env: {},
  mod: undefined,
  v: Computer.getVersion(),
  ioMap: [],
})

// Update on-chain object and retrieve its transaction
await a.inc()
const txId2 = a._rev.slice(0, 64)
const tx2 = await Transaction.fromTxId({ txId: txId2, restClient })

// tx2's inRevs and outRevs reflect the objects update
expect(tx2.inRevs).deep.eq([a._id])
expect(tx2.outRevs).deep.eq([a._rev])

// tx2's metaData contains the function call
expect(tx2.onChainMetaData).deep.eq({
  exp: `__bc__.inc()`,
  env: { __bc__: 0 },
  mod: undefined,
  v: Computer.getVersion(),
  ioMap: [0],
})

// Multisig module deploy: metadata is { ept }, not a transition
const modSpec = await computer.deploy('export const x = 1')
const modTxId = modSpec.slice(0, 64)
const modTx = await Transaction.fromTxId({ txId: modTxId, restClient })
// When moduleStorageType is 'multisig':
// expect(modTx.onChainMetaData).deep.eq({ ept: 'export const x = 1' })
```
