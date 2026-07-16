# getMnemonic

_Returns the mnemonic_

## Type

```ts
;() => string
```

### Return Value

A string encoding a BIP39 mnemonic.

## Description

You can set the mnemonic in the constructor of the `Computer` class. The mnemonic needs to have at least 12 words, otherwise an error is thrown. If the mnemonic property is left undefined a random mnemonic will be generated using the `generateMnemonic` of the [bip39](https://github.com/bitcoinjs/bip39?tab=readme-ov-file#bip39) library.

## Example

:::code source="../../../lib/test/lib/computer/get-mnemonic.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-mnemonic.test.ts" target=_blank>Source</a>
