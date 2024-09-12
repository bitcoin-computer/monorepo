<div align="center">
  <h1>Bitcoin Computer NFT</h1>
  <p>
    A application for minting, storing, and selling NFTs
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

## Prerequisites

You need to have [git](https://www.git-scm.com/) and [node.js](https://nodejs.org/en/) installed.

## Installation

Follow the instructions below to install the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo).

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

### Start the Application Connecting to a Remote Node

Run the commands below and open [http://localhost:1034/](http://localhost:1034/).

<font size=1>

```bash
# Use the environment variables for the public node
cp .env.remote.example .env

# Start the app
npm run start
```

</font>

### Start the Application Connecting to a Local Node

You need to have a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) installed and running. Then run the commands below and open [http://localhost:1034](http://localhost:1034).


<font size=1>

```bash
# Use the environment variables for the public node
cp .env.local.example .env

# Deploy the smart contracts and follow the instructions there
npm run deploy

# Start the app
npm run start
```

</font>

You need to copy the smart contract locations into your .env file after running the deploy script.

### Fund the Wallet

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#fund-the-wallet).

## Configuration

To change the configuration please edit your `.env` file.

<font size=1>

```bash
# Application Configuration
REACT_APP_CHAIN=LTC
REACT_APP_NETWORK=regtest
REACT_APP_URL=http://127.0.0.1:1031

# Application Port
PORT=1034

# Module System Storage Type
REACT_APP_MODULE_STORAGE_TYPE=taproot

# Smart Contract Locations
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

## Contributing

Contributions are most welcome! If you have found a bug or have an idea for an improvement please create an [issue](https://github.com/bitcoin-computer/monorepo/issues) or a [pull request](https://github.com/bitcoin-computer/monorepo/pulls).

## Development Status

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#development-status).

## Price

Free for a limited time only. See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#price) for details.

## Legal Notice

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#legal-notice).

## MIT License

Copyright (c) 2022 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node
