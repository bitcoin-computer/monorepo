---
icon: device-desktop
---

# Computer

The `Computer` class is the main client API for the Bitcoin Computer. Methods are grouped below. Prefer the **query** helpers under [Query outputs](#query-outputs) over the deprecated [`query`](./query.md).

### Basic

You can build almost all smart contracts with these.

{.compact}
| Method | Description |
|---------------------------------|------------------------------------------------------------|
| [constructor](./constructor.md) | Creates an instance of class `Computer` |
| [new](./new.md) | Creates a smart object from a smart contract |
| [getOUTXOs](./getOUTXOs.md) | Unspent smart-object revisions (preferred replacement for `query`) |
| [sync](./sync.md) | Computes the state of a smart object from a revision (or an effect from a tx id) |

### Modules

Deploy JavaScript modules (preferably via taproot) to avoid redundant on-chain storage for smart contracts, keep using expressions tiny, and minimize on-chain technical dust / hygiene dust costs. See [Fees](../../fees.md) for details and best practices.

{.compact}
| Method | Description |
|---------------------------------|----------------------------------------------------------------|
| [deploy](./deploy.md) | Deploys a JavaScript module on the blockchain |
| [load](./load.md) | Loads and evaluates a module (returns exports) |
| [getModules](./getModules.md) | Lists module deploys indexed by the node |
| [getModule](./getModule.md) | Fetches one indexed module row (including source `ept`) |
| [getInscription](./getInscription.md) | Static helper: parse a taproot `BC` module witness from raw tx hex |

### Query outputs

Query the node’s `Output` table. All of these accept a `TXOQuery` (see [getTXOs](./getTXOs.md)). `verbosity: 0` (default) returns revision strings; `verbosity: 1` returns full rows.

{.compact}
| Method | Description |
|---------------------------------|----------------------------------------------------------------|
| [getTXOs](./getTXOs.md) | Transaction outputs matching the query |
| [getUTXOs](./getUTXOs2.md) | Unspent outputs (`isSpent: false`) |
| [getOTXOs](./getOTXOs.md) | Smart-object outputs (`isObject: true`) |
| [getOUTXOs](./getOUTXOs.md) | Unspent smart objects (`isObject: true`, `isSpent: false`) |

### Advanced encode / decode

For applications that need control over signing, UTXOs spent, custom scripts, or collaborative transaction building.

{.compact}
| Method | Description |
|---------------------------------|----------------------------------------------------------------|
| [encode](./encode.md) | Encodes a JavaScript expression into a Bitcoin transaction |
| [encodeNew](./encodeNew.md) | Encodes a constructor call into a Bitcoin transaction |
| [encodeCall](./encodeCall.md) | Encodes a function call into a Bitcoin transaction |
| [decode](./decode.md) | Parses a **transition** transaction (`exp` / `env` / `mod`); not for module deploys |
| [fund](./fund.md) | Adds inputs/change so a transaction can pay fees |
| [delete](./delete.md) | Spends the given smart-object revisions (destroys those UTXOs) |

### History

Access historical versions of on-chain objects and related graph data.

{.compact}
| Method | Description |
|---------------------------------|----------------------------------------------------------------|
| [first](./first.md) | Return the first revision (object id) for a revision |
| [prev](./prev.md) | Return the previous revision |
| [next](./next.md) | Return the next revision |
| [latest](./latest.md) | Return the latest revision |
| [last](./last.md) | Latest revision if spent; otherwise `undefined` |
| [spendingInput](./spendingInput.md) | Input that spent a given revision |
| [getAncestors](./getAncestors.md) | Ancestor transaction ids (or hex map) for a location |

### Wallet

Access the client-side wallet and node connection.

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [sign](./sign.md) | Signs a Bitcoin transaction |
| [broadcast](./broadcast.md) | Broadcasts a Bitcoin transaction |
| [send](./send.md) | Sends satoshis to an address |
| [faucet](./faucet.md) | Fund an address on regtest |
| [listTxs](./listTxs.md) | Sent and received transactions for an address |
| [rpc](./rpcCall.md) | Call Bitcoin RPC methods via the node |
| [getAddress](./getAddress.md) | Wallet address |
| [getBalance](./getBalance.md) | Confirmed, unconfirmed, and total balance in sats |
| [getChain](./getChain.md) | Chain (`LTC`, `BTC`, …) |
| [getNetwork](./getNetwork.md) | Network (`mainnet`, `testnet`, `regtest`) |
| [getUrl](./getUrl.md) | URL of the connected Bitcoin Computer Node |
| [getMnemonic](./getMnemonic.md) | BIP39 mnemonic |
| [getPassphrase](./getPassphrase.md) | Wallet passphrase |
| [getPath](./getPath.md) | BIP32 derivation path |
| [getPrivateKey](./getPrivateKey.md) | Private key (hex/WIF string form used by the wallet) |
| [getPublicKey](./getPublicKey.md) | Public key (hex) |
| [getFee](./getFee.md) | Fee rate in sat/byte |
| [setFee](./setFee.md) | Set fee rate in sat/byte |
| [getVersion](./getVersion.md) | Static: library version string |
| [isUnspent](./isUnspent.md) | Whether a revision is still unspent on the chain |

### Indexer readiness

After broadcast, the node may take a short time to index outputs. Use these when you need strong read consistency before `sync` / `getOUTXOs`.

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [isIndexed](./isIndexed.md) | Whether the node has committed Output rows for a tx |
| [waitForIndexed](./waitForIndexed.md) | Poll until indexed (or timeout) |

### Real-time (SSE)

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [subscribe](./subscribe.md) | Updates for a smart-object id |
| [streamTXOs](./stream.md) | Stream outputs matching a filter |
| [streamMempoolCleanup](./streamMempoolCleanup.md) | Notifications when stale mempool rows are removed |

### Deprecated

Still present for backward compatibility; prefer the replacements.

{.compact}
| Method | Prefer instead |
|-------------------------------------|----------------------------------------------------|
| [query](./query.md) | [getOUTXOs](./getOUTXOs.md) |
| [getUtxos](./getUtxos.md) | [getUTXOs](./getUTXOs2.md) with `{ address, isObject: false }` (wallet-level helper) |
