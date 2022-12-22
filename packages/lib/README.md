<img src="imgs/banner@1x.png" alt="bitcoin-computer-logo" border="0"/>

# Bitcoin Computer Lib


A smart contract system for Litecoin and Bitcoin. You can build fungible and non-fungible tokens (NFTs), games, social networks, stable coins, exchanges, auctions, voting, office applications, artificial intelligence, ... anything really. We currently support Litecoin and Bitcoin but will add more currencies soon.

You can find more information in the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/).

## Quick start

The easiest way to get started is to run the tests. If you get an error "Insufficient funds" have a look [here](#fund-your-computer-object).

````
git clone git@github.com:bitcoin-computer/bitcoin-computer-lib.git
cd bitcoin-computer-lib
yarn install
yarn test
````

## Run in Node.js

Create file ``index.mjs``

```
import { Computer } from '@bitcoin-computer/lib'

// a smart contract
class Counter {
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
  console.log(counter)
})()
```

Then, execute the following in the same directory
````
yarn init -y
yarn add @bitcoin-computer/lib
node index.mjs
````


If you get an error "Insufficient funds" have a look [here](#fund-your-computer-object). Once the wallet is funded you will see:

```
Counter {
  n: 1,
  _id: '83553f27c9e4651323f1ebb...',
  _rev: '290923708ca56ea448dd67...',
  _root: '8136e4bceaf528ef6a8ff...'
}
```

## Run in the Browser

Create file ``index.js``.

```
import { Computer, Contract } from "https://unpkg.com/@bitcoin-computer/lib";

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

## Fund Your Computer Object

If you get an error message "Insufficient balance in address \<address\>" you need to fund the wallet inside the computer object.

By default the Bitcoin Computer runs on Litecoin testnet. You can get free testnet coins from a Litecoin testnet faucet [here](https://kuttler.eu/en/bitcoin/ltc/faucet/), [here](https://testnet-faucet.com/ltc-testnet/), or
[here](https://testnet.help/en/ltcfaucet/testnet).


We recommend generating a new mnemonic sentence through a [BIP39 generator](https://iancoleman.io/bip39/).


## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/), ask in our [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg),  or [create an issue](https://github.com/bitcoin-computer/monorepo/issues).

## Beta Warning

This software has been carefully developed over four years by a qualified team. However it has not been security reviewed and we cannot guarantee the absence of bugs. Bugs can lead to the loss of funds. We do not recommend to use this software in production yet. Use at your own risk.

We will remove the beta-tag once we have completed a security review.

## Price

### Testnet

The Bitcoin Computer will be free forever on testnet.

### Mainnet

The fees to the Bitcoin Computer are exactly the same as the miners fees.

## License

[Attribution-NoDerivs 3.0 Unported](https://creativecommons.org/licenses/by-nd/3.0/)

You are free to: share, copy, and redistribute the material in any medium or format
for any purpose, even commercially under the following terms:

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

This is a human-readable summary of (and not a substitute for) the [license](https://creativecommons.org/licenses/by-nd/3.0/legalcode).
