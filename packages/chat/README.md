<div align="center">
  <h1>Bitcoin Computer Chat</h1>
  <p>
    A chat that's as stable as Bitcoin and Litecoin
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

<!-- ![chat-screen](./imgs/chat-screen.png) -->

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

Start a Bitcoin Computer Node in the package `node`. Then copy the `.env.example` file.

```
cp .env.example .env
```

### Deploy Smart Contract

Deploy the smart contract. The script will prompt you to update the `.env` file.

```
npm run deploy
```

### Start the Application

Run the command below and open [http://localhost:3000](http://localhost:3000)

<font size=1>

```bash
# Move to the package
cd packages/chat

# Start the app
npm run start
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
