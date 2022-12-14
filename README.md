# Bitcoin Computer Monorepo

A smart contract system for Litecoin and Bitcoin.

## Smart Contract System

* [Bitcoin Computer Lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib): A client side non-custodial wallet that can read and write transactions encoding smart contracts.
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node): Server side infrastructure to host trustless smart contract based web applications.

## Standard Smart Contracts

* [BRC20 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC20): A Bitcoin Computer implementation of the ERC20 Fungible Token Standard.
* [BRC721 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC721): A Bitcoin Computer implementation of the ERC721 Non-Fungible Token Standard on Litecoin/Bitcoin.


## Example Applications

* [Wallet](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet): A simple wallet using the Bitcoin Computer
* [Chat](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat): A p2p chat application where messages are communicated over the blockchain.
* [Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token): An application for minting, sending, and storing NFTs
* [Non Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token): An application for minting, sending, and storing fungible tokens.

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


## Questions

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/) or [create an issue](https://github.com/bitcoin-computer/monorepo/issues).

## Price

* Testnet: The Bitcoin Computer will be free forever on testnet.
* Mainnet: The fees for the Bitcoin Computer are exactly the same as the miners fees. For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the miners, and one cent to support the development of the Bitcoin Computer.
