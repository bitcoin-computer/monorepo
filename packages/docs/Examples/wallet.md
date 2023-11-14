---
order: 0
---

# Wallet

A wallet allows a user to check their balance and make a transaction to send cryptocurrency to another user.

In order to build the transaction, we can use a Bitcore-style library. Bitcoin Computer Lib can provide data to the wallet and broadcast the transaction. A [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic sentence can be employed to generate a Bitcoin Computer wallet.

```js
import { Computer } from 'bitcoin-computer-lib'

class Wallet {
  constructor(mnemonic: string) {
    this.computer = new Computer({ mnemonic })
  }

  ...
}
```

You can use the computer object to calculate the balance of a given address.

```js
const balance = await computer.getBalance(address)
```

The easy way to send money to a friend is to use the ``send`` function:

```js
const txId = await computer.send(satoshis, address)
```

!!!
Check out a working version on [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet)
!!!
