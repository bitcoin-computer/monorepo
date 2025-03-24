# decode

_Parses a Bitcoin transaction and returns its metadata if it is a Bitcoin Computer transaction._

## Type

```ts
;(tx: NakamotoJS.Transaction) =>
  Promise<{
    exp: string
    env?: { [s: string]: string }
    mod?: string
  }>
```

### Parameters

#### `tx`

A NakamotoJS [transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/ts_src/transaction.ts).

### Return Value

An object containing the following properties:

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| exp | The JavaScript expression of the transaction |
| env | A mapping from variable names to revisions |
| mod | A module specifier |

## Description

The function `decode` is the inverse of `encode` when the latter is called with `exp`, `env`, and `mod`.

## Example

:::code source="../../../lib/test/lib/computer/decode.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/decode.test.ts" target=_blank>Sources</a>
