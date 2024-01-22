<div align="center">
<img src="imgs/bitcoin-computer@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
<h1>Bitcoin Computer</h1>
</div>

A smart contract system for UTXO-based blockchains. Key features:
* Smart contract programming in Javascript and Typescript
* Very low fees through client-side validation
* Built-in privacy through encryption
* Optional encrypted off-chain storage for efficient block space usage
* ES6 compliant module system
* Does not rely on a side-chain
* Support for Litecoin with support for Bitcoin and Dogecoin coming soon.

With the Bitcoin Computer, you can build decentralized applications. Examples include fungible and non-fungible tokens, exchanges, games, office applications, social networks, messengers, AI-based applications, and much more.


<b>NEW</b> [experimental support for ordinals](https://docs.bitcoincomputer.io/ordinals/) was added in version 0.14.

## Getting Started

To clone this monorepo and install the dependencies, run

```bash
git clone https://github.com/bitcoin-computer/monorepo.git
cd monorepo
yarn install
```

## Examples

The examples are in the `packages` folder. To run an example look at the `README.md` file in the corresponding folder. All the examples are open source and MIT licensed. You can use them as a starting point for your own applications, or you can contribute to them creating pull requests.

## Core Library

The core smart contract library is based on two packages:

* [Bitcoin Computer Lib](https://www.npmjs.com/package/@bitcoin-computer/lib) A non-custodial web wallet for reading and writing smart contracts
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) Server side infrastructure for providing trustless access to smart contracts
* [Bitcoin Computer NakamotoJS-lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/nakamotojs-lib) A fork of the [bitcoinJS-lib](https://github.com/bitcoinjs/bitcoinjs-lib) library with support for BTC and LTC

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
* [Bitcoin Computer Node.js Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/nodejs-template): A template for starting a new Bitcoin Computer application with [node.js](https://nodejs.org/en/)
* [Bitcoin Computer React Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/cra-template): A template for starting a new Bitcoin Computer application with [Create React App](https://create-react-app.dev/)

## Versioning

If you run your own node, make sure to use the same versions of Lib and Node.

We provide a free Bitcoin Computer Node on Litecoin testnet so you can try out Lib without having to run a node. This node always runs the latest version.

## Price

It is free to develop and test a Bitcoin Computer application on testnet and regtest.

We charge a small fee on mainnet to support the development of the Bitcoin Computer. The fee for a function call is satoshis per byte * 475 (average transaction size). The fee for deploying a module is satoshis per byte * data size * 1/4 (making use of the segwit discount). The programer can configure satoshis per byte.

## Development Status

We have completed two internal audits and addressed any discovered issues. Currently, there are no known security vulnerabilities, however, it is possible that unknown vulnerabilities may exist. We plan to conduct one more thorough internal security audit prior to recommending the usage of the Bitcoin Computer in production environments.
## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/).

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

[Bitcoin Computer Lib](https://www.npmjs.com/package/@bitcoin-computer/lib) and [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) are licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported License](https://creativecommons.org/licenses/by-nd/3.0/). All other [packages](https://github.com/bitcoin-computer/monorepo/tree/main/packages) in this monorepo are licensed under the [MIT License](https://opensource.org/licenses/MIT). See the individual packages for more information.
