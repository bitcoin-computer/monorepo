# getChain

_Returns the chain._

## Type

```ts
;() => 'LTC' | 'BTC' | 'DOGE' | 'PEPE' | 'WOJAK'
```

Supported product chains are listed in NakamotoJS `BUILTIN_CHAINS`. To add another UTXO chain, see [NakamotoJS — Adding a UTXO chain](../../NakamotoJs/index.md).

### Return Value

Returns a string encoding the chain.

## Example

:::code source="../../../lib/test/lib/computer/get-chain.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-chain.test.ts" target=_blank>Source</a>
