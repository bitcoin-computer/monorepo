# BRC721 Non-Fungible Token Contract

An implementation of the [ERC721 standard](https://eips.ethereum.org/EIPS/eip-721) on Bitcoin built on the [Bitcoin Computer](http://bitcoincomputer.io/). The following interface is implemented.

```typescript
interface IBRC721 {
  mint(to: string, name?: string, symbol?: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownerOf(tokenId: string): Promise<string[]>
  transfer(to: string, tokenId: string)
}
```

## Installation

Install the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo). Then navigate from the root folder of the monorepo to the folder ``packages/BRC721``.

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
cd packages/BRC721
```

## Usage

### Configuration

The tests are pre-configured to run on regtest. You need to run a [Bitcoin Computer Node][node] to use the library on regtest. 

### Fund the Wallet

You need to send some cryptocurrency to your wallet address to run the tests.

#### Testnet

If you run the application in testnet mode you can fund the address below for free using a Litecoin faucet ([here](https://testnet-faucet.com/ltc-testnet/) or [here](http://litecointf.salmen.website/)).
```
muMDxiZUxLMQsa9uEfB6ctNShKtx7y8rbf
```

#### Regtest

If you run on regtest mode you can run the command below to fund your wallet for free from the [Bitcoin Computer Node][node].
```
yarn fund-ltc muMDxiZUxLMQsa9uEfB6ctNShKtx7y8rbf
```

#### Mainnet

Coming soon.


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