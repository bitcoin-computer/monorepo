<div align="center">
  <img src="./imgs/bitcoin-computer-lib@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
  <h1>Bitcoin Computer Library</h1>
</div>

[A smart contract system for Bitcoin and Litecoin.](http://bitcoincomputer.io/)
* Inscribe a Javascript class to create a smart contract
* Inscribe a constructor call to create a smart object from a smart contract
* Inscribe a function call to update a smart object
* Smart objects live in UTXOs, the owner of the UTXO iss the owner of the object
* Only the owner can update a smart object by spending the UTXO
* All historical states are recorded in spent UTXOs
* Read access can be restricted via end-to-end encryption
* Data can be stored off-chain on a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node)
* Smart contracts can be decomposed using ES6 modules


## Use with Node.js

Below we explain how to use testnet (recommended to try it out). Have a look at the readme file for the [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node) for how to run an app on regtest or mainnet.

### Install

In an empty directory run.

<font size=1>

```bash
npm init -y
npm add @bitcoin-computer/lib
```

</font>

### Write a Smart Contract

Create file `index.mjs`

<font size=1>

```js
import { Computer, Contract } from '@bitcoin-computer/lib'

// Define a smart contract
class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }

  inc() {
    this.n += 1
  }
}


;(async () => {
  // Create a Bitcoin Computer wallet
  const computer = new Computer({ mnemonic: 'old lake fun' })

  // Deploy a smart contract and create a smart object
  const counter = await computer.new(Counter)

  // Update the smart object
  await counter.inc()

  // Log the state
  console.log(counter)
})()
```

</font>

### Fund the Wallet

In order to execute the smart contract, you must send an amount of testnet coins to the address associated with the mnemonic seed of the Computer object. The easiest way to find out which address you need to fund is to run the smart contract (see below) and use the address from the error message.

You can get free testnet Litecoin from a faucet, for example [here](https://testnet.help/en/ltcfaucet/testnet) or [here](https://tltc.bitaps.com/).

### Run the Smart Contract

<font size=1>

```
node index.mjs
```

</font>

The expected output is:

<font size=1>

```js
Counter {
  n: 1,
  _id: '8136e4 ... d67:0',
  _rev: '290923 ... 48d:0',
  _root: '8136e4 ... d67:0'
}
```

</font>

## Use in a Browser

### Write a Smart contract

Create file `index.js`.

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


;(async () => {
  const computer = new Computer({ mnemonic: 'replace this seed' })

  const counter = await computer.new(Counter)
  document.getElementById("el").innerHTML = `Counter is ${counter.n}`

  await counter.inc()
  document.getElementById("el").innerHTML = `Counter is ${counter.n}`
})()
```

</font>

### Embed in a Website

Create file `index.html`

<font size=1>

```html
<html>
  <body>
    <div id='el'></div>
    <script type="module" src="./index.js"></script>
  </body>
</html>
```

</font>

### Start a Local Web Server

<font size=1>

```bash
npm init -y
npm i http-server
http-server
```

</font>

### Fund Wallet

See [above](#fund-the-wallet).

### View Website

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Price

It is free to develop and test a Bitcoin Computer application on testnet and regtest.

We charge a small fee on mainnet to support the development of the Bitcoin Computer. The fee for a function call is satoshis per byte * 475 (average transaction size). The fee for deploying a module is satoshis per byte * data size * 1/4 (making use of the segwit discount). The programer can configure satoshis per byte.

## Development Status

We have completed two internal audits and addressed any discovered issues. Currently, there are no known security vulnerabilities, however, it is possible that unknown vulnerabilities may exist. We plan to conduct one more thorough internal security audit prior to recommending the usage of the Bitcoin Computer in production environments.

## Documentation and Help

Have a look at the [Docs](https://docs.bitcoincomputer.io/). If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## License

This software is licensed under the [Creative Commons Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/) license.

You are free to: share, copy, and redistribute the material in any medium or format for any purpose, even commercially under the following terms:

- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
