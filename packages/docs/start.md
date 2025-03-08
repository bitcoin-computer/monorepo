---
order: -10
icon: rocket
---

# Start

## Use in the Browser

Create the file below and open it in a browser. It show `*`, then `0` and finally `1`.

```js index.html
<html>
  <head>
    <script type="module">
      import {
        Computer,
        Contract,
      } from 'https://unpkg.com/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs'

      // Define a smart contract
      class Counter extends Contract {
        constructor() {
          super({ n: 0 })
        }

        inc() {
          this.n += 1
        }
      }

      // Create and fund a wallet
      const computer = new Computer()
      await computer.faucet(1e5)

      // Create an on-chain object
      const counter = await computer.new(Counter)
      document.getElementById('count').innerHTML = counter.n

      // Update the on-chain object
      await counter.inc()
      document.getElementById('count').innerHTML = counter.n
    </script>
  </head>

  <body>
    <span id="count">*</span>
  </body>
</html>
```

## Use in Node.js

You need to have [node.js](https://nodejs.org/en/) installed. First download and install the Bitcoin Computer library from [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):

<font size=1>

```bash Terminal
# Create packages.json file
npm init

# Install library
npm install @bitcoin-computer/lib
```

</font>

Then create a file `index.mjs`.

<font size=1>

```js index.mjs
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

// Create and fund a wallet
const computer = new Computer()
await computer.faucet(1e5)

// Create an on-chain object
const counter = await computer.new(Counter)

// Update the on-chain object
await counter.inc()

// Log the on-chain object
console.log(counter)
```

</font>

Execute the smart contract.

<font size=1>

```bash Terminal
node index.mjs
```

</font>

The expected output is:

<font size=1>

```js Terminal
Counter {
  n: 1,
  _id: <transaction id>:<output number>,
  _rev: <transaction id>:<output number>,
  _root: <transaction id>:<output number>,
  _amount: 7860,
  _owners: [<string encoding of public key>]
}
```

</font>

## Run a Node

In the examples above you are using a Bitcoin Computer Node that we provide at `rltc.node.bitcoincomputer.io` configured to Litecoin Regtest. You can use this node for free but it is rate limited. For serious development we recommend to clone the monorepo so you can run your own, unlimited, node. To run a node we recommend to clone the [monorepo](https://github.com/bitcoin-computer/monorepo#readme) with all Bitcoin Computer related materials.

### Clone and Install

```shell
# Clone
git clone https://github.com/bitcoin-computer/monorepo.git

# Install
cd monorepo
npm install
```

### Start the node

To start your node at `http://localhost:1031` run the commands below. The node is ready once the log activity subsides. On regtest this will take a few minutes, on mainnet and testnet it can take hours or even days, depending on your hardware and network connection.

```shell
# Run the node
cd packages/node

# Copy the .env file and litecoin.conf file from the examples
cp chain-setup/ltc/regtest/.env.example .env
cp chain-setup/ltc/regtest/litecoin.conf.example litecoin.conf

# Run the node
npm run up
```

### Run the Tests

Once the node is up an running, open a separate terminal window and navigate the monorepo folder. You can run the following commands. The commands will be executed in each package. You can also navigate the a package and run the same scripts there.

```shell
# Test
npm run test

# Lint
npm run lint

# Types
npm run types
```

### Configure Client Side Library

To run the examples above with your own node, change the line that creates to `Computer` instance as below.

```js
const computer = new Computer({
  chain: 'LTC',
  network: 'regtest',
  url: 'http://localhost:1031',
})
```

## Start A Project

We provide two templates, [`vite-template`](https://github.com/bitcoin-computer/monorepo/tree/main/packages/vite-template) for client side projects and [`node-template`](https://github.com/bitcoin-computer/monorepo/tree/main/packages/nodejs-template) for server side projects. Alternatively have a look at our example apps (e.g. our [wallet](https://wallet.bitcoincomputer.io/), [blockchain explorer](https://explorer.bitcoincomputer.io/), or [nft app](https://nft.bitcoincomputer.io/)) to see if any of them are a good starting point for your project.

## Getting Help

- [Telegram](https://t.me/thebitcoincomputer)
- [Twitter](https://twitter.com/TheBitcoinToken)
