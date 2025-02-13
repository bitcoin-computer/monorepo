---
order: -60
---

# Node

## Prerequisites

You need to have [git](https://www.git-scm.com/), [node.js](https://nodejs.org/) and [docker](https://www.docker.com/) installed.

## Installation

<font size=1>

```sh
# Download the monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move into monorepo folder
cd monorepo

# Install the dependencies
npm install

# Build the docker image
npm run build:node
```

</font>

## Usage

### Start the Node

To start your node at `http://localhost:1031` run the commands below. The node is ready once the log activity subsides. On regtest this will take a few minutes, on mainnet and testnet it can take days or even weeks, depending on your hardware.

<font size=1>

```sh
# Move to node folder
cd packages/node

# Copy the .env file and litecoin.conf file from the examples
cp chain-setup/ltc/regtest/.env.example .env
cp chain-setup/ltc/regtest/litecoin.conf.example litecoin.conf

# Run the node on litecoin regtest
npm run up
```

The node will create the docker volumes in the `packages/node/chain-setup/**` directory of the selected chain and network. This folder contains the blockchain data and the database. The postgres database is used to efficiently store the complete blockchain data, for fast access and indexing.

</font>

### Run the Tests

You can run the integration tests with the command below.

<font size=1>

```sh
npm run test
```

</font>

On Litecoin regtest, the halving period is set to infinity. This makes it possible to run a large number of tests without having to restart the node.

### Fund the Wallet

In regtest mode, you can fund a wallet with the following commands.

<font size=1>

```sh
# Fund Litecoin regtest wallet
npm run fund ltc <address_1> ... <address_n>

# Fund Bitcoin regtest wallet
npm run fund btc  <address_1> ... <address_n>
```

</font>

### Stop the Node

You can stop the node with the command below. When you restart the process, it will resume from the last block processed.

<font size=1>

```sh
npm run down
```

</font>

### Reset the Node

The command below will reset the database, delete all blockchain data, and stop all docker containers.

<font size=1>

```sh
npm run clean
```

</font>

### Client Side Library

The [Bitcoin Computer Library](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#readme) can connect to a Bitcoin Computer Node to provides access to its functionality.

<font size=1>

```js
// Import client side library
import { Computer } from "@bitcoin-computer/lib";

// Configuration to connect to node on localhost
const conf = {
  chain: "LTC",
  network: "regtest",
  url: "http://localhost:1031",
};

// Create instance of client side library
const computer = new Computer(conf);
const address = computer.getAddress();

// Fund client side library
const { txId, vout } = await computer.faucet(1e4);

// Return the utxos
expect(await new Computer(conf).getUtxos(address)).deep.eq([`${txId}:${vout}`]);

// Return the balance
expect(await new Computer(conf).getBalance(address).balance).eq(1e4);

// Return the transactions
expect(await new Computer(conf).listTxs(address)).deep.eq({
  sentTxs: [],
  receivedTxs: [
    {
      txId,
      inputsSatoshis: 0,
      outputsSatoshis: 1e4,
      satoshis: 1e4,
    },
  ],
});
```

</font>

If you do not specify a `url` property it will default to the url below. The node at that url runs Litecoin on regtest network mode and uses the latest version of the Bitcoin Computer Node software.

```
https://rltc.node.bitcoincomputer.io
```

## Configuration

You can configure several options by editing the `.env` file.

<font size=1>

```bash
# Chain: BTC, LTC, DOGE or PEPE
BCN_CHAIN='LTC'
# Network: mainnet, testnet, or regtest
BCN_NETWORK='regtest'

# Postgres Connection Credentials
POSTGRES_USER='bcn'
POSTGRES_PASSWORD='bcn'
POSTGRES_DB='bcn'
POSTGRES_HOST='db'
POSTGRES_PORT='5432'
POSTGRES_MAX_CONNECTIONS='20'
POSTGRES_IDLE_TIMEOUT_MILLIS='3000'

# Bitcoin Node Settings
BITCOIN_IMAGE='litecoinproject/litecoin-core:0.21'
BITCOIN_DATA_DIR='/home/litecoin/.litecoin'
BITCOIN_CONF_FILE='litecoin.conf'

# Node Settings
# RPC Client Credentials
BITCOIN_RPC_USER='bcn-admin'
BITCOIN_RPC_PASSWORD='kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
BITCOIN_RPC_HOST='node'
BITCOIN_RPC_PORT='19332'
BITCOIN_P2P_PORT='19444'
BITCOIN_RPC_PROTOCOL='http'

# Default wallet name
BITCOIN_DEFAULT_WALLET='defaultwallet'

# Bitcoin Computer Node (BCN) Settings
# Port for Bitcoin Computer Node
BCN_PORT='1031'

# Enable to launch with fixed number of parallel workers
# BCN_NUM_WORKERS='6'

BCN_ZMQ_URL='tcp://node:28332'
BCN_ZMQ_PORT='28332'
# Height of the block at which the zmq connection should start
BCN_ZMQ_ACTIVATION_HEIGHT=1

# Url of the Bitcoin Computer Node, defaults to localhost
BCN_URL='http://127.0.0.1:1031'

# Allowed RPC Methods
BCN_ALLOWED_RPC_METHODS='^get|^gen|^send|^lis'

# Setup the environment to 'prod' (no console logs) or 'dev'
BCN_ENV='dev'

# Winston Logger Settings
# Log levels
# 0: Error logs only
# 1: Error and warning logs
# 2: Error, warning and info logs
# 3: Error, warning, info and http logs
# 4: Error, warning, info, http and debug logs
BCN_LOG_LEVEL='2'
# Maximum number of logs to keep. If not set, no logs will be removed. This can be
# a number of files or number of days. If using days, add 'd' as the suffix.
BCN_LOG_MAX_FILES='14d'
# Maximum log file size. You can use 'k' for KB, 'm' for MB, and 'g' for GB. Once
# the size of the log file exceeds the specified size, the log is rotated. If no
# size is specified the log is not rotated.
BCN_LOG_MAX_SIZE='20m'
# A boolean to define whether or not to gzip archived log files.
BCN_LOG_ZIP='false'

# Show logs at db service
BCN_SHOW_DB_LOGS='false'

# Rate Limiting Settings
BCN_RATE_LIMIT_ENABLED='false'
BCN_RATE_LIMIT_WINDOW='900000'
BCN_RATE_LIMIT_MAX='300'
BCN_RATE_LIMIT_STANDARD_HEADERS='true'
BCN_RATE_LIMIT_LEGACY_HEADERS='false'

# Comma separated list of banned countries, encoded as ISO-3166 alpha2 country.
# codes (see https://www.geonames.org/countries/)
BCN_BANNED_COUNTRIES=

# Default value for protocol in the _url parameter. Set to https if behind a load balancer.
BCN_OFFCHAIN_PROTOCOL=
```

</font>

<!--  ### Configure Parallelism

By default the synchronization runs in parallel and uses all cores of your machine. You can use the `-cpus` flag to limit the number of cores used.

<font size=1>

```shell
npm run up -- -t -cpus 16
```

</font>

## Estimated Server Costs

The following table shows the times and costs for syncing to a Litecoin node on testnet on [AWS EC2](https://aws.amazon.com/ec2/pricing/on-demand/). All experiments were run in spring 2022 using 50GB SSD storage.

| CPUs | RAM  | Sync Time | Monthly Costs |
| ---- | ---- | --------- | ------------- |
| 2    | 8GB  | 28h       | $65           |
| 4    | 16GB | 10h 30m   | $110          |
| 8    | 32GB | 7h 15m    | $240          |
| 16   | 32GB | 4h 45m    | $440          |
 -->

## Versioning

If you run your own node, make sure to use the same versions of Lib and Node.

## Api

The Bitcoin Computer Node exposes an API that can be used to interact with the node.
The variables `CHAIN` and `NETWORK` are used to define the chain and network that the node is running on.

### Wallet

#### `/v1/CHAIN/NETWORK/wallet/:address/utxos`

Returns the UTXOs for a given address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mwJn1YPMq7y5F8J3LkC5Hxg9PHyZ5K4cFv/utxos
```

```json
[
  {
    "address": "mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t",
    "satoshis": 99927794,
    "asm": "OP_DUP OP_HASH160 350dbb89c08f5b4aa19eb2bc0b4bb8ba5b79a873 OP_EQUALVERIFY OP_CHECKSIG",
    "rev": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:3",
    "txId": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
    "vout": 3
  }
]
```

#### `/v1/CHAIN/NETWORK/address/:address/balance`

Returns the confirmed, unconfirmed and total balance for a given address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/address/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/balance
```

```json
{
  "confirmed": 99927794,
  "unconfirmed": 0,
  "balance": 99927794
}
```

#### `/v1/CHAIN/NETWORK/wallet/:address/sent-outputs`

Returns the outputs that were sent from a given address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/sent-outputs
```

```json
[
  {
    "output": "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8:1",
    "amount": 99961718
  },
  {
    "output": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:1",
    "amount": 99944756
  }
]
```

#### `/v1/CHAIN/NETWORK/wallet/:address/received-outputs`

Returns the outputs that were received by a given address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/received-outputs
```

```json
[
  {
    "output": "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be:5",
    "amount": 99961718
  },
  {
    "output": "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8:3",
    "amount": 99944756
  },
  {
    "output": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:3",
    "amount": 99927794
  }
]
```

#### `/v1/CHAIN/NETWORK/wallet/:address/list-txs`

Returns the sent and received transactions for a given address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/list-txs
```

```json
{
  "sentTxs": [
    {
      "txId": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
      "inputsSatoshis": 99944756,
      "outputsSatoshis": 99927794,
      "satoshis": 16962
    },
    {
      "txId": "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8",
      "inputsSatoshis": 99961718,
      "outputsSatoshis": 99944756,
      "satoshis": 16962
    }
  ],
  "receivedTxs": [
    {
      "txId": "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be",
      "inputsSatoshis": 0,
      "outputsSatoshis": 99961718,
      "satoshis": 99961718
    }
  ]
}
```

### Transactions

#### `/v1/CHAIN/NETWORK/tx/bulk`

Returns the raw transaction for a given list of transaction IDs.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/tx/bulk \
     -H "Content-Type: application/json" \
     -d '{
           "txIds": [
             "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
             "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8",
             "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be"
           ]
         }'
```

```json
[
  "0100000002b80e0d87611d00c4...",
  "0100000001b80e0d87611d00c4...",
  "0100000000012b087e18328f98..."
]
```

#### `/v1/CHAIN/NETWORK/tx/post`

Posts a raw transaction to the network.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/tx/post \
     -H "Content-Type: application/json" \
     -d '{
           "hex": "0100000002b80e0d87611d00c4..."
         }'
```

```json
"e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca"
```

#### `/v1/CHAIN/NETWORK/tx/:txId/ancestors`

Returns the ancestors of a given transaction.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/tx/e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca/ancestors
```

```json
[
  "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
  "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8",
  "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be"
]
```

#### `/v1/CHAIN/NETWORK/tx/:txId/json`

Returns the JSON representation of a given transaction.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/tx/e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca/json
```

```json
{
  "txId": "e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca",
  "txHex": "0100000001202aabc...",
  "vsize": 443,
  "version": 1,
  "locktime": 0,
  "ins": [
    {
      "txId": "7c2f4dacaeac0a69c451bdd19f6c31d54def13b76ec8687160468d0ac8ab2a20",
      "vout": 0,
      "script": "47304402203...",
      "sequence": 4294967295
    }
  ],
  "outs": [
    {
      "address": "mryiaVyu9cDrdYCGzt8TimdxXPS1vmJS1a",
      "script": "512102ff3...",
      "value": 5820
    },
    {
      "address": "mryiaVyu9cDrdYCGzt8TimdxXPS1vmJS1a",
      "script": "76a9147db...",
      "value": 99971398
    }
  ]
}
```

### Blockchain

#### `/v1/CHAIN/NETWORK/mine`

Mine an specific number of blocks to a random address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/mine?count=1
```

```json
{ "success": true }
```

#### `/v1/CHAIN/NETWORK/:id/height`

Get the height an specific block. The `id` can be `best` or a block given hash.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/best/height
```

```json
{ "height": 101 }
```

#### `/v1/CHAIN/NETWORK/rpc`

Make a RPC call to the node.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/rpc \
     -H "Content-Type: application/json" \
     -d '{
           "method": "getmempoolinfo",
           "params": ""
         }'
```

```json
{
  "result": {
    "result": {
      "loaded": true,
      "size": 1,
      "bytes": 144,
      "usage": 1296,
      "maxmempool": 300000000,
      "mempoolminfee": 0.00001,
      "minrelaytxfee": 0.00001,
      "unbroadcastcount": 1
    },
    "error": null,
    "id": 40795
  }
}
```

### Regtest Faucet

#### `/v1/CHAIN/NETWORK/faucet`

Send coins to an address.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/faucet \
     -H "Content-Type: application/json" \
     -d '{
           "address": "mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t",
           "value": "100000000"
         }'
```

```json
{
  "txId": "68ef61b6c8896c42f983a0a80caa299ba8cfb0d9d03431ee5bcd6fbf7e0aa21b",
  "vout": 0,
  "height": -1,
  "satoshis": "100000000"
}
```

#### `v1/CHAIN/NETWORK/faucetScript`

Send coins to a script.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/faucetScript \
     -H "Content-Type: application/json" \
     -d '{
           "script": "76a914f7f1",
            "value": "100000000"
          }'
```

```json
{
  "txId": "68ef61b6c8896c42f983a0a80caa299ba8cfb0d9d03431ee5bcd6fbf7e0aa21b",
  "vout": 0,
  "height": -1,
  "satoshis": "100000000"
}
```

### Query revisions

#### `/v1/CHAIN/NETWORK/revs`

Get the revisions of a list of transactions.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/revs \
     -H "Content-Type: application/json" \
     -d '{
           "ids": [
             "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
             "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8"
           ]
         }'
