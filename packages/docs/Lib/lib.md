---
order: -40
---

# Lib

The Bitcoin Computer Library (available on [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#readme) and [Npm](https://www.npmjs.com/package/@bitcoin-computer/lib)) provides all the functionality needed to write smart contracts with the Bitcoin Computer.

To interface with the blockchain, the Bitcoin Computer Lib connects to a Bitcoin Computer node. By default the Bitcoin Computer Lib connects to a node in regtest node that we provide. You can find more information about configuration options in the section [constructor](./constructor.md).

## Api

### Basic

You can build almost all smart contracts with following methods.

{.compact}
| Method                          | Description                                                |
|---------------------------------|------------------------------------------------------------|
| [constructor](./constructor.md) | Creates an instance of class Computer                      |
| [new](./new.md)                 | Creates a smart object from a smart contract               |
| [query](./query.md)             | Finds the latest revisions of smart object                 |
| [sync](./sync.md)               | Computes the state of a smart object from a given revision |

### Advanced

To build advanced applications like swaps have a look at the following.

{.compact}
| Method                        | Description                                                    |
|-------------------------------|----------------------------------------------------------------|
| [encode](./encode.md)         | Encodes a Javascript expression into a Bitcoin transaction     |
| [encodeNew](./encodeNew.md)   | Encodes a constructor call into a Bitcoin transaction          |
| [encodeCall](./encodeCall.md) | Encodes a function call into a Bitcoin transaction             |
| [decode](./decode.md)         | Parses a Bitcoin transaction and returns Javascript expression |
| [faucet](./faucet)            | Fund a computer object on Regtest                              |

### Modules

You can save transaction fees by using our ES6 module system.

{.compact}
| Method                | Description                             |
|-----------------------|-----------------------------------------|
| [deploy](./deploy.md) | Deploys an ES6 module on the blockchain |
| [load](./load.md)     | Loads an ES6 module from the blockchain |

### Wallet

The wallet functionality within a `Computer` instance can be accessed using the following.

{.compact}
| Method                              | Description                                        |
|-------------------------------------|----------------------------------------------------|
| [sign](./sign.md)                   | Signs a Bitcoin transaction                        |
| [broadcast](./broadcast.md)         | Broadcasts a Bitcoin transaction                   |
| [send](./send.md)                   | Sends satoshis to an address                       |
| [rpcCall](./rpcCall.md)             | Access Bitcoin's RPC interface                     |
| [getAddress](./getAddress.md)       | Returns the Bitcoin address of the computer wallet |
| [getBalance](./getBalance.md)       | Confirmed, unconfirmed and total balance in sats   |
| [getChain](./getChain.md)           | Returns the blockchain                             |
| [getNetwork](./getNetwork.md)       | Returns the network                                |
| [getMnemonic](./getMnemonic.md)     | Returns a BIP39 mnemonic sentence                  |
| [getPassphrase](./getPassphrase.md) | Returns the passphrase                             |
| [getPrivateKey](./getPrivateKey.md) | Returns the private key                            |
| [getPublicKey](./getPublicKey.md)   | Returns the public key                             |
| [getUtxos](./getUtxos.md)           | Returns an array of unspent transaction outputs    |
