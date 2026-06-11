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

## Example

:::code source="../../../lib/test/lib/computer/broadcast.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/broadcast.test.ts" target=_blank>Source</a>
