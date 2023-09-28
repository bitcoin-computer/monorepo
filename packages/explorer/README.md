# Bitcoin Computer Explorer

A web application for exploring the blockchain and interacting with the Bitcoin Computer smart contracts. Built using the [Bitcoin Computer](http://bitcoincomputer.io/).

## Installation

Install the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo). Then navigate from the root folder of the monorepo to the folder ``packages/explorer``.

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
cd packages/explorer
```

## Usage

### Configuration

The application defaults to testnet mode. You have the flexibility to switch it to mainnet mode or run a local node in regtest mode, with detailed instructions available at [Bitcoin Computer Node][node]. If you wish to configure the web app to connect to your custom node, refer to the comment at the beginning of the 'App.tsx' file for guidance."

### Deploy a test Smart Contract

If you are running on regtest mode, we provide a test smart contract that you can deploy to test the explorer. To do so run

```bash
yarn deploy
```

You will need to fund the wallet that is used to deploy the smart contract, see [here](../lib/README.md#fund-the-wallet). After that you can start the server.

### Start the Server

To start the application run
```bash
yarn start
```
and open [http://localhost:3000](http://localhost:3000) in a browser.

### Log In

You can log into the application with a BIP39 seed phrase. Being logged in allows you to manipulate the smart contract, executing functions that require a signature.

You can generate a new seed for example from [here](https://iancoleman.io/bip39/).

## Support

For more information see the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io) or ask in the [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg).


## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.


## MIT License

Copyright (c) 2023 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node
