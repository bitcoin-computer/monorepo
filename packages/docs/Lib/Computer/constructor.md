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
  dustRelayFee?: number,
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
| path | BIP32 path | `m/44'/0'/0'` |
| passphrase | BIP32 passphrase | `''` |
| addressType | Address type | `p2pkh` |
| url | Url of a Bitcoin Computer Node | `https://rltc.node.bitcoincomputer.io` |
| satPerByte | Fee in satoshi per byte | `2` |
| dustRelayFee | Dust relay fee | `30000` on LTC and `3000` on BTC |
| moduleStorageType | Store JavaScript modules on Taproot or multisig scripts | `taproot` |

### Return Value

An instance of the `Computer` class

## Examples

```ts
import { Computer } from '@bitcoin-computer/lib'

// Connects to Bitcoin Computer Node at https://rltc.node.bitcoincomputer.io with LTC regtest
const remoteComputer = new Computer()

// Connects to local Bitcoin Computer Node on LTC regtest
const localComputer = new Computer({
  chain: 'LTC',
  network: 'regtest',
  url: 'http://localhost:1031'
})

// Connects to remove node on BTC testnet
const bitcoinComputer = new Computer({
  chain: 'BTC',
  network: 'testnet',
  mnemonic: 'replace this seed'
})

// More custom parameters
const customComputer = new Computer({
  chain: 'LTC'
  network: 'mainnet',
  addressType: 'p2wpkh',
  path: "m/44'/0'/0'/0",
  url: 'https://my-ltc-node.com',
  satPerByte: 1
})
```
