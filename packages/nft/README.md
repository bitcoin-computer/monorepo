<div align="center">
  <h1>TBC NFT</h1>
  <p>
    A template for Create React App with TypeScript and the Bitcoin Computer
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

## Prerequisites

You need to have [git](https://www.git-scm.com/) and [node.js](https://nodejs.org/en/) installed.

## Installation

<font size=1>

```sh
# Download the monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move into monorepo folder
cd monorepo

# Install the dependencies of the monorepo
npm install

# Move to the NFT package folder
cd packages/nft
```

</font>

## Usage

### Start the Application Connecting to a Public Node

The easiest way to get started is to run the commands below and open [http://localhost:1032/](http://localhost:1032/).

<font size=1>

```bash
# Use the environment variables for the public node
cp .env.public-node .env

# Start the app
npm run start
```

</font>

### Start the Application Connecting to a Your Own Node

You need to have a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) installed and running.


<font size=1>

```bash
# Use the environment variables for the public node
cp .env.own-node .env

# Deploy the smart contracts and follow the instructions there
npm run deploy

# Start the app
npm run start
```

</font>

### Fund the Wallet

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#fund-the-wallet).

## Configuration

<font size=1>

```bash
# Default configuration when the user is not logged in
REACT_APP_CHAIN=LTC
REACT_APP_NETWORK=regtest

# Node URLs
REACT_APP_LTC_TESTNET_URL=http://127.0.0.1:1031
REACT_APP_LTC_REGTEST_URL=https://rltc.node.bitcoincomputer.io
REACT_APP_BTC_TESTNET_URL=http://127.0.0.1:1031
REACT_APP_BTC_REGTEST_URL=http://127.0.0.1:1031

# React Application Port
PORT=1032

# Internal, do not change
GENERATE_SOURCEMAP=false

# Smart Contract Locations, these can be generated with the deploy script
REACT_APP_NFT_MOD_SPEC=32ced85751dba336f47a46086e4df79e4b4925a30ebf0e39d2fbe0df4e4f5547:0
REACT_APP_OFFER_MOD_SPEC=575336fb0d7dc61579b0b65628b9d069e82c0cd0435085dc8a85c86167673add:0
REACT_APP_SALE_MOD_SPEC=d83c4d08794cd8b8ad8c137d61c82d40189382496f8b885b90c00b971a1ac9ec:0
REACT_APP_PAYMENT_MOD_SPEC=fab53a193aacbeab7d309687965d4fd275fc49ed2e6784cdad0ec0dee57a5661:0
```

</font>


## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/) for the Bitcoin Computer.

## Getting Help

If you have any questions, please let us know on <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram</a>, <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Development Status
See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#development-status).

## Price

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#price).

## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.

## Legal Notice

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#legal-notice).

## MIT License

Copyright (c) 2022 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node
