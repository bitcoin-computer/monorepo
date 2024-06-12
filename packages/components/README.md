<div align="center">
  <h1>TBC Components</h1>
  <p>
    A component library for smart contract driven applications
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

> [!WARNING]
> Built for internal use.

This package contains components that are used in several applications. Have a look at the other packages for how to use.

Currently it contains the following:
* [Auth](./src/Auth.tsx) - Login and logout
* [Wallet](./src/Wallet.tsx) - Deposit cryptocurrency 
* [Gallery](./src/Gallery.tsx) - displays a grid of smart objects
* [SmartObject](./src/SmartObject.tsx) - displays a smart object and has a form for each of its methods
* [Transaction](./src/Transaction.tsx) - displays a transaction including its TBC expression if it has one
* [Modal](./src/Wallet.tsx) - displays a modal window

## Use

To re-build the code run 

<font size=1>

```js
npm run compile
```

</font>

You might have to restart the applications.

## Legal Notice

See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/lib#legal-notice).