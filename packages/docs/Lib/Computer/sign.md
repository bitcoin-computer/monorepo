# sign

_Signs a Bitcoin transaction._

## Type

```ts
;(
  tx: NakamotoJS.Transaction,
  opts: {
    inputIndex?: number
    sighashType?: number
    inputScript?: Buffer
  },
) => Promise<void>
```

### Parameters

#### `tx`

A Bitcoin transaction, possibly partially signed.

#### `opts`

The `opts` object can have the following properties:

{.compact}
| Key | Type | Description |
|-------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| inputIndex | number | The input index to be signed |
| sighashType | number | A valid <a target="_blank" href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/src/transaction.d.ts">sighash type number</a> |
| inputScript | Buffer | A buffer encoding the signature |

### Return Value

The function returns `void`.

## Description

By default, the `sign` function will make a best effort to sign all inputs, but will not throw an error if the signature cannot be added due to hash mismatch.

This is useful in the case of partially signed transactions, where a user can encode an expression, sign with the user private key and send the generated partially signed transaction to another user. Then, the receiver can sign other inputs.

## Example

:::code source="../../../lib/test/lib/computer/sign.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/sign.test.ts" target=_blank>Sources</a>
