---
order: -40
---

# Lib

This API describes the functionality of the `Computer` class, exported from [`@bitcoin-computer/lib`](https://www.npmjs.com/package/@bitcoin-computer/lib).

## Basic

You can build almost all smart contracts with following methods.

{.compact}
| Method                          | Description                                                |
|---------------------------------|------------------------------------------------------------|
| [constructor](./constructor.md) | Creates an instance of class Computer                      |
| [new](./new.md)                 | Creates a smart object from a smart contract               |
| [query](./query.md)             | Finds the latest revisions of smart object                 |
| [sync](./sync.md)               | Computes the state of a smart object from a given revision |

## Advanced

To build advanced applications like swaps have a look at the following.

{.compact}
| Method                        | Description                                                    |
|-------------------------------|----------------------------------------------------------------|
| [encode](./encode.md)         | Encodes a Javascript expression into a Bitcoin transaction     |
| [encodeNew](./encodeNew.md)   | Encodes a constructor call into a Bitcoin transaction          |
| [encodeCall](./encodeCall.md) | Encodes a function call into a Bitcoin transaction             |
| [decode](./decode.md)         | Parses a Bitcoin transaction and returns Javascript expression |
| [faucet](./faucet)            | Fund a computer object on Regtest                              |

## Modules

You can save transaction fees by using our ES6 module system.

{.compact}
| Method                | Description                             |
|-----------------------|-----------------------------------------|
| [deploy](./deploy.md) | Deploys an ES6 module on the blockchain |
| [load](./load.md)     | Loads an ES6 module from the blockchain |

## Wallet

The wallet functionality within a `Computer` instance can be accessed using the following.

{.compact}
| Method                              | Description                                        |
|-------------------------------------|----------------------------------------------------|
| [sign](./sign.md)                   | Signs a Bitcoin transaction                        |
| [broadcast](./broadcast.md)         | Broadcasts a Bitcoin transaction                   |
| [send](./send.md)                   | Sends satoshis to an address                       |
| [rpcCall](./rpcCall.md)             | Access Bitcoin's RPC interface                     |
| [getAddress](./getAddress.md)       | Returns the Bitcoin address of the computer wallet |
| [getBalance](./getBalance.md)       | Returns the balance in satoshi                     |
| [getChain](./getChain.md)           | Returns the blockchain                             |
| [getNetwork](./getNetwork.md)       | Returns the network                                |
| [getMnemonic](./getMnemonic.md)     | Returns a BIP39 mnemonic sentence                  |
| [getPassphrase](./getPassphrase.md) | Returns the passphrase                             |
| [getPrivateKey](./getPrivateKey.md) | Returns the private key                            |
| [getPublicKey](./getPublicKey.md)   | Returns the public key                             |
| [getUtxos](./getUtxos.md)           | Returns an array of unspent transaction outputs    |
