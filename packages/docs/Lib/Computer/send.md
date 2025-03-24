# send

_Sends a payment._

## Type

```ts
;(amount: bigint, address: string) => Promise<string>
```

### Parameters

#### `amount`

A number representing the amount of satoshis to be sent.

#### `address`

An string encoding the receiver address.

### Return Value

If successful, it returns the id of the transaction broadcast.

## Example

:::code source="../../../lib/test/lib/computer/send.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/send.test.ts" target=_blank>Sources</a>
