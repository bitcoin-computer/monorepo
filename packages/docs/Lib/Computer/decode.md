# decode

_Inputs a Bitcoin transaction or a transaction id and returns its metadata if it is a Bitcoin Computer **transition** transaction (smart object create/update)._

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

The `decode` function takes a Bitcoin transaction or a transaction ID as input and retrieves the associated **transition** metadata if the transaction is a Bitcoin Computer smart-object transaction. This metadata includes the JavaScript expression, any environment variables, and an optional module specifier (the module used when evaluating the expression—not the module source itself).

**Module deploy transactions are not transitions.** If `tx` is a module deploy (multisig cleartext `{ ept }` in data outputs, or a taproot reveal with protocol id `BC` in the witness), `decode` throws an error instructing you to use [`computer.load`](./load.md) instead. To inspect raw module payloads without evaluating them, see [`Transaction.onChainMetaData`](../Transaction/index.md#onchainmetadata) (multisig) or `Computer.getInscription(rawTx, index)` (taproot witness).

## Example

:::code source="../../../lib/test/lib/computer/decode.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/decode.test.ts" target=_blank>Source</a>
