<div align="center">
  <h1>Bitcoin Computer Components</h1>
  <p>
    A component library for smart contract driven applications
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

This package contains components that are used in several applications. Have a look at the other packages for how to use.

Currently it contains the following:

- [Auth](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Auth.tsx) - Login and logout
- [Wallet](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Wallet.tsx) - Deposit cryptocurrency
- [Gallery](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Gallery.tsx) - displays a grid of smart objects
- [SmartObject](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/SmartObject.tsx) - displays a smart object and has a form for each of its methods
- [Transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Transaction.tsx) - displays a transaction including its Bitcoin Computer expression if it has one
- [Modal](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Modal.tsx) - displays a modal window

## Use

To re-build the code run

```js
npm run build
```

To run lint run

```js
npm run lint
```

To run types run

```js
npm run types
```

</font>

You might have to restart the applications.

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
