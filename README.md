<div align="center">
<img src="imgs/logo@1x.png" alt="bitcoin-computer-logo" border="0" height=100/>

  <p>
    <h3><b>Smart Contracts for Litecoin and Bitcoin</b></h3>
  </p>
<br />

</div>

The Bitcoin Computer is a lightweight smart contract systems designed to be easy to use and to be compatible with existing web applications.

Non-custodial web applications can be built using the client side Bitcoin Computer Lib that can read and write transactions encoding smart contracts. The Bitcoin Computer Node consists of a full node and other infrastructure to host trustless smart contract based web applications.
* [Bitcoin Computer Lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib)
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node)

## Installation

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
```

## Examples

The easiest way to get started is to try one of the example applications

### Applications

* [Wallet](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet): A simple wallet using the Bitcoin Computer
* [Chat](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat): A p2p chat application where messages are communicated over the blockchain.
* [Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token): An application for minting, sending, and storing NFTs
* [Non Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token): An application for minting, sending, and storing fungible tokens.

### Standard Smart Contracts

* [BRC20 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC20): A Bitcoin Computer implementation of the ERC20 Fungible Token Standard.
* [BRC721 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC721): A Bitcoin Computer implementation of the ERC721 Non-Fungible Token Standard on Litecoin/Bitcoin.

### Templates
* [Bitcoin Computer Node.js Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node-js-boilerplate): A template for starting a new node.js application with Bitcoin Computer.
* [Bitcoin Computer React Template](https://github.com/bitcoin-computer/monorepo/tree/main/packages/create-react-app-template): A template for starting a new Create React App (CRA) application with Bitcoin Computer.

## Price

While it is free to develop a Bitcoin Computer application, there is a small fee to run the application on the Bitcoin Computer on mainnet. The fees are used to support the development of the Bitcoin Computer.

**Testnet:** The Bitcoin Computer will be free forever on testnet.

**Mainnet** The fees for the Bitcoin Computer are on average the same as the miners fees. For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the miners, and one cent to support the development of the Bitcoin Computer.

## Status

We are still aware of security issues so we do not recommend to use Bitcoin Computer in production yet. We are working on an internal audit to identify and fix all remaining security issues. We estimate that the audit and bug fixes will be completed in January 2023.

## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/). If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.
