# Bitcoin Computer Monorepo

Infrastructure for building Smart Contracts on Litecoin, Bitcoin and other UTXOs-based blockchains.

## Get Started
You can use our template to get started with your own project. It includes a simple example that computes the balance of an address.

```bash
npx create-react-app app-name --template @bitcoin-computer/cra-template
```

A new Computer object is created in the App.js file. The Computer object is used to interact with the blockchain.

```javascript
const [computer] = useState(
    new Computer({
      ...config,
      mnemonic:
        "travel upgrade inside soda birth essence junk merit never twenty system opinion",
    })
  );
```

In the template, the Computer object is used to get the balance of an address. The address is passed as a prop to the App component.

```javascript
const newBalance = await computer.db.wallet.getBalance();
```

You can use the config options to connect to a different blockchain. The default is Litecoin Testnet. If you want to connect to `regtest`, you can use the following config.

```javascript
const [config] = useState({
    chain: "LTC",
    network: "regtest",
    url: "http://127.0.0.1:3000",
  });
```  

Many other examples can be found in the [Applications](#applications) section. The complete documentation can be found in [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/).

## Library

* [Bitcoin Computer Lib](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib): A library for building smart contracts on Litecoin/Bitcoin.
* [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node): It provides trustless access to the [Bitcoin Computer](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib). It provides the backend infrastructure for running smart contract based applications. It consists of a Litecoin/Bitcoin node, a database for storing index structures and off-chain data, and a web server.

## Standard Smart Contracts

* [BRC20 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC20): A Bitcoin Computer implementation of the ERC20 Fungible Token Standard. See the [documentation](https://docs.bitcoincomputer.io/advanced-examples/fungible-token/) for more information.
* [BRC721 contract](https://github.com/bitcoin-computer/monorepo/tree/main/packages/BRC721): A Bitcoin Computer implementation of the ERC751 Non-Fungible Token Standard on Litecoin/Bitcoin. See the [documentation](https://docs.bitcoincomputer.io/advanced-examples/non-fungible-token/) for more information.


## Applications

* [Bitcoin chat](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat)
* [Bitcoin wallet](https://github.com/bitcoin-computer/monorepo/tree/main/packages/wallet)
* [Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token)
* [Non Fungible Token](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token)


## Questions

If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.

## Documentation and Help

Have a look at the [Bitcoin Computer Docs](https://bitcoin-computer.gitbook.io/docs/) or [create an issue](https://github.com/bitcoin-computer/monorepo/issues).

## Price

* Testnet: The Bitcoin Computer will be free forever on testnet.
* Mainnet: The fees for the Bitcoin Computer are exactly the same as the miners fees. For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the Litecoin/Bitcoin miners, and one cent to support the development of the Bitcoin Computer.
