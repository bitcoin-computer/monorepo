# constructor

Creates an instance of the ``Computer`` class.

### Type

````ts
new (config: {
  chain?: 'LTC' | 'BTC' | 'DOGE',
  network?: 'mainnet' | 'testnet' | 'regtest',
  mnemonic?: string,
  path?: string,
  passphrase?: string
  url?: string,
  satPerByte?: number
  dustRelayFee?: number
}) => Computer
````

### Syntax
```js
new Computer(config)
```

### Parameters

#### config
A configuration object

{.compact}
Key    | Description   | Default Value
---    | ---           | ---
chain  | Target blockchain. Values can be 'LTC' or 'BTC' | LTC
network | Target network. Values in 'testnet', 'regtest' or 'mainnet' | testnet
mnemonic | BIP39 mnemonic phrase | Random phrase
path | BIP32 path | m/44'/0'/0'
passphrase | BIP32 passphrase | The empty string
url | Url of a Bitcoin Computer Node | https://node.bitcoincomputer.io
satPerByte | Fee in satoshi per byte | 2
dustRelayFee | Dust relay fee | 30000 on LTC and 3000 on BTC

### Return Value

An instance of the Computer class

### Examples
```ts
import { Computer } from '@bitcoin-computer/lib'

// Bitcoin Computer wallet on LTC testnet
const computer1 = new Computer()

// Bitcoin Computer wallet on BTC testnet
const computer2 = new Computer({
  chain: 'BTC'
})

// Bitcoin Computer wallet with custom parameters
const computer3 = new Computer({
  chain: 'LTC'
  network: 'regtest',
  mnemonic: 'replace this seed'
  path: "m/44'/0'/0'/0",
  url: 'https://my-ltc-node.com',
  satPerByte: 1
})
```
