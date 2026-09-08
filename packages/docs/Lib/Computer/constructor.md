# constructor

_Creates an instance of the `Computer` class._

## Type

```ts
new (config: {
  chain?: 'LTC' | 'BTC' | 'DOGE',
  network?: 'mainnet' | 'testnet' | 'regtest',
  mnemonic?: string,
  path?: string,
  passphrase?: string
  addressType?: 'p2pkh' | 'p2wpkh' | 'p2tr',
  url?: string,
  satPerByte?: number,
  moduleStorageType?: 'taproot' | 'multisig'
}) => Computer
```

### Parameters

#### `config`

A configuration object with the properties listed below. All properties are optional.

{.compact}
| Key | Description | Default |
|--------------|--------------------------------------------------------------|--------------------------------------|
| chain | Target blockchain | `LTC` |
| network | Target network | `regtest` |
| mnemonic | BIP39 mnemonic phrase | Random phrase |
| path | BIP32 path | `m/44'/1'/0'` |
| passphrase | BIP32 passphrase | `''` |
| addressType | Address type | `p2pkh` |
| url | Url of a Bitcoin Computer Node | `https://rltc.node.bitcoincomputer.io` |
| satPerByte | Fee in satoshi per byte | `2` |
| moduleStorageType | Store JavaScript modules on Taproot (`taproot`) or bare multisig (`multisig`). Taproot (default where available) produces *no* hygiene dust outputs for the module encoding txs and supports larger modules (with SegWit discount) but uses a two-tx pattern with a `BC` protocol witness envelope. Multisig uses single-tx cleartext `{ ept }` data outputs (with hygiene dust). Choose based on minimization goals and high-throughput single-tx UX needs. See [deploy](./deploy.md) and [Fees](../../fees.md) "User Choices..." section. | `taproot` |

### Return Value

An instance of the `Computer` class

## Examples

:::code source="../../../lib/test/lib/computer/constructor.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/constructor.test.ts" target=_blank>Source</a>
