<div align="center">
  <img src="./imgs/bitcoin-computer-lib@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
  <h1>Bitcoin Computer Library</h1>
</div>

A non-custodial Javascript wallet that can read and write smart contract data from and to UTXO based blockchains. The client side component of the [Bitcoin Computer](http://bitcoincomputer.io/). You can

* Deploy Javascript classes as smart contracts on UTXO-based blockchains
* Create objects from these smart contracts and store them on the blockchain
* Update and combine smart objects using function calls
* Track updates in digitally signed and timestamped transactions
* Check the validity and read the state of smart objects
* Recover all historical states of an object
* Encrypt data in the browser for end-to-end encrypted applications
* Store data off-chain on a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node)
* Use ES6 modules to decompose smart contracts
* Currently support for Litecoin, support for Bitcoin and Dogecoin coming soon

## Prerequisites

It depends on the setup you are aiming for
* Testnet: This is the easiest way to get started. You need to have [node.js](https://nodejs.org/en/) installed.
* Regtest: This is the recommended setup for serious development. You need [node.js](https://nodejs.org/en/) installed and you need to run a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node).
* Mainnet: This is the setup for production. You need [node.js](https://nodejs.org/en/) installed, you need to run a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node), and you need mainnet coins.

Below we explain how to use testnet. Have a look at the readme file for the [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) for how to run an app on regtest or mainnet.
## Use with Node.js


### Install

In an empty directory run.

````
npm init -y
npm add @bitcoin-computer/lib
````

### Write a Smart Contract

Create file ``index.mjs``

```
import { Computer, Contract } from '@bitcoin-computer/lib'

// Define a smart object
class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }

  inc() {
    this.n += 1
  }
}


// Create a smart object on the blockchain
;(async () => {
  // Create a Bitcoin Computer wallet
  const computer = new Computer({ mnemonic: 'replace this seed' })

  // Deploy a smart object
  const counter = await computer.new(Counter)

  // Update a smart object
  await counter.inc()

  // Log the state
  console.log(counter)
})()
```

### Fund the Wallet

In order to execute the smart contract, you must first send an amount of testnet coins to the address associated with the mnemonic seed used to create the Computer object. You can use a Litecoin testnet faucet, for example [here](https://testnet-faucet.com/ltc-testnet/), [here](https://tltc.bitaps.com/), or [here](https://testnet.help/en/ltcfaucet/testnet).

```
// Address generated from the mnemonic seed 'replace this seed'
ms2Nd47NDmqqtNuajthkjh7p1b328XhVU8
```

### Run the Smart Contract

````
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

You can use smart objects to build decentralized applications. For more information see our docs [Docs](https://docs.bitcoincomputer.io/).

## Use in a Browser

### Write a Smart contract

Create file ``index.js``.

```
import { Computer, Contract } from "https://unpkg.com/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs";

class Counter extends Contract {
  constructor() {
    super({ n: 0 })
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

### Embed in a Website

Create file ``index.html``

```
<html>
  <body>
    <div id='el'></div>
    <script type="module" src="./index.js"></script>
  </body>
</html>
```

### Start a Local Server

```
npm init -y
npm i http-server
http-server
```

### Fund Wallet

See this [Section](#fund-the-wallet).

### View Website

To create and update a smart object and see the counter update open [http://localhost:8080](http://localhost:8080) in your browser.

## Price

It is free to develop and test a Bitcoin Computer application on testnet and regtest.

On mainnet the fees for using the Bitcoin Computer are on average the same as the transaction fees charged by the miners. For example, if the miner transaction fee is one cent, then you  pay two cent in total: one cent to the miners, and one cent to support the development of the Bitcoin Computer.

## Development Status

We have completed two internal audits and addressed any discovered issues. Currently, there are no known security vulnerabilities, however, it is possible that unknown vulnerabilities may exist. We plan to conduct one more thorough internal security audit prior to recommending the usage of the Bitcoin Computer in production environments.

## Documentation and Help

Have a look at the [Docs](https://docs.bitcoincomputer.io/).

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

This software is licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/) license.

You are free to: share, copy, and redistribute the material in any medium or format for any purpose, even commercially under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
