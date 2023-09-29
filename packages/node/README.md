<div align="center">
<img src="./imgs/bitcoin-computer-node@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
    <h1>Bitcoin Computer Node</h1>
</div>

A Litecoin node optimized for smart contract applications. Also, the server-side component of the [Bitcoin Computer](http://bitcoincomputer.io/).

* Includes a Litecoin node, a PostgreSQL database, and an REST API
* Trustless access to smart contract data created with the [Bitcoin Computer Library](https://www.npmjs.com/package/@bitcoin-computer/lib)
* Index structures for retrieving UTXOs storing smart contract data
* Off-chain data storage
* Exposes an [RPC](https://litecoin.info/index.php/Litecoin_API) API for traditional Litecoin development
* Synchronizes in parallel for faster and more efficient performance
* Docker integration for easy deployment
* Support for Bitcoin and Dogecoin coming soon

## Prerequisites

You need to have [node.js](https://nodejs.org/en/) and [Docker](https://www.docker.com/) installed.

## Installation

```sh
# Download the Bitcoin Computer Monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move to the folder for the Bitcoin Computer Node
cd monorepo/packages/node

# Copy the .env.example file into a .env file
cp .env.example .env

# Install the dependencies
yarn install

# Build the Bitcoin Computer node docker image into the monorepo folder
cd ../../
yarn build-node

```

## Usage

### Start the Node

To start the node run the command below. By default the node will run Litecoin regtest mode, see [Configuration](#configuration) for more information.

```sh
yarn up
```

The node is ready once it logs "Bitcoin Computer Node is ready" (you need to search the logs as it is not the last message).

### Fund the Wallet

If you run the node in regtest mode, you can fund a wallet with the following command. This is very convenient for development.

```sh
yarn fund-ltc <address1> [<address2> ... <addressN>]
```

### Run the Tests

To run the tests, execute

```sh
yarn test
```

### Stop the Node

To stop the Bitcoin Computer Node run

```sh
yarn down
```

### Reset the database

To stop the Bitcoin Computer Node, reset the database, delete all blockchain data, and stop all docker containers, run the following command

```sh
yarn reset
```

### Connect to Bitcoin Computer Library

To connect a [Bitcoin Computer Library](https://www.npmjs.com/package/@bitcoin-computer/lib) object to your node you have to set the ``url`` property.

```js
new Computer({ url: 'https://localhost:1031' })
```

## Configuration

You can configure the chain and network of a node, as well as the level of paralellization of a node using the options below.

<table>
  <tr>
    <th>&nbsp;</th>
    <th>Option</th>
    <th>Alternative</th>
    <th>Description</th>
  </tr>

  <tr>
    <td rowspan="2">Chain</td>
    <td>--litecoin</td>
    <td>-ltc</td>
    <td>Start node on Litecoin</td>
  </tr>

  <tr>
    <td>--bitcoin</td>
    <td>-btc</td>
    <td>Start node on Litecoin</td>
  </tr>

  <tr>
    <td rowspan="3">Network</td>
    <td>--testnet</td>
    <td>-t</td>
    <td>Start the node on testnet</td>
  </tr>

  <tr>
    <td>--regtest</td>
    <td>-r</td>
    <td>Start the node on regtest</td>
  </tr>

  <tr>
    <td>--mainnet</td>
    <td>-m</td>
    <td>Start the node on mainnet</td>
  </tr>

  <tr>
    <td rowspan="3">Mode</td>
    <td></td>
    <td>-cpus</td>
    <td>Synchronize in parallel</td>
  </tr>
</table>

You can combine the options, for example, to start a node on testnet using Bitcoin, run

```shell
yarn up -t -btc
```

### Synchronizing in parallel

If your machine has more than 4 cores you can run the sync process in parallel. By default all your available cores are used. You can use a flag to indicate an specific number of dedicated cores.

```shell
yarn up -t -cpus 16
```

The synchronization process can be stopped at any time with the command ```yarn down -t```. When you restart the process, it will continue from the last block processed.

## Estimated Server Costs

The following table shows the estimated times and costs for syncing to a Litecoin node on testnet on [AWS EC2](https://aws.amazon.com/ec2/pricing/on-demand/). All experiments were run using 50GB SSD storage.


| CPUs | RAM  | Sync Time | Monthly Costs  |
|------|------|-----------|----------------|
| 2    | 16GB | 28h       | 66.82 USD      |
| 4    | 16GB | 10h 30m   | 108.28 USD     |
| 8    | 32GB | 7h 10m    | 239.62 USD     |
| 16   | 32GB | 4h 44m    | 440.64 USD     |

## Price

It is free to develop and test a Bitcoin Computer application on testnet and regtest.

We charge a small fee on mainnet to support the development of the Bitcoin Computer. The fee for a function call is satoshis per byte * 475 (average transaction size). The fee for deploying a module is satoshis per byte * data size * 1/4 (making use of the segwit discount). The programer can configure satoshis per byte.

## Development Status

We are not aware of security vulnerabilities but there is the possibility of unknown security vulnerabilities. We have performed two internal audits and have fixed all issues that were discovered. Each time the application was refactored heavily. We will will perform one more internal audit before we recommend to use the Bitcoin Computer in production.

## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/). If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

This software is licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/) license.

You are free to: share, copy, and redistribute the material in any medium or format for any purpose, even commercially under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
