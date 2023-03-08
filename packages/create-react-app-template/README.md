# Create React App and Bitcoin Computer Template

This project is a minimal setup with [Create React App](https://create-react-app.dev/) and [Bitcoin Computer](http://bitcoincomputer.io/).

![chat-screen](./imgs/cra-screen.png)


## Installation

Install the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo) and navigate from the root folder of the monorepo to this folder.

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
cd packages/create-react-app-template
```

## Usage

Most of the api is documented in the [Create React App Readme](https://github.com/facebook/create-react-app). This readme only documents the additional features for the [Bitcoin Computer](https://docs.bitcoincomputer.io/).

### Start the Application

To start the application run
```bash
yarn start
```
and open [http://localhost:3001](http://localhost:3001) in a browser.

### Run the tests

To start the tests
```bash
yarn start
```

### Configuration

The application defaults to testnet mode. You can run it in regtest or mainnet mode you can run a [Bitcoin Computer Node][node]. To configure the web app to connect to your own node, have a look at the comment at the top of "App.js". Support for mainnet will be added soon.

### Fund the Wallet

You need to send some cryptocurrency to your wallet address to mint or send a token. Click on "Wallet" to find your wallet address.

If you run the application in testnet mode you can fund the wallet for free using a Litecoin faucet ([here](https://testnet-faucet.com/ltc-testnet/) or [here](http://litecointf.salmen.website/)).

If you run on regtest mode you can run
```
yarn fund-ltc <your wallet address>
```
to fund your wallet for free from the [Bitcoin Computer Node][node].

## Support

For more information see the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io) or ask in the [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg).

## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.

## MIT License

Copyright (c) 2022 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node
