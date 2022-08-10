# [Bitcoin Computer Bitcore](https://github.com/bitcoin-computer/bitcoin-source): A Bitcoin implementation written in modern Javascript

## About Bitcoin Computer Bitcore

Bitcoin Computer Bitcore is a community driven effort to produce a readable, reliable and modern Javascript implementation of Bitcoin. Most current Javascript Bitcoin implementations do not adhere to modern coding standards and are very hard to read as a consequence. We want to create a Bitcoin implementation that every JavaScript programmer can read and understand.

In step one, we want to get the entire codebase to comply with the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). Step two will be to port the code base to ES6. Step three will be to statically typecheck the entire codebase with Facebook’s Flow. We suspect we will uncover bugs in the process.

We are looking for contributors. You do not have to be a Bitcoin protocol expert to contribute. All you need to be is a good Javascript programmer. If you want to help, check out [CONTRIBUTING.md](https://github.com/bitcoin-computer/bitcoin-source/blob/master/CONTRIBUTING.md) or email [clemens@bitcoincomputer.io](mailto:clemens@bitcoincomputer.io).

## Installation

### Using NPM

```s
$ npm install --save bitcoin-source
```

### Manually

You can also download a pre-compiled and minified version here: [dist](https://github.com/bitcoin-computer/bitcoin-source/tree/master/dist/bitcoin-source-0.9.11.js)

## Examples

You can find many useful, up-to-date examples to get you started right away by following the provided
examples:

- [Generate a random address](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#generate-a-random-address)
- [Generate a address from a SHA256 hash](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#generate-a-address-from-a-sha256-hash)
- [Translate an address to any Bitcoin Cash address format](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#translate-an-address-to-any-bitcoin-cash-address-format)
- [Read an address from any Bitcoin Cash address format](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#read-an-address-from-any-bitcoin-cash-address-format)
- [Import an address via WIF](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#import-an-address-via-wif)
- [Create a Transaction](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#create-a-transaction)
- [Verify a Bitcoin message](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#verify-a-bitcoin-message)
- [Sign a Bitcoin message](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#sign-a-bitcoin-message)
- [Create an OP RETURN transaction](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#create-an-op-return-transaction)
- [Create a 2-of-3 multisig P2SH address](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
- [Spend from a 2-of-2 multisig P2SH address](https://github.com/bitcoin-computer/bitcoin-source/blob/master/docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)

## Security

Bitcoin Computer Bitcore is a fork of [bitcore-lib](https://github.com/bitpay/bitcore-lib/), which is used in production at Bitpay Inc. and many other [projects](http://bitcore.io#projects). If you find a security issue, please email [clemens@bitcointoken.com](mailto:clemens@bitcointoken.com).

## Contributing

This is an open-source project, and any form of contribution is welcome. Feel free to create an issue in case you would like to share ideas for improvement, or would like to report a bug. Also, please send pull requests for bug fixes or code optimization. For more information on how to contribute, please refer to our [CONTRIBUTING](CONTRIBUTING.md) file.

## Development

To get started with development, you should first clone the repository and install any dependencies:

```s
$ git clone https://github.com/bitcoin-computer/bitcoin-source
$ cd bitcoin-computer-bitcore
$ npm install
```

Next, you can check everything is installed correctly by running the full test-suite and verifying that all tests are completed successfully.

```s
$ npm test
```

## Progress

| File                                    |               Airbnb Style Guide                |                           ES6                           |                          Flow                           |
| --------------------------------------- | :---------------------------------------------: | :-----------------------------------------------------: | :-----------------------------------------------------: |
| address.js                              | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| block/block.js                          | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| block/blockheader.js                    | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| block/index.js                          | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| block/merkleblock.js                    | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| crypto/bn.js                            | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| crypto/ecdsa.js                         | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| crypto/hash.js                          | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| crypto/point.js                         | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| crypto/random.js                        | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |   ![not done](https://i.imgur.com/RXSkZTD.png 'Done')   |
| crypto/signature.js                     | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| encoding/base58.js                      | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| encoding/base58check.js                 | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| encoding/bufferreader.js                | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| encoding/bufferwriter.js                | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| encoding/varint.js                      | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| errors/index.js                         | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| errors/spec.js                          | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| hdprivatekey.js                         | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| hdpublickey.js                          | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| message.js                              | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/index.js                       | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/mnemonic.js                    | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/pbkdf2.js                      | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/words/chinese.js               | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/words/english.js               | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/words/french.js                | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/words/index.js                 | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/words/italian.js               | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/words/japanese.js              | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| mnemonic/words/spanish.js               | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| networks.js                             | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| opcode.js                               | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| privatekey.js                           | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| publickey.js                            | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| script/index.js                         | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| script/interpreter.js                   | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| script/script.js                        | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/index.js                    | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/input/index.js              | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/input/input.js              | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/input/multisig.js           | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/input/multisigscripthash.js | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/input/publickey.js          | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/input/publickeyhash.js      | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/input/scripthash.js         | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/output.js                   | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/sighash.js                  | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/signature.js                | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/transaction.js              | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| transaction/unspentoutput.js            | ![done](https://i.imgur.com/RXSkZTD.png 'Done') |     ![done](https://i.imgur.com/RXSkZTD.png 'Done')     | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| unit.js                                 | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| uri.js                                  | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| util/buffer.js                          | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| util/js.js                              | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |
| util/preconditions.js                   | ![done](https://i.imgur.com/RXSkZTD.png 'Done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') | ![not done](https://i.imgur.com/MleS2Jt.png 'Not done') |

## License

Code released under [the MIT license](https://github.com/bitcoin-computer/bitcoin-source/blob/master/LICENSE).
