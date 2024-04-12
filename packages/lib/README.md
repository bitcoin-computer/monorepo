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

To install, run the commands below

<font size=1>

```bash
# Create packages.json file
npm init

# Install library
npm install @bitcoin-computer/lib
```

</font>

Create a file `index.mjs` containing the smart contract

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
const computer = new Computer()

// Fund the computer wallet
await computer.faucet(1e7)

// Deploy a smart contract and create a smart object
const counter = await computer.new(Counter)

// Update the smart object
await counter.inc()

// Log the smart object
console.log(counter)
```

</font>

Execute the smart contract.

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

Create a file `index.html` containing the smart contract.

<font size=1>

```html
<html>
  <head>
    <script type="module">
      import { Computer, Contract } from "https://unpkg.com/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs";

      class Counter extends Contract {
        constructor() {
          super({ n: 0 })
        }

        inc() {
          this.n += 1
        }
      }

      const computer = new Computer()
      await computer.faucet(0.0001e8)

      const counter = await computer.new(Counter)
      document.getElementById("count").innerHTML = counter.n

      await counter.inc()
      document.getElementById("count").innerHTML = counter.n
    </script>
  </head>

  <body>
    Counter value: <span id='count'>*</span>
  </body>
</html>
```

</font>

Open the HTML file in your browser.

<font size=1>

```bash
# Open html file in browser
open index.html
```

</font>

You should see "Counter value: x" where x is * at first, then 0 and then 1.

## Connect to a Bitcoin Computer Node

By default, a `computer` object will connect to a Bitcoin Computer Node in regtest mode that we provide. You can connect to your own node by installing the [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) and starting it with the command below:

<font size=1>

```bash
# Start a node
npm run up -- -litecoin -regtest
```

</font>

You can use the `url` parameter for the `Computer` constructor call to specify which node to connect to. Make sure that `chain` and `network` match your node's configuration.

<font size=1>

```js
// connect to a specific node url
const computer = new Computer({ url: 'http://localhost:1031' })
```

</font>

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/).

## Getting Help

If you have any questions, please let us know on <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram</a>, <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Price

It is free to develop and test on testnet and regtest. On mainnet we charge a small fee to support the development:
* The fee for a constructor or function call is satoshis-per-byte * 475. This is about as much as the average transaction fee for a payment.
* The fee for deploying a module makes use of the segwit discount. It is satoshis-per-byte * data size * 1/4.

This fee is in addition to the mining fee. You can configure satoshis per byte.

## Development Status

We do not yet recommend to use the Bitcoin Computer in production.

## License

This software is licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/) license.

You are free to: share, copy, and redistribute the material in any medium or format for any purpose, even commercially under the following terms:

- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
