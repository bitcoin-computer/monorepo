# getUtxos

!!!
Warning: This method is deprecated and will be removed in future versions. Use `getUTXOs` instead (see https://docs.bitcoincomputer.io/Lib/Computer/getUTXOs).
!!!

_Returns UTXOs that do not contains on-chain objects._

## Type

```ts
getUtxos(address?: string): Promise<string[]>
```

### Parameters

#### `address`

The address for which to return the UTXOs. If undefined, the UTXOs for the calling object are returned.

### Return Value

Returns all unspent transaction outputs (UTXOs) of the address in question. The UTXOs are formatted as strings of the form `<transaction-id>:<output-number>`

## Description

The UTXOs returned are guaranteed to not contain any on-chain objects. This makes it possible to ensure to not spend on-chain objects by mistake.

## Example

:::code source="../../../lib/test/lib/computer/get-utxos.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-utxos.test.ts" target=_blank>Source</a>
