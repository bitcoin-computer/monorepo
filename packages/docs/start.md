---
order: -10
icon: rocket
---


# Start

## Use in the Browser

The easiest way to try the Bitcoin Computer is to create a file as below and open it in your browser.

```html
<html>
  <head>
    <script type='module'>
      // Import the library
      import { Computer, Contract } from 'https://unpkg.com/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs'

      // Define a smart contract
      class Counter extends Contract {
        constructor() {
          super({ n: 0 })
        }

        inc() {
          this.n += 1
        }
      }

      // Create a wallet
      const computer = new Computer()

      // Fund the wallet
      await computer.faucet(1e5)

      // Create a smart object
      const counter = await computer.new(Counter)
      document.getElementById('count').innerHTML = counter.n

      // Update the smart object
      await counter.inc()
      document.getElementById('count').innerHTML = counter.n

    </script>
  </head>

  <body>
    Value: <span id='count'>*</span>
  </body>
</html>
```

When the website is first rendered you will see `Value: *`. When the smart object is created with `computer.new` you will see `Value: 0`. The `inc` function is called you will see `Value: 1`.

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

// Create a wallet
const computer = new Computer()

// Fund the wallet
await computer.faucet(1e5)

// Create a smart object
const counter = await computer.new(Counter)

// Update the smart object
await counter.inc()

// Log the smart object
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
  _id: '656...024:0',
  _rev: '90f...73f:0',
  _root: '656...024:0',
  _amount: 7860,
  _owners: ['037...954']
}
```

</font>

In the setup above you are using a node that we provide at `node.bitcoincomputer.io`. You can use this node for free but it is rate limited. For serious development we recommend to clone the monorepo so you can run your own, unlimited, node.

## Run a Node

To run a node we recommend to clone the [monorepo](https://github.com/bitcoin-computer/monorepo#readme) with all Bitcoin Computer related materials, including the [Bitcoin Computer library](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#readme), the [node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme), the [docs](https://github.com/bitcoin-computer/monorepo/tree/main/packages/docs#readme), and [example applications](https://github.com/bitcoin-computer/monorepo/blob/main/packages/docs/apps.md).

### Install

```shell
# Clone
git clone https://github.com/bitcoin-computer/monorepo.git

# Install
cd monorepo
npm install
```

### Start the node

Navigate the the package for the node and start it. The node it up and running when the lgs die down.

```shell
# Run the node
cd packages/node
npm run up
```

### Test

Once the node is up an running, open a separate terminal window and navigate the the folder of the monorepo. You can run the following commands

```shell
# Test
npm run test

# Lint
npm run lint

# Types
npm run types
```

The commands will be run in each package. You can also navigate the a package and run the same scripts there.

### Start your own Project

We provide two templates, `vite-template` for client side projects and `node-template` for server side projects, featuring:
* Bitcoin Computer
* Typescript
* Eslint
* Testing environment

The easiest thing to do is just to rename the folder. Alternatively have a look at our example apps (e.g. our [wallet](https://wallet.bitcoincomputer.io/), [blockchain explorer](https://explorer.bitcoincomputer.io/), or [nft app](https://nft.bitcoincomputer.io/)) to see if any of them are a good starting point for your project.

## Getting Help

* [Telegram](https://t.me/thebitcoincomputer)
* [Twitter](https://twitter.com/TheBitcoinToken)

