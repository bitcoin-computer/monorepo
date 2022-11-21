# BRC721 Non-Fungible Token Contract

An implementation of the ERC721 [standard](https://eips.ethereum.org/EIPS/eip-721) on Bitcoin.

Built on the [Bitcoin Computer](http://bitcoincomputer.io/), a lightweight smart contract system for Litecoin and Bitcoin. See the the [documentation](https://docs.bitcoincomputer.io/advanced-examples/fungible-token/) for more information.

The following interface is currently implemented.

```js
interface IBRC721 {
  mint(to: string, name?: string, symbol?: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownerOf(tokenId: string): Promise<string[]>
  transfer(to: string, tokenId: string)
}
```

The interface and its implementation are under active development. Do not use in production.

## Types

```js
yarn types
```

## Lint

```js
yarn lint
```

## Test

```js
yarn test
```

If you get an error "Insufficient balance ..." have a look at the [docs](https://docs.bitcoincomputer.io/troubleshoot/) for how to fund the wallet.
