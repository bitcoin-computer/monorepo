---
order: -10
icon: rocket
---


# Start

You can try the Bitcoin Computer without installing or downloading any software. Just create a file `index.html` and open it in your browser.

```js index.html
<html>
  <head>
    <script type='module'>
      // Import the Bitcoin Computer library
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

      // Initialize and fund smart contract wallet
      const computer = new Computer()
      await computer.faucet(0.0001e8)

      // Create a smart object from smart contract
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

When the website is rendered you will see `Value: *`. When the smart object is created you will see `Value: 0`. After the smart object update you will see `Value: 1`.

## Development

For serious development you need to have [node.js](https://nodejs.org/en/) installed. First download and install the Bitcoin Computer library from [Npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

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

## Serious Development

In the setup described above, you are using our node and are subject to the rate limiter there. To try the Bitcoin Computer without rate limiter, please follow the instructions of the readme file of the [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme).

## Download

You can download all Bitcoin Computer related material (including the library, node, these docs, and example applications) by [cloning](https://git-scm.com/docs/git-clone) the [monorepo](https://github.com/bitcoin-computer/monorepo/tree/main).

```bash Terminal
git clone https://github.com/bitcoin-computer/monorepo.git
```