# faucet

_Funds an address on regtest for testing._

## Type

```ts
;(amount: number, address?: string) => Promise<UTXO>
```

### Parameters

#### `amount`

An amount of Satoshi, indicates the amount that should be credited

#### `address`

If set, indicated the address to be funded. If undefined the wallet of the current `Computer` object will be funded.

### Return Value

The utxo containing the funds.

## Description

Funds a `Computer` object on regtest. A second parameter can provide an address to fund, otherwise the calling object is funded. If the object is not configured to regtest an error is thrown.

## Example

:::code source="../../../lib/test/lib/computer/faucet.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/faucet.test.ts" target=_blank>Sources</a>
