<div align="center">
  <h1>TBC NFT App</h1>
  <p>
    A web application for creating, storing and sending non-fungible tokens
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

![app image](https://i.ibb.co/5TtGCJ3/Untitled-5.png)

> [!WARNING]
> This app needs refactoring and is not ready for use

## Prerequisites

You need to have a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) installed and running.

## Installation

<font size=1>

```sh
# Download the monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move to the package
cd monorepo/packages/non-fungible-token

# Create a .env file
cp .env.example .env

# Install the dependencies
npm install
```

</font>

## Usage

### Deploy the Smart Contract

Before you can run the app you need to deploy the smart contract. To do so run

<font size=1>

```bash
npm run deploy
```

</font>

Once the smart contract is deployed the deploy script will give you instructions to copy some lines of code into the file "App.js". After that you can start the server.

### Start the Server

To start the application run

<font size=1>

```bash
npm run start
```

</font>

and open [http://localhost:3000](http://localhost:3000) in a browser.

## Video

You can watch us writing the first version of this app in this [video](http://www.youtube.com/watch?feature=player_embedded&v=SnTwevzmRrs
).

### Fund the Wallet

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#fund-the-wallet).

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/) for the Bitcoin Computer.

## Getting Help

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer" target="_blank">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken" target="_blank">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Price

See [here](https://www.npmjs.com/package/@bitcoin-computer/lib#price).

## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.

## MIT License

Copyright (c) 2022 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node
