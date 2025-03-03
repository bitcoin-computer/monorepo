# constructor

The constructor of the `Computer` class creates an instance. It's functionality is described in this API documentation.

### Type

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
  dustRelayFee?: number,
  moduleStorageType?: 'taproot' | 'multisig'
}) => Computer
```

### Syntax

```js
new Computer(config)
```

### Parameters

#### config

A configuration object

{.compact}
| Key | Description | Default Value |
|--------------|--------------------------------------------------------------|--------------------------------------|
| chain | Target blockchain. Values can be 'LTC' or 'BTC' | LTC |
| network | Target network. Values in 'testnet', 'regtest' or 'mainnet' | regtest |
| mnemonic | BIP39 mnemonic phrase | Random phrase |
| path | BIP32 path | m/44'/0'/0' |
| passphrase | BIP32 passphrase | The empty string |
| addressType | The address script type. Values in 'p2pkh', 'p2wpkh', 'p2tr' | p2pkh |
| url | Url of a Bitcoin Computer Node | https://rltc.node.bitcoincomputer.io |
| satPerByte | Fee in satoshi per byte | 2 |
| dustRelayFee | Dust relay fee | 30000 on LTC and 3000 on BTC |
| moduleStorageType | Store ES6 modules on Taproot or multisig scripts | taproot |

### Return Value

An instance of the Computer class

### Examples

```ts
import { Computer } from '@bitcoin-computer/lib'

// Bitcoin Computer on LTC regtest connected to the public node https://rltc.node.bitcoincomputer.io
const computer1 = new Computer()

// Bitcoin Computer on BTC regtest
const computer2 = new Computer({
  chain: 'BTC'
})

// Bitcoin Computer with custom parameters
const computer3 = new Computer({
  chain: 'LTC'
  network: 'mainnet',
  mnemonic: 'replace this seed'
  addressType: 'p2wpkh',
  path: "m/44'/0'/0'/0",
  url: 'https://my-ltc-node.com',
  satPerByte: 1
})
```
