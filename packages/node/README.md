<img src="../../imgs/banner@1x.png" alt="bitcoin-computer-logo" border="0"/>

# Bitcoin Computer Node

The Bitcoin Computer Node provides trustless access to the [Bitcoin Computer](https://github.com/bitcoin-computer/bc-lib).

[Documentation](https://docs.bitcoincomputer.io/) |
[Telegram](thebitcoincomputer) |
[Twitter](https://twitter.com/TheBitcoinToken)

## Getting Started

### Install

Clone the [```monorepo```](https://github.com/bitcoin-computer/monorepo.git) repository from GitHub. Move to ```packages/node``` and then copy the file ``.env.example`` into a file ``.env`` in the root folder. Run ```setup.sh``` to install Docker, npm and yarn if you don't have them installed already. After executing ```setup.sh``` close and reopen the terminal window to make sure that the Docker daemon is running. The run ``yarn install``.

```shell
git clone https://github.com/bitcoin-computer/monorepo.git
cd monorepo/packages/node
cp .env.example .env
./scripts/setup.sh
yarn install
```

### Start the Node
To start the Bitcoin Computer Node on Litecoin (LTC) regtest run:

```shell
yarn up
```

You will see the logs of the services that make up the Bitcoin Computer Node: a Litecoin Node called ``node``, a database called ``db`` and api server called ``bcn``. Until the database is up and running, messages indicating connection attempts are be logged.

Use the ``-t`` option to start the node on testnet. Type ``yarn up -h`` to get the list of all configuration options.

```shell
yarn up -t
```

### Run the Tests

To run the tests, execute

```shell
yarn test
```

## Fund the Wallet

When using ```regtest```, your wallet address must be funded.

```shell
yarn fund-ltc <address1> [<address2> ... <addressN>]
```

## Stop the Services

To stop the Bitcoin Computer Node run

```shell
yarn down
```

To stop the Bitcoin Computer Node, reset the database, delete all blockchain data, and stop all docker containers, run the following command

```shell
yarn reset
```

## Syncing in parallel

If your machine has more than 4 cores you can run the sync process in parallel to shorten the synchronization time. This is only required on testnet and mainnet.

By default synchronization process is carried out in parallel by using all your available cores. Also, you can use a flag to indicate an specific number of dedicated cores.

```shell
yarn up -t -cpus 16
```

The synchronization process can be stopped at any time with the command ```yarn down```. When you restart the process, it will continue from the last block processed.

### Times and Costs Estimates

The following table shows the estimated times and costs for syncing a Litecoin node on ```testnet```. The costs are estimated using an AWS EC2 instance [prices](https://aws.amazon.com/ec2/pricing/on-demand/). All experiments were run using a 50GB SSD storage.


| CPUs | RAM  | Sync Time | Monthly Costs  |
|------|------|-----------|----------------|
| 2    | 16GB | 28h       | 66.82 USD      |
| 4    | 16GB | 10h 30m   | 108.28 USD     |
| 8    | 32GB | 7h 10m    | 239.62 USD     |
| 16   | 32GB | 4h 44m    | 440.64 USD     |

## Price

The Bitcoin Computer will be free forever on testnet.

The fees to support the development of the Bitcoin Computer are fixed values, calculated using an average transaction size of 500 bytes, and a fee rate of 10000 sat/kvB.

## Contributions

We are currently supporting LTC. Contributions are welcome. We have set up a system to add support for BTC, DOGE and BCH, but it is not completed yet. See the chain-setup folder for details. If you can get it to work on a different currency, please let us know and create a new pull request.

## Getting Help

If you have any questions, please let us know on our <a href="https://t.me/thebitcoincomputer">Telegram group</a> or on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

[Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/)

You are free to: share, copy, and redistribute the material in any medium or format
for any purpose, even commercially under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
