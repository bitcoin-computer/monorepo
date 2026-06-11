<div align="center">
  <h1>TBC721</h1>
  <p>
    An implementation of Ethereum's ERC721 standard on Bitcoin
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

<font size=1>

```typescript
interface ITBC721 {
  mint(to: string, name?: string, symbol?: string, url?: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownerOf(tokenId: string): Promise<string[]>
  transfer(to: string, tokenId: string)
}
```

</font>

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

You can use the commands below in the folder `packages/TBC721`.

### Run the Tests

<font size=1>

```bash
npm run test
```

</font>

### Check the Types

<font size=1>

```bash
npm run types
```

</font>

### Run the Linter

<font size=1>

```bash
npm run lint
```

</font>

## Documentation

Have a look at the [docs](https://docs.bitcoincomputer.io/examples/non-fungible-token/) for using swaps with the Bitcoin Computer.

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
