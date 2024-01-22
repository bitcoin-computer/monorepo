<div align="center">
  <img src="./imgs/bitcoin-computer-lib@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
  <h1>Bitcoin Computer Library</h1>
  <p>
    A Javascript library for smart contracts on Bitcoin and Litecoin<br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

## Prerequisites

You need to have [node.js](https://nodejs.org/en/) installed.

## Use on a Server

This section describes the recommended way to get started (testnet on a server). See [here](#use-in-a-browser) for how to use the library in a web browser and [here](#use-on-mainnet-or-regtest) for how to use mainnet or regtest.

### Install

<font size=1>

```bash
npm init
npm install @bitcoin-computer/lib
```

</font>

### Write a Smart Contract

Create file `index.mjs`

<font size=1>

```js
import { Computer, Contract } from '@bitcoin-computer/lib'

// A smart contract
class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }

  inc() {
    this.n += 1
  }
}

// Create a Bitcoin Computer wallet
const computer = new Computer({ mnemonic: 'drip audit speed belt gallery tribe bus poet used scrub view spike' })

// Deploy a smart contract and create a smart object
const counter = await computer.new(Counter)

// Update the smart object
await counter.inc()

// Log the smart object
console.log(counter)
```

</font>

### Fund the Wallet

Use a Litecoin testnet faucet (for example [here](https://testnet.help/en/ltcfaucet/testnet) or [here](https://litecointf.salmen.website/)) to fund the address. 

```
mvbAVZJF68WASLbqteTToE45r69L53Q1vL
```

If none of a faucets work you can run your own [node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) on regtest to fund the wallet.

### Run the Smart Contract

<font size=1>

```bash
node index.mjs
```

</font>

The expected output is:

<font size=1>

```js
Counter {
  n: 1,
  _id: '656...024:0',
  _rev: '90f...73f:0',
  _root: '656...024:0',
  _amount: 7860,
  _owners: ['037...954']
}
```

</font>

## Use in a Browser

### Write a Smart contract

Create file `index.mjs`.

<font size=1>

```js
import { Computer, Contract } from "https://unpkg.com/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs";

class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }

  inc() {
    this.n += 1
  }
}

const computer = new Computer({ mnemonic: 'drip audit speed belt gallery tribe bus poet used scrub view spike' })

const counter = await computer.new(Counter)
document.getElementById("count").innerHTML = counter.n

await counter.inc()
document.getElementById("count").innerHTML = counter.n
```

</font>

### Make a Website

Create file `index.html`

<font size=1>

```html
<html>
  <body>
    <script type="module" src="./index.mjs"></script>
    Counter value: <span id='count'></span>
  </body>
</html>
```

</font>

### Start a Web Server

<font size=1>

```bash
npm init -y
npm i http-server
http-server
```

</font>

### Fund Wallet

See [above](#fund-the-wallet).

### View the App

Open [http://localhost:8080](http://localhost:8080)

## Use on Mainnet or Regtest

You need to run a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) and configure your `computer` object to connect to your node:

```js
const computer = new Computer({
  url: 'http://localhost:1031',
  network: 'regtest', // or mainnet
  chain: 'LTC' // or BTC
})
```

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/).

## Getting Help

If you have any questions, please let us know on <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram</a>, <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Price

It is free to develop and test on testnet and regtest. On mainnet we charge a small fee to support the development:
* The fee for a constructor or function call is satoshis-per-byte * 475. This is about as much as the average transaction fee for a payment.
* The fee for deploying a module makes use of the segwit discount. It is satoshis-per-byte * data size * 1/4.

You can configure satoshis per byte. This fee is in addition to the mining fee.

## Development Status

There are no known security vulnerabilities. However we do not yet recommend to use the Bitcoin Computer in production yet.

## License

This software is licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/) license.

You are free to: share, copy, and redistribute the material in any medium or format for any purpose, even commercially under the following terms:

- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
