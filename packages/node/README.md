<div align="center">
<img src="./imgs/bitcoin-computer-node@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
    <h1>Bitcoin Computer Node</h1>
</div>

A Litecoin node optimized for smart contract applications. The server-side component of the [Bitcoin Computer](http://bitcoincomputer.io/).

* Includes a Litecoin node, a PostgreSQL database, and an REST API
* Trustless access to Litecoin transactions created with the [Bitcoin Computer Library](https://www.npmjs.com/package/@bitcoin-computer/lib)
* Index structures for retrieving UTXOs storing smart contract data
* Off-chain data storage
* Docker integration for easy deployment
* Exposes an [RPC](https://litecoin.info/index.php/Litecoin_API) API for traditional Litecoin development
* Synchronizes in parallel for faster and more efficient performance
* Support for Bitcoin and Dogecoin coming soon

## Installation

Clone the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo.git) from GitHub. Move to ```monorepo/packages/node``` and copy the file ``.env.example`` into a file ``.env`` in the root folder.

You need to have [Docker](https://www.docker.com/) and [yarn](https://yarnpkg.com/) installed. You can install them manually or run the script ``setup.sh`` in the folder ``scripts``.

Then close and reopen the terminal window to make sure that the Docker daemon is running and run ``yarn install``.

```shell
git clone https://github.com/bitcoin-computer/monorepo.git
cd monorepo/packages/node
cp .env.example .env
./scripts/setup.sh
yarn install
```

## Usage

### Start the Node
To start the Bitcoin Computer Node on Litecoin (LTC) regtest run:

```shell
yarn up
```

You will see the logs of the services that make up the Bitcoin Computer Node: a Litecoin Node called ``node``, a database called ``db`` and api server called ``bcn``. Until the database is up and running, messages indicating connection attempts are be logged. The node will be ready when the logs stop running (this can take a few minutes).

Use the ``-t`` option to start the node on testnet. Type ``yarn up -h`` to get the list of all configuration options. The node will start to download and sync to the Litecoin testnet blockchain.

```shell
yarn up -t
```

### Fund the Wallet

You need to fund the wallet before you can run the tests. On regtest you can run

```shell
yarn fund-ltc <address1> [<address2> ... <addressN>]
```
On mainnet you need to send Litecoin to the address in question (you can find the address in the error message).

### Run the Tests

To run the tests, execute

```shell
yarn test
```
### Stop the Node

To stop the Bitcoin Computer Node run

```shell
yarn down
```

To stop the Bitcoin Computer Node, reset the database, delete all blockchain data, and stop all docker containers, run the following command

```shell
yarn reset
```


### Syncing in parallel

If your machine has more than 4 cores you can run the sync process in parallel to shorten the synchronization time. This is only required on testnet and mainnet.

By default synchronization process is carried out in parallel by using all your available cores. Also, you can use a flag to indicate an specific number of dedicated cores.

```shell
yarn up -t -cpus 16
```

The synchronization process can be stopped at any time with the command ```yarn down -t```. When you restart the process, it will continue from the last block processed.

### Connect to Bitcoin Computer Lib

Have a look at the [documentation](https://docs.bitcoincomputer.io/library/api/) for how to connect a Bitcoin Computer Lib instance to your Bitcoin Computer Node.

## Server Costs

The following table shows the estimated times and costs for syncing to a Litecoin node on testnet. The costs are estimated using an AWS EC2 instance [prices](https://aws.amazon.com/ec2/pricing/on-demand/). All experiments were run using a 50GB SSD storage.


| CPUs | RAM  | Sync Time | Monthly Costs  |
|------|------|-----------|----------------|
| 2    | 16GB | 28h       | 66.82 USD      |
| 4    | 16GB | 10h 30m   | 108.28 USD     |
| 8    | 32GB | 7h 10m    | 239.62 USD     |
| 16   | 32GB | 4h 44m    | 440.64 USD     |

## Price

It is free to develop and test a Bitcoin Computer application on testnet and regtest.

On Mainnet the fees for using the Bitcoin Computer are on average the same as the transaction fees charged by miners fees. For example, if the miner transaction fee is one cent, then you  pay two cent in total: one cent to the miners, and one cent to support the development of the Bitcoin Computer.

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
