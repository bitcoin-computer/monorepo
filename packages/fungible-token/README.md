# Fungible Token Application

A simple application for minting, storing, and sending fungible tokens on Bitcoin. Intended as a starting point for developers to build on top of. Build on the [Bitcoin Computer](http://bitcoincomputer.io) library.

The smart contract is very simple:

````
class Token {
  constructor(to, supply, name) {
    this.coins = supply
    this._owners = [to]
    this.name = name
  }

  send(amount, to) {
    if (this.coins < amount) throw new Error()
    this.coins -= amount
    return new Token(to, amount, this.name)
  }
}
````

The constructor creates a new Token object that stores ``amount`` tokens and that is owned by a public key ``to``. The send function first checks for insufficient funds. If there are sufficient funds, a new object with ``number`` tokens is created and the amount in the current token is reduced by ``number``. As this is the only way to update the amount of a token this guarantees that the total number of tokens remains constant.

You can find more information in the accompanying [Medium Article](https://medium.com/@clemensley/how-to-build-a-token-on-bitcoin-in-javascript-c2439cf1b273).

## Start the app

To run the code clone the project in a new folder, run ``yarn install`` and start the app using

````
yarn start
````

To log in you need a BIP39 seed phrase. You can generate a new seed for example from [here](https://iancoleman.io/bip39/). You then need to fund the wallet using [this](https://testnet-faucet.com/ltc-testnet/) or [this LTC faucet](http://litecointf.salmen.website/).

For more information see the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/getting-started/run-in-a-browser) or ask in the [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg).

## Contributing

The app is very bare bones and contributions are more than welcome. Have a look at the open issues, or make a pull request with a new feature. You can also request a feature request by creating an issue.

## Screenshot

![chat-screen](https://i.ibb.co/hMqsDjQ/Screen-Shot-2020-09-23-at-00-16-18.png)

# MIT License

Copyright (c) 2022 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
