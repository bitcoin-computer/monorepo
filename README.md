<div align="center">
<img src="imgs/logo@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 100px"/>

  <p>
    <h3><b>Smart Contracts for Litecoin and Bitcoin</b></h3>
  </p>
</div>

The Bitcoin Computer is a lightweight smart contract system designed to be easy to use and to be compatible with existing web applications.

Smart contracts and other non-custodial web applications can be built using the client side Bitcoin Computer Lib (BCL) that can read and write transactions encoding smart contracts. BCL needs to connect to a Bitcoin Computer Node (BCN), consisting of a full node and other server side infrastructure. By default BCL connects to a BCN that we provide for free so you don't have to run a BCN to try out BCL.
* [Bitcoin Computer Lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib) (start here)
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node)

## Installation

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
```

## Examples

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

While it is free to develop a Bitcoin Computer application, there is a small fee to run the application on mainnet. 100% of the fees are used to support the development of the Bitcoin Computer.

**Testnet:** The Bitcoin Computer will be free forever on testnet.

**Mainnet** The fees for the Bitcoin Computer are on average the same as the miners fees.

For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the miners, and one cent to support the development of the Bitcoin Computer.

## Development Status

We are still aware of security issues so we do not recommend to use Bitcoin Computer in production yet. We are working on an internal audit to identify and fix all remaining security issues. We estimate that the audit and bug fixes will be completed in January 2023.

## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/). If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

Bitcoin Computer Lib and Bitcoin Computer Node are licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported License](https://creativecommons.org/licenses/by-nd/3.0/). All other packages in this monorepo are licensed under the [MIT License](https://opensource.org/licenses/MIT). See the individual packages for more information.
