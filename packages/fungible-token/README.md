# Fungible Token

A application for minting, storing, and sending fungible tokens on Litecoin. Build with the [Bitcoin Computer](http://bitcoincomputer.io) library. You can find more information in the accompanying [Medium Article](https://medium.com/@clemensley/how-to-build-a-token-on-bitcoin-in-javascript-c2439cf1b273).

![chat-screen](https://i.ibb.co/hMqsDjQ/Screen-Shot-2020-09-23-at-00-16-18.png)

## Installation

Install the [Bitcoin Computer  Monorepo](https://github.com/bitcoin-computer/monorepo). Then navigate from the root folder of the monorepo to the folder ``packages/wallet``.

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
cd packages/fungible-token
```

## Usage

### Testnet

To start the wallet on testnet run the command below and open [http://localhost:3001](http://localhost:3001) in a browser.

```bash
yarn start
```

To mint and send tokens you need a BIP39 seed phrase. You can generate a new seed for example from [here](https://iancoleman.io/bip39/).

To be able to send a message you need to fund the wallet using a [Litecoin](https://testnet-faucet.com/ltc-testnet/) [faucet](http://litecointf.salmen.website/).

### Regtest

To start the wallet in regtest mode you can run a [Bitcoin Computer Node](). Then have a look at the comment at the top of "App.js" to see how to configure the wallet to connect to the node.
### Mainnet

Coming soon.

## Support

For more information see the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/getting-started/run-in-a-browser) or ask in the [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg).

## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.

## MIT License

Copyright (c) 2022 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
