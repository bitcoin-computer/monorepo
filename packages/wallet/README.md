# Bitcoin Computer Wallet

A minimal non-custodial Litecoin web wallet built with [Bitcoin Computer](https://www.bitcoincomputer.io/) and [Create React App](https://create-react-app.dev/).

![Screenshot](https://i.ibb.co/6rG5f5H/Untitled-4.png)

## Installation

Install the [Bitcoin Computer  Monorepo](https://github.com/bitcoin-computer/monorepo). Then navigate from the root folder of the monorepo to the folder ``packages/wallet``.

```bash
git clone git@github.com:bitcoin-computer/monorepo.git
cd monorepo
lerna bootstrap
cd packages/wallet
```

## Usage

### Testnet

To start the wallet on testnet run the command below and open [http://localhost:3001](http://localhost:3001) in a browser.

```bash
yarn start
```

If the balance is 0 you can fund the testnet Litecoin address ``mvFeNF9DAR7WMuCpBPbKuTtheihLyxzj8i`` with some testnet Litecoin from a [Litecoin faucet](https://testnet-faucet.com/ltc-testnet/). Once the wallet is funded you can send testnet Litecoin to other wallets.

### Regtest

To start the wallet in regtest mode you can run a [Bitcoin Computer Node](). Then have a look at the comment at the top of "App.js" to see how to configure the wallet to connect to the node.

### Mainnet

Coming soon.
## Support

For more information see the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/getting-started/run-in-a-browser) or ask in the [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg).

## Contributing

This project is intended as a starting point for new development so we want to keep it simple. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.
## License

Licensed under the MIT license. See the [LICENSE](https://github.com/bitcoin-computer/monorepo/blob/main/packages/wallet/LICENSE) file for details.
