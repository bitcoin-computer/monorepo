# Bitcoin Computer Wallet

A minimal non-custodial Litecoin web wallet built with [Bitcoin Computer](https://www.bitcoincomputer.io/) and [Create React App](https://create-react-app.dev/).

![Screenshot](public/screenshot.png)

## Installation

Install the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo). Then navigate from the root folder of the monorepo to the folder ``packages/wallet``.

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
cd packages/wallet
```

## Usage

### Start the Server

To start the application run
```bash
yarn start
```
and open [http://localhost:3001](http://localhost:3001) in a browser.

### Configuration

The application defaults to testnet mode. You can run it in regtest or mainnet mode you can run a [Bitcoin Computer Node][node]. To configure the web app to connect to your own node, have a look at the comment at the top of "App.js". Support for mainnet will be added soon.

### Log In

This app is very bare bones and does not have a client side user log in. To change the logged in user you can change the ``mnemonic`` property of the ``opts`` object at the top of ``App.js``.

### Fund the Wallet

You need to send some cryptocurrency to your wallet address to mint or send a token. You can find the current wallet address at the top of the application.

If you run the application in testnet mode you can fund the wallet for free using a Litecoin faucet ([here](https://testnet-faucet.com/ltc-testnet/) or [here](http://litecointf.salmen.website/)).

If you run on regtest mode you can run
```
yarn fund-ltc
```
to fund your wallet for free from the [Bitcoin Computer Node][node].

### Send Cryptocurrency

Insert the destination address, select the amount (must be smaller than your balance), and click send
## Support

For more information see the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io) or ask in the [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg).

## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.
## License

Licensed under the MIT license. See the [LICENSE](https://github.com/bitcoin-computer/monorepo/blob/main/packages/wallet/LICENSE) file for details.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node 