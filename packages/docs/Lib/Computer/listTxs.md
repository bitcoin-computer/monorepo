# listTxs

_Returns a incoming and outgoing transactions for a given address._

## Type

```ts
type TxIdAmountType = {
  txId: string
  inputsSatoshis: bigint
  outputsSatoshis: bigint
  satoshis: bigint
}

listTxs(address?: string): Promise<{
  sentTxs: TxIdAmountType[];
  receivedTxs: TxIdAmountType[]
}>
```

### Parameters

#### `address`

An address.

### Return Value

Two lists, `sentTxs` and `outTxs`, containing information about all transactions that have affected the balance of the address. Each list element contains the number of satoshi that were moved into and out of the address.

## Description

Todo

## Example

:::code source="../../../lib/test/lib/computer/listTxs.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/listTxs.test.ts" target=_blank>Source</a>
