<div align="center">
  <img src="./imgs/bitcoin-computer-node@1x.png" alt="bitcoin-computer-logo" border="0" style="max-height: 180px"/>
  <h1>Bitcoin Computer Node</h1>
  <p>
    A Bitcoin and Litecoin Node Optimized for Advanced Applications
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

The Bitcoin Computer Node is the backend for the Bitcoin Computer, a trustless general purpose smart contracts protocol for Bitcoin. The node consists of a Bitcoin node and a psql database with index structures.

## Features

- Query for the balance, the UTXO set, and the list of transactions of an address
- Multiplatform Docker images (linux/amd64, linux/arm/v7, linux/arm64)
- Allow and deny access to Bitcoin RPC endpoints using a regular expression
- Filter IP addresses by country
- Enforce allowlist and denylist
- Optimized for development, you can run large test suites on regtest
- Synchronizes in parallel
- All functionality of a Bitcoin node (build, sign, and broadcast txs, rpc)
- Easy to use an powerful [client side library](../lib/README.md).

## Prerequisites

You need to have [git](https://www.git-scm.com/), [node.js](https://nodejs.org/) and [docker](https://www.docker.com/) installed.

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

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/node/).

## Getting Help

If you have any questions, please let us know on <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram</a>, <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Development Status

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#development-status).

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
