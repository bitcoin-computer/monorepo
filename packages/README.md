## Bitcoin Computer

To run an example look at the `README.md` file in the corresponding folder. All the examples are open source and MIT licensed. You can use them as a starting point for your own applications, or you can contribute to them creating pull requests.

## Core Library

The core smart contract library is based on two packages:

* [Bitcoin Computer Lib](https://www.npmjs.com/package/@bitcoin-computer/lib) A non-custodial web wallet for reading and writing smart contracts
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) Server side infrastructure for providing trustless access to smart contracts
* [Bitcoin Computer NakamotoJS](https://github.com/bitcoin-computer/monorepo/tree/main/packages/nakamotojs) A fork of the [bitcoinJS-lib](https://github.com/bitcoinjs/bitcoinjs-lib) library with support for BTC and LTC

### Applications

* [Wallet](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet): A non-custodial wallet for BTC and LTC
* [Blockchain Explorer](https://github.com/bitcoin-computer/monorepo/tree/main/packages/explorer): A web application for exploring the blockchain and interacting with the Bitcoin Computer smart contracts.
* [Chat](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat): A p2p chat application where messages are communicated over the blockchain
* [Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token): An application for minting, sending, and storing fungible tokens
* [Non Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token): An application for minting, sending, and storing non-fungible tokens (NFTs)

### Standard Smart Contracts

* [TBC20 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC20): A implementation of the ERC20 Fungible Token Standard
* [TBC721 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC721): A implementation of the ERC721 Non-Fungible Token Standard

### Templates
* [React components for the Bitcoin Computer](https://github.com/bitcoin-computer/monorepo/tree/main/packages/components): A collection of React components for building Bitcoin Computer applications
* [Bitcoin Computer Node.js Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node-js-boilerplate): A template for starting a new Bitcoin Computer application with [node.js](https://nodejs.org/en/)
* [Bitcoin Computer React Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/create-react-app-template): A template for starting a new Bitcoin Computer application with [Create React App](https://create-react-app.dev/)

## Documentation

You can visit the [docs](https://docs.bitcoincomputer.io/) website to learn more about the Bitcoin Computer. The docs are open source and you can contribute to them [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/docs). 

## Versioning

If you run your own node, make sure to use the same versions of Lib and Node.

We provide a free Bitcoin Computer Node on Litecoin testnet so you can try out Lib without having to run a node. This node always runs the latest version.

