<div align="center">
  <h1>NakamotoJS</h1>
  <p>
    A fork of BitcoinJS tailored towards advanced applications like swaps
  </p>
</div>

<div align="center">

  <a href="">[![Github CI](https://github.com/bitcoinjs/bitcoinjs-lib/actions/workflows/main_ci.yml/badge.svg)](https://github.com/bitcoinjs/bitcoinjs-lib/actions/workflows/main_ci.yml)</a>
  <a href="">![NPM](https://img.shields.io/npm/v/@bitcoin-computer/nakamotojs.svg)</a>
  <a href="">[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)</a>

</div>

This fork makes the following changes to <a href="https://github.com/bitcoinjs/bitcoinjs-lib/" target="_blank">BitcoinJS</a>
* Adds support for Litecoin (support for Dogecoin coming soon)
* Adds support for signing transactions (BitcoinJS can only sign PSBTs).

While PSBTs are a great for serialization, they are restrictive as they cannot be modified after the first signature is added. This is an issue for applications like swaps where multiple users need to build a transaction collaboratively. In these cases users can take advantage of SIGHASH types that allow the modifications of part of a transaction after a signature is added.

## Installation

Install the [Bitcoin Computer Monorepo](https://github.com/bitcoin-computer/monorepo). Then navigate from the root folder of the monorepo to the folder ``packages/explorer``.

<font size=1>

```sh
# Download the monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move to the package
cd monorepo/packages/nakamotojs

# Install the dependencies
yarn install
```

</font>

## Usage

### Run the Tests

<font size=1>

```bash
yarn test
```

</font>

### Run the Linter

<font size=1>

```bash
yarn lint
```

</font>

### Build the Sources

<font size=1>

```bash
yarn build
```

</font>


## BitcoinJS Docs

See [here](https://github.com/bitcoinjs/bitcoinjs-lib).

## Examples

The below examples are implemented as integration tests, they should be very easy to understand.
Otherwise, pull requests are appreciated.
Some examples interact (via HTTPS) with a 3rd Party Blockchain Provider (3PBP).

- [Taproot Key Spend](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/taproot.spec.ts)
- [Generate a random address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Import an address via WIF](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Generate a 2-of-3 P2SH multisig address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Generate a SegWit address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Generate a SegWit P2SH address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Generate a SegWit 3-of-4 multisig address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Generate a SegWit 2-of-2 P2SH multisig address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Support the retrieval of transactions for an address (3rd party blockchain)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Generate a Testnet address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Generate a Litecoin address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/addresses.spec.ts)
- [Create a 1-to-1 Transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a typical Transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction with an OP_RETURN output](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction with a 2-of-4 P2SH(multisig) input](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction with a SegWit P2SH(P2WPKH) input](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction with a SegWit P2WPKH input](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction with a SegWit P2PK input](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction with a SegWit 3-of-4 P2SH(P2WSH(multisig)) input](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction and sign with an HDSigner interface (bip32)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/transactions.spec.ts)
- [Import a BIP32 testnet xpriv and export to WIF](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/bip32.spec.ts)
- [Export a BIP32 xpriv, then import it](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/bip32.spec.ts)
- [Export a BIP32 xpub](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/bip32.spec.ts)
- [Create a BIP32, bitcoin, account 0, external address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/bip32.spec.ts)
- [Create a BIP44, bitcoin, account 0, external address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/bip32.spec.ts)
- [Create a BIP49, bitcoin testnet, account 0, external address](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/bip32.spec.ts)
- [Use BIP39 to generate BIP32 addresses](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/bip32.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction where Alice can redeem the output after the expiry (in the past)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/cltv.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction where Alice can redeem the output after the expiry (in the future)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/cltv.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction where Alice and Bob can redeem the output at any time](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/cltv.spec.ts)
- [Create (but fail to broadcast via 3PBP) a Transaction where Alice attempts to redeem before the expiry](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/cltv.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction where Alice can redeem the output after the expiry (in the future) (simple CHECKSEQUENCEVERIFY)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/csv.spec.ts)
- [Create (but fail to broadcast via 3PBP) a Transaction where Alice attempts to redeem before the expiry (simple CHECKSEQUENCEVERIFY)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/csv.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction where Bob and Charles can send (complex CHECKSEQUENCEVERIFY)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/csv.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction where Alice (mediator) and Bob can send after 2 blocks (complex CHECKSEQUENCEVERIFY)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/csv.spec.ts)
- [Create (and broadcast via 3PBP) a Transaction where Alice (mediator) can send after 5 blocks (complex CHECKSEQUENCEVERIFY)](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/test/integration/csv.spec.ts)

If you have a use case that you feel could be listed here, please [ask for it](https://github.com/bitcoinjs/bitcoinjs-lib/issues/new)!

## Contributing

Contributions are most welcome. If you have found a bug please create an [issue](https://github.com/bitcoin-computer/monorepo/issues). If you have a bug fix or a UX improvement please create a pull request [here](https://github.com/bitcoin-computer/monorepo/pulls).

If you want to add a feature we recommend to create a fork. Let us know if you have built something cool and we can link to your project.

## MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[node]: https://github.com/bitcoin-computer/monorepo/tree/main/packages/node
