---
layout: page
---

![](/static/bitcoin-computer@1x.png)
# Bitcoin Computer

A Turing-complete smart contract system for Bitcoin and Litecoin. High level, it works as follows:

* Inscribe a Javascript class to create a smart contract
* Inscribe a constructor call to create a smart object from a smart contract
* Inscribe a function call to update a smart object
* Smart objects live in UTXOs, the owner of the UTXO iss the owner of the object
* Only the owner can update a smart object by spending the UTXO
* All historical states are recorded in spent UTXOs
* Read access can be restricted via end-to-end encryption
* Data can be stored off-chain on a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node)
* Smart contracts can be decomposed using ES6 modules

<!-- * Clients validate instead of trusting the operator 
* Transaction fee are low and independent of time and space complexity
* Smart contract are written in Javascript or Typescript
* Access to all historical states
* Built-in privacy through encryption
* Efficient block space usage with off-chain storage
* ES6 module system based on inscriptions
* No side-chain
* No extra token
* Support for Litecoin with support for Bitcoin and Dogecoin coming soon. -->

You can build decentralized applications, such as tokens, exchanges, games, social networks, and more.

## Get Started

[!ref](/start.md)

## Examples

To run an example have a look at the `README.md` file in the corresponding folder.

### Applications

* [Wallet](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet#readme): A minimal non-custodial wallet
* [Explorer](https://github.com/bitcoin-computer/monorepo/tree/main/packages/explorer#readme): A minimal non-custodial wallet
* [Chat](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat#readme): A p2p chat application where messages are communicated over the blockchain
* [Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token#readme): An application for minting, sending, and storing fungible tokens
* [Non Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token#readme): An application for minting, sending, and storing non-fungible tokens (NFTs)

### Standard Smart Contracts

* [BRC20 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC20#readme): A implementation of the ERC20 Fungible Token Standard
* [BRC721 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC721#readme): A implementation of the ERC721 Non-Fungible Token Standard

### Templates
* [Bitcoin Computer Node.js Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node-js-boilerplate#readme): A template for starting a new Bitcoin Computer application with [node.js](https://nodejs.org/en/)
* [Bitcoin Computer React Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/create-react-app-template#readme): A template for starting a new Bitcoin Computer application with [Create React App](https://create-react-app.dev/)

## Core Library

The core smart contract library is based on two packages:

* [Bitcoin Computer Lib](https://www.npmjs.com/package/@bitcoin-computer/lib#readme) A non-custodial web wallet for reading and writing smart contracts
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) Server side infrastructure for providing trustless access to smart contracts

## Price

It is free to develop and test a Bitcoin Computer application on testnet and regtest.

On Mainnet the fees for using the Bitcoin Computer are on average the same as the transaction fees charged by miners fees. For example, if the miner transaction fee is one cent, then you  pay two cent in total: one cent to the miners, and one cent to support the development of the Bitcoin Computer.

## Development Status

We have completed two internal audits and addressed any discovered issues. Currently, there are no known security vulnerabilities, however, it is possible that unknown vulnerabilities may exist. We plan to conduct one more thorough internal security audit prior to recommending the usage of the Bitcoin Computer in production environments.
## Getting Help

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

[Bitcoin Computer Lib](https://www.npmjs.com/package/@bitcoin-computer/lib) and [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) are licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported License](https://creativecommons.org/licenses/by-nd/3.0/). All other [packages](https://github.com/bitcoin-computer/monorepo/tree/main/packages) in this monorepo are licensed under the [MIT License](https://opensource.org/licenses/MIT). See the individual packages for more information.
