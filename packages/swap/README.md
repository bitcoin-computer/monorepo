<div align="center">
  <h1>Bitcoin Computer Swaps</h1>
  <p>
    A collection of swap smart contracts for the Bitcoin Computer
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
  <br />
</a>
</div>

This package contains the following smart contracts:

- [Swap](./src/swap.ts). A static swap function for two smart objects.
- [Swappable](./src/swappable.ts). A NFT contract with a built in swap method.
- [Sale](./src/sale.ts). A contract for selling a smart object for a pre-determined number of satoshis. This contract does not preserve ordinal ranges so it cannot be used to sell ordinals.
- [OrdSale](./src/ord-sale.ts). An contract for selling an ordinal for a pre-determined number of satoshis.
- [TxWrapper](./src/tx-wrapper.ts). A contract for storing a partially signed transaction in another transaction. This is useful for communicating partially signed transactions over the Bitcoin network.

## Prerequisites

You need to have [git](https://www.git-scm.com/) and [node.js](https://nodejs.org/) installed.

## Installation

<font size=1>

```sh
# Download the monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move into monorepo folder
cd monorepo

# Install the dependencies
npm install
```

</font>

## Usage

You can use the commands below in the folder `packages/swap`.

### Run the Tests

<font size=1>

```bash
npm run test
```

</font>

### Check the Types

<font size=1>

```bash
npm run types
```

</font>

### Run the Linter

<font size=1>

```bash
npm run lint
```

</font>

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/) for the Bitcoin Computer.

## Getting Help

If you have any questions, please let us know on <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram</a>, <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Development Status

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#development-status).

## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node
[ts-badge]: https://img.shields.io/badge/TypeScript-4.5-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2016.13-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v14.x/docs/api/
[gha-badge]: https://github.com/bitcoin-computer/bitcoin-computer-nodejs-template/actions/workflows/nodejs.yml/badge.svg
[bitcoin-computer]: http://bitcoincomputer.io/
[node-typescript-boilerplate]: https://github.com/jsynowiec/node-typescript-boilerplate
[typescript]: https://www.typescriptlang.org/
[typescript-4-5]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/bitcoin-computer/bitcoin-computer-nodejs-template/blob/main/LICENSE
[eslint]: https://eslint.org
