The Bitcoin Computer Node exposes an API that can be used to interact with the node.
The variables `CHAIN` and `NETWORK` are used to define the chain and network that the node is running on.

#### Wallet

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [balance](./wallet/balance.md) | Get the balance of a wallet. |
| [list-txs](./Wallet/list-txs.md) | List sent and received transactions for a given address. |
| [sent-outputs](./Wallet/sent-outputs.md) | List sent outputs of a wallet. |
| [received-outputs](./Wallet/received-outputs.md) | List received outputs of a wallet. |
| [utxos](./Wallet/utxos.md) | List unspent outputs of a wallet. |

#### Transactions

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [ancestors](./Transaction/ancestors.md) | Get the ancestors of a transaction. |
| [bulk](./Transaction/bulk.md) | Get raw transactions for a list of transaction ids. |
| [json](./Transaction/json.md) | Get a transaction in json format. |
| [post](./Transaction/post.md) | Post a transaction to the Bitcoin network. |

#### Blockchain

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [height](./Blockchain/height.md) | Get the height of an specific block. |
| [mine](./Blockchain/mine.md) | Mine an specific number of blocks to a random address. |
| [rpc](./Blockchain/height.md) | Call a Bitcoin RPC method. |

#### Regtest Faucet

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [faucet](./Regtest-faucet/faucet.md) | Get coins from the faucet. |
| [faucetScript](./Regtest-faucet/faucetScript.md) | Get coins from the faucet using a script. |

#### Query revisions

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [next](./Query-revisions/next.md) | Get the next revision of a given revision. |
| [prev](./Query-revisions/prev.md) | Get the previous revision of a given revision. |
| [non-standard-utxos](./Query-revisions/non-standard-utxos.md) | Query revisions by module specifier, public key, limit, order, offset and list of transaction ids. |
| [revs](./Query-revisions/revs.md) | Get the revisions of a list of transactions. |
| [revToId](./Query-revisions/revtoid.md) | Given a revision, get the id of the smart contract. |

#### OffChain

{.compact}
| Method | Description |
|-------------------------------------|----------------------------------------------------|
| [id](./Regtest-faucet/faucet.md) | Get the data stored in the offchain storage. |
| [store](./Regtest-faucet/faucetScript.md) | Stores the hex of the data in the offchain storage. |