```

```json
[
  "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
  "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be"
]
```

#### `/v1/CHAIN/NETWORK/rev/:revToId`

Given a revision, returns the id of the smart contract.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/revToId \
      -H "Content-Type: application/json" \
     -d '{
           "rev": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:0"
         }'
```

```json
"db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be:0"
```

#### `/v1/CHAIN/NETWORK/next/:rev`

Get the next revision of a given revision.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/next/032fc7a37e7848f5fb2beb79f773631c6047be0a2e9a699e1355aa8d1c64155e:0
```

```json
{ "rev": "44a1e658be5b1fa7b13511979c91497cacf9286aac694bbb75188b875384db98:0" }
```

#### `/v1/CHAIN/NETWORK/prev/:rev`

Get the previous revision of a given revision.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/prev/44a1e658be5b1fa7b13511979c91497cacf9286aac694bbb75188b875384db98:0
```

```json
{ "rev": "032fc7a37e7848f5fb2beb79f773631c6047be0a2e9a699e1355aa8d1c64155e:0" }
```

#### `/v1/CHAIN/NETWORK/non-standard-utxos`

Query revisions by module specifier, public key, limit, order, offset and list of transaction ids.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?mod=1
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?publicKey=02e3b0...
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?limit=10
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?order=DESC
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?offset=10

id="4446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494:0"
json_array=$(jq -n --arg id "$id" '[$id]')
encoded_json=$(echo "$json_array" | jq -r @uri)
url="http://localhost:1031/v1/LTC/regtest/non-standard-utxos?ids=$encoded_json"
curl -X GET "$url"
```

<!-- curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?ids=%5B%224446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494%3A0%22%5D -->

```json
["4446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494:0"]
```

### OffChain

#### `/v1/store/:id`

Get the data stored in the offchain storage.

```shell
curl -X GET http://localhost:1031/v1/store/fcdb882a0b9556a0c6fb2a89efe0633f0c256f24696f465d386a91803838e79a
```

```json
{
  "exp": "class A extends Contract {
            constructor(n, url){
              super({
                n: n,
                _url: url
              });

            }
          }
          new A(0.2815266905953051,'http://localhost:1031')",
    "env":{},
    "mod":"",
    "v":"0.24.0-beta.0"
}
```

#### `/v1/store`

Stores the hex of the data in the offchain storage.

```shell
curl -X POST http://localhost:1031/v1/store \
     -H "Content-Type: application/json" \
     -d '{
           "data": "{\"exp\":\"3+1\"}"
          }'
```
