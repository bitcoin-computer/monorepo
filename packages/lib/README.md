<div align="center">

  <img src="imgs/banner@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>

  <p>
    <h1><b>Bitcoin Computer Lib</b></h1>
  </p>
</div>

<h3><b>A client side library for building smart contracts on Litecoin</b></h3>


## Installation

The easiest way to get started is by running one of the examples below on Litecoin testnet.
### Testnet

You only need to have [Node.js](https://nodejs.org/en/) installed. We recommend using [yarn](https://yarnpkg.com/en/) but you can also use [npm](https://www.npmjs.com/).

### Regtest and Mainnet

For serious development we recommend to use regtest due to the superior development experience. To run an app in production you need to use mainnet. See the readme file of the [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) for how to run an application on mainnet or in regtest mode.

## Usage

Below we explain how to run a smart contract on testnet.

### Fund the Testnet Wallet Address

The first step is to fund the Litecoin testnet address

```
ms2Nd47NDmqqtNuajthkjh7p1b328XhVU8
```

for free using a Litecoin testnet faucet, for example [here](https://tltc.bitaps.com/), [here](https://testnet-faucet.com/ltc-testnet/), or [here](https://testnet.help/en/ltcfaucet/testnet).


### Node.js Example

Create file ``index.mjs``

```
import { Computer, Contract } from '@bitcoin-computer/lib'

// a smart contract
class Counter extends Contract {
  constructor() {
    this.n = 0
  }

  inc() {
    this.n += 1
  }
}


// run the smart contract
;(async () => {
  // create Litecoin or Bitcoin Computer wallet
  const computer = new Computer({ mnemonic: 'replace this seed' })

  // deploy a smart object
  const counter = await computer.new(Counter)

  // update a smart object
  await counter.inc()

  // log the state
  console.log(counter)
})()
```

Then, execute the following in the same directory
````
yarn init -y
yarn add @bitcoin-computer/lib
node index.mjs
````

The expected output is:

```
Counter {
  n: 1,
  _id: '83553f27c9e4651323f1ebb...',
  _rev: '290923708ca56ea448dd67...',
  _root: '8136e4bceaf528ef6a8ff...'
}
```

### Browser Example

Create file ``index.js``.

```
import { Computer, Contract } from "https://unpkg.com/@bitcoin-computer/lib/browser/lib.min.js";

class Counter extends Contract {
  constructor() {
    super()
    this.n = 0
  }

  inc() {
    this.n += 1
  }
}


;(async () => {
  const computer = new Computer({ mnemonic: 'replace this seed' })

  const counter = await computer.new(Counter)
  document.getElementById("el").innerHTML = `Counter is ${counter.n}`

  await counter.inc()
  document.getElementById("el").innerHTML = `Counter is ${counter.n}`
})()
```

Create file ``index.html``

```
<html>
  <body>
    <div id='el'></div>
    <script type="module" src="./index.js"></script>
  </body>
</html>
```

Run the following in an empty directory and open your browser at the defaults [http://localhost:8080](http://localhost:8080).

```
npm init -y
npm i http-server
http-server
```

### More Examples

See the readme file of the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo#bitcoin-computer-monorepo).

## Price

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
