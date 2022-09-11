# BRC20 Fungible Token Contract

An implementation of the ERC20 [standard](https://eips.ethereum.org/EIPS/eip-20) on Bitcoin.

Built on the [Bitcoin Computer](http://bitcoincomputer.io/), a lightweight smart contract system for Litecoin. See the the [documentation](https://docs.bitcoincomputer.io/advanced-examples/fungible-token/) for more information.

The following interface is implemented.

```js
interface IBRC20 {
  mint(publicKey: string, amount: number): Promise<string>
  totalSupply(): Promise<number>
  balanceOf(publicKey: string): Promise<number>
  transfer(to: string, amount: number): Promise<void>
}
```

The code is under active development. Do not use in production.

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
