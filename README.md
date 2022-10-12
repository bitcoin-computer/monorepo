# Bitcoin Computer Monorepo

Infrastructure for building Smart Contracts on Litecoin, Bitcoin and other UTXOs-based blockchains.

## Get Started

The first step is to run your own local `regtest` [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node). Clone the repository and follow the instructions on the [Readme](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) file.

To get started with a simple Wallet example application, you can use our template to create a new project:

```bash
npx create-react-app <your-app-name> --template @bitcoin-computer/cra-template
```

Then, open a browser to http://localhost:3000.

The Wallet application allows you to generate addresses based on some mnemonic strings.
You will need to fund your wallet using the Bitcoin Computer Node. Follow the instructions in the [Readme](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) file.

Once you fund the Wallet, the balance should be updated. You can then send transactions to other addresses.

Many other examples can be found in the [Applications](#applications) section. The complete documentation can be found in [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/).

## Smart Contract System

* [Bitcoin Computer Lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib): A library for building smart contracts on Litecoin/Bitcoin.
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node): It provides trustless access to the [Bitcoin Computer](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib). It provides the backend infrastructure for running smart contract based applications. It consists of a Litecoin/Bitcoin node, a database for storing index structures and off-chain data, and a web server.

## Standard Smart Contracts

* [BRC20 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC20): A Bitcoin Computer implementation of the ERC20 Fungible Token Standard. See the [documentation](https://docs.bitcoincomputer.io/advanced-examples/fungible-token/) for more information.
* [BRC721 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC721): A Bitcoin Computer implementation of the ERC721 Non-Fungible Token Standard on Litecoin/Bitcoin. See the [documentation](https://docs.bitcoincomputer.io/advanced-examples/non-fungible-token/) for more information.


## Example Applications

* [Chat](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat)
* [Wallet](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet)
* [Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token)
* [Non Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token)


## Questions

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/) or [create an issue](https://github.com/bitcoin-computer/monorepo/issues).

## Price

* Testnet: The Bitcoin Computer will be free forever on testnet.
* Mainnet: The fees for the Bitcoin Computer are exactly the same as the miners fees. For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the Litecoin/Bitcoin miners, and one cent to support the development of the Bitcoin Computer.
