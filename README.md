# Bitcoin Computer Monorepo

Infrastructure for building Smart Contracts on Litecoin, Bitcoin and other UTXOs-based blockchains.

### Smart Contract System

* [Bitcoin Computer Lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib): A library for building smart contracts on Litecoin/Bitcoin.
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node): It provides trustless access to the [Bitcoin Computer](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib). It provides the backend infrastructure for running smart contract based applications. It consists of a Litecoin/Bitcoin node, a database for storing index structures and off-chain data, and a web server.

### Standard Smart Contracts

* [BRC20 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC20): A Bitcoin Computer implementation of the ERC20 Fungible Token Standard. See the [documentation](https://docs.bitcoincomputer.io/advanced-examples/fungible-token/) for more information.
* [BRC721 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC721): A Bitcoin Computer implementation of the ERC721 Non-Fungible Token Standard on Litecoin/Bitcoin. See the [documentation](https://docs.bitcoincomputer.io/advanced-examples/non-fungible-token/) for more information.

## Installation

The general dependencies needed are [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), [node.js](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable). Follow the documentation of each tool to install them.

Clone the repository:

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
```

On the root level of the monorepo, run the following command to install the dependencies:

```bash
lerna bootstrap
```

## Usage

To get started, you can follow any of our examples found in the [Applications](#applications) section, or use the following minimal example to run in a browser. 

Create file `index.js`.

```javascript
import { Computer, Contract } from "https://unpkg.com/@bitcoin-computer/lib"; 
class Counter extends Contract  {
  constructor() {
    super()
    this.n = 0;
  }
  increment() {
    this.n++;
  }
}

;(async () => {
  document.getElementById("el").innerHTML = `Loading...`
  
  const computer = new Computer({
    mnemonic: "replace this seed", 
    // network: "regtest",
    // url: "http://127.0.0.1:3000",
  })

  const counter = await computer.new(Counter)
  document.getElementById("el").innerHTML = `Counter is ${counter.n}`

  await counter.increment()
  document.getElementById("el").innerHTML = `Counter is ${counter.n}`
})()
```

Create file `index.html`

```html
<html>
  <body>
    <div id='el'></div>
    <script type="module" src="./index.js" ></script>
  </body>
</html>
```


Then run the web server:

```bash
yarn add http-server
yarn http-server
``` 
Open the browser at `http://localhost:8080`. You will see how the counter gets incremented. 

By default, the Bitcoin Computer will connect to `testnet`. To run a `regtest` local node, you will need to follow the [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#start-the-node) instructions. Then, you will need to uncomment the lines in the `index.js` file to change the options of the `Computer` constructor.

```javascript
  const computer = new Computer({
    mnemonic: "replace this seed", 
    network: "regtest",
    url: "http://127.0.0.1:3000",
  })
```

You may receive an `insufficient balance` error. This is because your wallet does not have enough funds. For `regtest`, you can follow the [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#fund-the-wallet) instructions to fund your wallet. For `testnet`, you can use [this](https://testnet-faucet.com/ltc-testnet/) or [this LTC faucet](http://litecointf.salmen.website/).

### Example Applications

* [Chat](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat)
* [Wallet](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet)
* [Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token)
* [Non Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token)

## Support

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Documentation and Help

Have a look at our [webpage](https://www.bitcoincomputer.io), the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/) or [create an issue](https://github.com/bitcoin-computer/monorepo/issues).

## Price

* Testnet: The Bitcoin Computer will be free forever on testnet.
* Mainnet: The fees for the Bitcoin Computer are exactly the same as the miners fees. For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the miners, and one cent to support the development of the Bitcoin Computer.

## License

[Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/)

You are free to: share, copy, and redistribute the material in any medium or format
for any purpose, even commercially under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
