---
icon: device-desktop
---

# Computer

The `Computer` class has the methods listed below.

### Basic

You can build almost all smart contracts with these.

{.compact}
| Method | Description |
|---------------------------------|------------------------------------------------------------|
| [constructor](./constructor.md) | Creates an instance of class Computer |
| [new](./new.md) | Creates a smart object from a smart contract |
| [query](./query.md) | Finds the latest revisions of smart object |
| [sync](./sync.md) | Computes the state of a smart object from a given revision |

### Modules

Deploy JavaScript modules (preferably via taproot) to avoid redundant on-chain storage for smart contracts, keep using expressions tiny, and minimize on-chain technical dust / hygiene dust costs. See [Fees](../../fees.md) for details and best practices.

{.compact}
| Method | Description |
|-----------------------|-----------------------------------------|
| [deploy](./deploy.md) | Deploys a JavaScript module on the blockchain |
| [load](./load.md) | Loads a JavaScript module from the blockchain |

### Advanced

For advanced applications that require control over how the transaction is signed, the UTXOs to be spent, custom scripts, or collaborative transaction building.

{.compact}
| Method | Description |
|-------------------------------|----------------------------------------------------------------|
| [encode](./encode.md) | Encodes a JavaScript expression into a Bitcoin transaction |
| [encodeNew](./encodeNew.md) | Encodes a constructor call into a Bitcoin transaction |
| [encodeCall](./encodeCall.md) | Encodes a function call into a Bitcoin transaction |
| [decode](./decode.md) | Parses a Bitcoin transaction and returns JavaScript expression |
| [faucet](./faucet) | Fund a computer object on Regtest |

### History

Access historical versions of on-chain objects.

{.compact}
| Method | Description |
|---------------------------|--------------------------------------------------|
| [first](./first.md) | Return the first revision |
| [prev](./prev.md) | Return the previous revision |
| [next](./next.md) | Return the next revision |
| [latest](./latest.md) | Return the latest revision |
| [last](./last.md) | Return the last revision after the tip is spent |

### Blocks & transactions

Look up block and transaction metadata. These methods are also available inside smart contracts via the [Inner Computer](../Contract/index.md#querying-inside-of-a-contract), with stricter confirmation rules.

{.compact}
| Method | Description |
|---------------------------------------------|--------------------------------------------------------|
| [txIdToBlockTime](./txIdToBlockTime.md) | Unix block time when a transaction was mined |
| [txIdToBlockHeight](./txIdToBlockHeight.md) | Block height when a transaction was mined |
| [txIdToBlockHash](./txIdToBlockHash.md) | Block hash of the block that included a transaction |
| [getBlockHash](./getBlockHash.md) | Block hash at a given height |
| [getBlockHeight](./getBlockHeight.md) | Height of a block given its hash |
| [getRawTransaction](./getRawTransaction.md) | Raw transaction hex |
| [getRawBlock](./getRawBlock.md) | Raw block hex |
| [getBlockHeader](./getBlockHeader.md) | Raw 80-byte block header hex |

### Wallet

Access the client side wallet.

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [sign](./sign.md) | Signs a Bitcoin transaction |
| [broadcast](./broadcast.md) | Broadcasts a Bitcoin transaction |
| [send](./send.md) | Sends satoshis to an address |
| [rpc](./rpcCall.md) | Access Bitcoin's RPC interface |
| [getAddress](./getAddress.md) | Returns the Bitcoin address of the computer wallet |
| [getBalance](./getBalance.md) | Confirmed, unconfirmed and total balance in sats |
| [getChain](./getChain.md) | Returns the blockchain |
| [getNetwork](./getNetwork.md) | Returns the network |
| [getMnemonic](./getMnemonic.md) | Returns a BIP39 mnemonic sentence |
| [getPassphrase](./getPassphrase.md) | Returns the passphrase |
| [getPrivateKey](./getPrivateKey.md) | Returns the private key |
| [getPublicKey](./getPublicKey.md) | Returns the public key |
| [getUtxos](./getUtxos.md) | Returns an array of unspent transaction outputs |
