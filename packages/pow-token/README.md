<div align="center">
  <h1>Bitcoin Computer Proof of Work Token</h1>
  <p>
    An implementation of a proof-of-work (PoW) fungible token built on the Bitcoin Computer metaprotocol. It enables users to mint tokens through client-side PoW computation. Inspired by Bitcoin's architecture, it features dynamic difficulty adjustment, longest/heaviest-chain consensus for forks, and fungible token mechanics (transfer, merge, burn) compatible with multiple UTXO chains like Bitcoin (BTC), Litecoin (LTC) and Dogecoin (DOGE).

    The tokens can be minted by anyone who wants to contribute to the network, and can be used to interact with dApps on the Bitcoin Computer ecosystem. Every token is minted by solving a proof of work puzzle, which requires computational resources. This ensures that the token has intrinsic value, like in Bitcoin, no initial token supply is created, and the token distribution is fair and decentralized.

    The tokens will be minted in the underlying connected Bitcoin Computer Node blockchain. Configure the .env file to setup the wallet for which the tokens will be minted. The token contract will automatically adjust the difficulty of the proof of work puzzle based on the current network conditions, ensuring a consistent minting rate over time. The token also implements a longest/heaviest-chain consensus mechanism to handle forks in the underlying blockchain, ensuring that the token supply remains consistent and secure.

    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>

  </p>
</div>

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

## Getting started

1. Configure the variables in the file in the `packages/pow-token/.env` as needed (or copy the `.env.example`). The default values are set to connect to a local Bitcoin Computer Node running on `regtest`.

2. Run or connect to a Bitcoin Computer Node (see the Node [docs](https://docs.bitcoincomputer.io) for details).

3. Deploy the contracts

```
cd packages/pow-token
npm run deploy
```

4. Start the PoW token service

```
npm run start
```

## Usage

You can use the commands below in the folder `packages/pow-token`.

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

If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.

[ts-badge]: https://img.shields.io/badge/TypeScript-4.5-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2016.13-blue.svg
[gha-badge]: https://github.com/bitcoin-computer/bitcoin-computer-nodejs-template/actions/workflows/nodejs.yml/badge.svg
[bitcoin-computer]: http://bitcoincomputer.io/
