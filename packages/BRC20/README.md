# BRC20 Fungible Token Contract

An implementation of the ERC20 [standard](https://eips.ethereum.org/EIPS/eip-20) on Bitcoin built on the [Bitcoin Computer](http://bitcoincomputer.io/). The following interface is implemented:

```typescript
interface IBRC20 {
  mint(publicKey: string, amount: number): Promise<string>
  totalSupply(): Promise<number>
  balanceOf(publicKey: string): Promise<number>
  transfer(to: string, amount: number): Promise<void>
}
```

## Installation

Install the [Bitcoin Computer  Monorepo](https://github.com/bitcoin-computer/monorepo). Then navigate from the root folder of the monorepo to the folder ``packages/fungible-token``.

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
cd packages/fungible-token
```

## Usage

### Start the Server

```bash
yarn start
```
Open [http://localhost:3001](http://localhost:3001) in a browser.

### Run the Tests

```bash
yarn test
```

### Run the Linter

```bash
yarn lint
```

### Check the Types

```bash
yarn types
```


### Login

You need a BIP39 pass phrase to log in. You can generate one [here](https://iancoleman.io/bip39/).

### Fund the Wallet


To be able to mint a token you need to fund the wallet using a [Litecoin](https://testnet-faucet.com/ltc-testnet/) [faucet](http://litecointf.salmen.website/).

### Mint a Token

Start the server and click ``mint``

### Configuration

#### Testnet

The application defaults to testnet

#### Regtest

To start the wallet in regtest mode you can run a [Bitcoin Computer Node](). Then have a look at the comment at the top of "App.js" to see how to configure the wallet to connect to the node.
#### Mainnet

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
