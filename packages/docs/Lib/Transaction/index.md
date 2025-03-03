---
icon: unread
---

<style>
  .h3-mono {
    /* font-size: 22.2px; */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-weight: 700
  }
</style>

# Transaction

The `Transaction` class exported from `@bitcoin-computer/lib` extends the `Transaction` class exported from `@bitcoin-computer/nakamotojs` and therefore has all of its properties and methods (see [here](../../NakamotoJs/index.md)).

In addition it has methods and properties related to the Bitcoin Computer protocol, as well as convenience methods for developing Bitcoin-based applications.

## Properties

### <span class="h3-mono">inRevs</span>

Returns the revisions of on-chain objects spent by the transaction.

### <span class="h3-mono">outRevs</span>

Returns the revisions of on-chain objects created by the transaction.

## Methods

### <span class="h3-mono">fromTxId</span>

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

<!-- ### <span class="h3-mono">fromHex</span>

Returns a `Transaction` object from a transaction hex.

### <span class="h3-mono">fromBuffer</span>

Returns a `Transaction` object from a transaction buffer. -->

### <span class="h3-mono">onChainMetaData</span>

Returns a `Transaction` object from a transaction buffer.

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

// tx1'2 metaData contains the constructor call
expect(tx1.onChainMetaData).deep.eq({
  exp: `${A} new A()`,
  env: {},
  mod: '',
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
  mod: '',
  v: Computer.getVersion(),
  ioMap: [0],
})
```
