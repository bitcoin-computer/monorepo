<div align="center">
  <h1>Bitcoin Computer Wallet</h1>
  <p>
    A Bitcoin and Litecoin Wallet for Payments and Smart Contracts
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

## Prerequisites

You need to have [git](https://www.git-scm.com/) and [node.js](https://nodejs.org/) installed.

## Installation

Follow the instructions below to install the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo).

<font size=1>

```sh
# Download the monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move into monorepo folder
cd monorepo

# Install the dependencies
npm install

# Move to the package
cd packages/wallet
```

</font>

## Usage

### Start the Application Connecting to a Remote Node

Run the commands below and open [http://localhost:1033](http://localhost:1033).

<font size=1>

```bash
# Create a .env file
cp .env.remote.example .env

# Start the app
npm run start
```

</font>

### Start the Application Connecting to a Local Node

You need to have a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) installed and running. Then run the commands below and open [http://localhost:1033](http://localhost:1033).

<font size=1>

```bash
# Create a .env file
cp .env.local.example .env

# Start the app
npm run start
```

</font>

### Fund the Wallet

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#fund-the-wallet).

### Configuration

To change the configuration please edit the `.env` file.

<font size=1>

```bash
# Application configuration
REACT_APP_CHAIN=LTC
REACT_APP_NETWORK=regtest
REACT_APP_URL=https://rltc.node.bitcoincomputer.io

# Application Port
PORT=1033

REACT_APP_EXPLORER_URL=https://explorer.bitcoincomputer.io/

```

</font>

## Documentation

Have a look at the [documentation](https://docs.bitcoincomputer.io/).

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
