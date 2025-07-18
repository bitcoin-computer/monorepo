<div align="center">
  <img src="./imgs/bitcoin-computer-node@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
  <h1>Bitcoin Computer Node</h1>
  <p>
    A Bitcoin and Litecoin Node Optimized for Advanced Applications
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

The Bitcoin Computer Node is the backend for the Bitcoin Computer, a trustless general purpose smart contracts protocol for Bitcoin. The node consists of a Bitcoin node and a psql database with index structures.

## Features

- Query for the balance, the UTXO set, and the list of transactions of an address
- Multiplatform Docker images (linux/amd64, linux/arm/v7, linux/arm64)
- Allow and deny access to Bitcoin RPC endpoints using a regular expression
- Filter IP addresses by country
- Enforce allowlist and denylist
- Optimized for development, you can run large test suites on regtest
- Synchronizes in parallel
- All functionality of a Bitcoin node (build, sign, and broadcast txs, rpc)
- Easy to use an powerful [client side library](../lib/README.md).

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

</font>

The node will create the docker volumes in the `packages/node/chain-setup/**` directory of the selected chain and network. This folder contains the blockchain data and the database.

### Create indexes after syncing to mainnet

To reduce db syncing overhead, the sync process is carried out without creating db indexes. After the node has synced, you can create the indexes with the command below.

<font size=1>

```sh
# In the node folder run the following command
npm run create-indexes
```

</font>

### Run the Tests

You can run the integration tests with the command below.

<font size=1>

```sh
npm run test
```

</font>

On regtest, the halving period is set to infinity. This makes it possible to run a large number of tests without having to restart the node.

### Fund the Wallet

In regtest mode, you can fund a wallet with the following commands.

<font size=1>

```sh
# Fund Litecoin regtest wallet
npm run fund ltc <address_1> ... <address_n>

# Fund Bitcoin regtest wallet
npm run fund btc <address_1> ... <address_n>
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
import { Computer } from '@bitcoin-computer/lib'

// Configuration to connect to node on localhost
const conf = {
  chain: 'LTC',
  network: 'regtest',
  url: 'http://localhost:1031',
}

// Create instance of client side library
const computer = new Computer(conf)
const address = computer.getAddress()

// Fund client side library
const { txId, vout } = await computer.faucet(1e4)

// Return the utxos
expect(await new Computer(conf).getUtxos(address)).deep.eq([`${txId}:${vout}`])

// Return the balance
const res = await new Computer(conf).getBalance(address)
expect(res.balance).eq(1e4)

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
})
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

<!-- ### Configure Parallelism

By default the synchronization runs in parallel and uses all cores of your machine. You can use the `-threads` flag to limit the number of cores used.

<font size=1>

```shell
npm run up -- -t -threads 16
```
A minimum of four threads is the basic configuration to distribute the services of a bitcoin computer node. Scaling the number of threads can speed up the synchronization process. The table below shows the synchronization times for different architectures.
</font>

## Estimated Server Costs

The following table shows the times and costs for syncing to a Litecoin node on testnet on [AWS EC2](https://aws.amazon.com/ec2/pricing/on-demand/). All experiments were run in spring 2022 using 50GB SSD storage.


| CPUs | RAM  | Sync Time | Monthly Costs  |
|------|------|-----------|----------------|
| 2    | 8GB  | 28h       | $65            |
| 4    | 16GB | 10h 30m   | $110           |
| 8    | 32GB | 7h 15m    | $240           |
| 16   | 32GB | 4h 45m    | $440           | -->

## Versioning

If you run your own node, make sure to use the same versions of Lib and Node.

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/).

## Getting Help

If you have any questions, please let us know on <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram</a>, <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Development Status

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#development-status).

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
