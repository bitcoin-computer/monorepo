# Bitcoin Chat

A hackable chat that runs on the blockchain. Intended as a starting point for developers to build on top of.

The chat needs no database backend because all data is stored on the blockchain (currently runs on LTC, testnet). The interface between the chat and the blockchain is provided by [Bitcoin Computer](https://bitcoincomputer.io)

## Start the chat

Clone the repo and run

````
yarn start
````

To log into the chat you need a BIP39 seed phrase. You can generate a new seed for example from [here](https://iancoleman.io/bip39/). You then need to fund the wallet using a [LTC faucet](https://testnet-faucet.com/ltc-testnet/)

For more information see the [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/getting-started/run-in-a-browser) or ask in the [Telegram Group](https://t.me/joinchat/FMrjOUWRuUkNuIt7zJL8tg).

## Contributing

The chat is very bare bones and contributions are more than welcome. Have a look at the open issues, or make a pull request with a new feature. You can also request a feature request by creating an issue.

## Screenshots

![login-screen](https://i.ibb.co/RzHdPMS/Screen-Shot-2020-08-29-at-20-03-04.png)

![chat-screen](https://i.ibb.co/WDSCCvb/Screen-Shot-2020-08-29-at-20-02-59.png)

# MIT Licence

Copyright 2020 Clemens Ley

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
