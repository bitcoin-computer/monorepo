# decode

_Inputs a Bitcoin transaction or a transaction id and returns its metadata if it is a Bitcoin Computer transaction._

## Type

```ts
;(tx: NakamotoJS.Transaction | string) =>
  Promise<{
    exp: string
    env?: { [s: string]: string }
    mod?: string
  }>
```

### Parameters

#### `tx`

A NakamotoJS [transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/ts_src/transaction.ts), or a string representing a transaction ID.

### Return Value

An object containing the following properties:

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| exp | The JavaScript expression of the transaction |
| env | A mapping from variable names to revisions |
| mod | A module specifier |

## Description

The `decode` function takes a Bitcoin transaction or a transaction ID as input and retrieves the associated metadata if the transaction is a Bitcoin Computer transaction. This metadata includes the JavaScript expression, any environment variables, and an optional module specifier.

## Example

:::code source="../../../lib/test/lib/computer/decode.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/decode.test.ts" target=_blank>Source</a>
