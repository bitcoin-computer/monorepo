# broadcast

_Broadcasts a Bitcoin transaction._

## Type

```ts
;(tx: NakamotoJS.Transaction) => Promise<string>
```

### Parameters

#### `tx`

A NamamotoJS [transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/ts_src/transaction.ts) object.

### Return Value

If the broadcast is successful, it returns the transaction id. Otherwise, an error is thrown.

## Examples

```ts
class C extends Contract {}
const transition = { exp: `${C} new C()` }
const { tx } = await computer.encode(transition)

// Broadcast transaction
const txId = await computer.broadcast(tx)
```
