<div align="center">

  <img src="imgs/banner@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>

  <p>
    <h1><b>Bitcoin Computer Node</b></h1>
  </p>
</div>

<h3><b>Server side infrastructure for running smart contracts on Litecoin</b></h3>

This library is the server side counterpart to the [Bitcoin Computer Lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib).

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

You will see the logs of the services that make up the Bitcoin Computer Node: a Litecoin Node called ``node``, a database called ``db`` and api server called ``bcn``. Until the database is up and running, messages indicating connection attempts are be logged.

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

## Transaction Costs

While it is free to develop a Bitcoin Computer application, there is a small fee to run the application on the Bitcoin Computer on mainnet. The fees are used to support the development of the Bitcoin Computer.

**Testnet and Regtest:** The Bitcoin Computer will be free forever on regtest and testnet.

**Mainnet** The fees for the Bitcoin Computer are on average the same as the miners fees.

For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the miners, and one cent to support the development of the Bitcoin Computer.

## Development Status

We are still aware of security issues so we do not recommend to use Bitcoin Computer in production yet. We are working on an internal audit to identify and fix all remaining security issues. We estimate that the audit and bug fixes will be completed in January 2023.

## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/). If you find a bug or have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

[Creative Commons Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/)

You are free to: share, copy, and redistribute the material in any medium or format for any purpose, even commercially under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
