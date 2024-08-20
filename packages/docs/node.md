---
order: -60
icon: package
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
npm run build-node
```

</font>

## Usage

### Start the Node

To start your node at `http://localhost:1031` run the commands below. The node is ready once the log activity subsides. On regtest this will take a few minutes, on mainnet and testnet it can take days or even weeks, depending on your hardware.

<font size=1>

```sh
# Move to node folder
cd packages/node

# Create a .env file
cp .env.example .env

# Run the node on litecoin regtest
npm run up
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
npm run fund-ltc -- <address_1> ... <address_n>

# Fund Bitcoin regtest wallet
npm run fund-btc -- <address_1> ... <address_n>
```

</font>

### Stop the Node

You can stop the node with the command below. When you restart the process, it will resume from the last block processed.

<font size=1>

```sh
npm run down -- -r
```

</font>

### Reset the Node

The command below will reset the database, delete all blockchain data, and stop all docker containers.

<font size=1>

```sh
npm run reset
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
expect(await new Computer(conf).getBalance(address).balance).eq(1e4)

// Return the transactions
expect(await new Computer(conf).listTxs(address)).deep.eq({
  sentTxs: [],
  receivedTxs: [
    {
      txId,
      inputsSatoshis: 0,
      outputsSatoshis: 1e4,
      satoshis: 1e4
    }
  ]
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
# BTC or LTC
CHAIN='LTC'

# mainnet, testnet, or regtest
NETWORK='regtest'

# Port for Bitcoin Computer Node
PORT='1031'

# Postgres Connection Credentials
POSTGRES_USER='bcn'
POSTGRES_PASSWORD='bcn'
POSTGRES_DB='bcn'
POSTGRES_HOST='127.0.0.1'
POSTGRES_PORT='5432'

# Node Settings
# RPC Client Credentials
RPC_USER='bcn-admin'
RPC_PASSWORD='kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
RPC_AUTH='bcn-admin:c71460f0f08e4eeec90e033c04f7bb82$c36e8561d46abbf3bf13da6b88612c19d758d46d02c45cd2716f06a13ec407af'
RPC_HOST='127.0.0.1'  # should this be node?
RPC_PORT='19332'
RPC_PROTOCOL='http'
ZMQ_URL='tcp://node:28332'

# Default wallet name
DEFAULT_WALLET='defaultwallet'

# Allowed RPC Methods
ALLOWED_RPC_METHODS='^get|^gen|^send|^lis'

# Winston Logger Settings
# Debug mode
# 0: Error logs only
# 1: Error and warning logs
# 2: Error, warning and info logs
# 3: Error, warning, info and http logs
# 4: Error, warning, info, http and debug logs
DEBUG_MODE='4'
# Maximum number of logs to keep. If not set, no logs will be removed. This can be
# a number of files or number of days. If using days, add 'd' as the suffix.
LOG_MAX_FILES='14d'
# Maximum log file size. You can use 'k' for KB, 'm' for MB, and 'g' for GB. Once
# the size of the log file exceeds the specified size, the log is rotated. If no
# size is specified the log is not rotated.
LOG_MAX_SIZE='20m'
# A boolean to define whether or not to gzip archived log files.
LOG_ZIP='false'

# Show logs attached to the Console transport
SHOW_CONSOLE_LOGS='true'
# Show logs attached to the DB service
SHOW_DB_LOGS='false'

# Rate Limiting Settings
RATE_LIMIT_ENABLED='false'
RATE_LIMIT_WINDOW='900000'
RATE_LIMIT_MAX='300'
RATE_LIMIT_STANDARD_HEADERS='true'
RATE_LIMIT_LEGACY_HEADERS='false'

# Comma separated list of banned countries encoded as ISO-3166 alpha2 country
# codes (see https://www.geonames.org/countries/)
BANNED_COUNTRIES=
```

</font>

### Configure Parallelism

By default the synchronization runs in parallel and uses all cores of your machine. You can use the `-cpus` flag to limit the number of cores used.

<font size=1>

```shell
npm run up -- -t -cpus 16
```

</font>

## Estimated Server Costs

The following table shows the times and costs for syncing to a Litecoin node on testnet on [AWS EC2](https://aws.amazon.com/ec2/pricing/on-demand/). All experiments were run in spring 2022 using 50GB SSD storage.


| CPUs | RAM  | Sync Time | Monthly Costs  |
|------|------|-----------|----------------|
| 2    | 8GB  | 28h       | $65            |
| 4    | 16GB | 10h 30m   | $110           |
| 8    | 32GB | 7h 15m    | $240           |
| 16   | 32GB | 4h 45m    | $440           |

## Versioning

If you run your own node, make sure to use the same versions of Lib and Node.

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/).

## Getting Help

If you have any questions, please let us know on <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram</a>, <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Development Status
See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#development-status).

## Price

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#price).

## License

This software is licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/) license.

You are free to: share, copy, and redistribute the material in any medium or format for any purpose, even commercially under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
