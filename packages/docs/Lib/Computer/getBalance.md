# getBalance

_Returns the balance in satoshi._

## Type

```ts
;() => Promise<{ balance: bigint; confirmed: bigint; unconfirmed: bigint }>
```

### Return Value

The current balance in Satoshi.

## Description

Returns the confirmed balance in Satoshi, the unconfirmed balance, and the total balance in satoshi.

## Example

:::code source="../../../lib/test/lib/computer/get-balance.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-balance.test.ts" target=_blank>Sources</a>
