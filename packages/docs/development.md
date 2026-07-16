---
order: -37
icon: beaker
---

# Development

## Troubleshooting

### Production mode

There are two modes to run the system: development mode and production mode. In development mode, the system is not optimized and includes additional checks to help with debugging. For example, you can use the `console.log()` function to print messages to the console inside of smart contract methods. Also, the ses `lockdown` is not applied in development mode. The `lockdown` prevents the use of certain JavaScript features that are not safe for smart contracts, such as `eval` and `Function` constructor, or the use or overwriting of certain global objects, such as `Array` or `Object`. See the ses docs for more details.

The production mode is intended for running the system in a live environment. This is the default mode.

To switch to 'dev' mode, configure the options in the Computer constructor as follows:

```ts
const computer = new Computer({
  mode: 'dev',
  // other options...
})
```

### Common Issues

#### `Cannot define property <property name> ` error

This error occurs when TypeScript emits `Object.defineProperty` calls for class fields (e.g. `n: number`), but the library's security proxy blocks them to prevent direct property assignment outside methods. To resolve this, you can disable the `useDefineForClassFields` option in your `tsconfig.json` file.

```json
{
  "compilerOptions": {
    "useDefineForClassFields": false
    // other options...
  }
}
```

#### `Cannot set property <property name> directly` error

This error is thrown when you try to set a property of a smart contract object directly, instead of through a method. To fix this, ensure that you are only updating properties of smart contract objects through their methods.

If you are using vite, or similar bundler, you may also need to disable minification in your build configuration, as minification can interfere with the library's security proxy and cause this error to be thrown even when properties are being set through methods.

```js
// vite.config.js
export default defineConfig({
  // other options...
  build: {
    minify: false,
  },
})
```

#### `min relay fee not met` error

This error is thrown by the Bitcoin node. This error occurs when the transaction fee is lower than the minimum required by the network. In general, the parameter `satPerByte` is considered to build the transaction, but in some scenarios the mempool may require a higher fee to accept the transaction (e.g., large transactions with multiple signature operations). To resolve this, you can increase the transaction fee, modify the `satPerByte` parameter in your configuration.

(Note: this refers to *miner* fees. The separate on-chain technical dust/UTXO hygiene costs, user choices to control them, and regulatory notes are covered in the [Fees](./fees.md) and [Legal Notice](./legal.md) documentation.)

#### `bad-txns-inputs-missingorspent` error

This error is thrown by the Bitcoin node. This error indicates that the transaction is missing an input or the input has already been spent. To fix this, ensure that all inputs are valid and not previously used in another transaction.

#### `txns-mempool-conflict` error

This error is thrown by the Bitcoin node. This error indicates that the transaction conflicts with another transaction in the mempool. For example, if two transactions try to spend the same input, only one of them can be accepted by the mempool.

The reasons could be timing issues. In this case, add a delay between broadcasting multiple transactions. Another common reason is when you are building a transaction that you are not broadcasting immediately, and in the meantime another transaction that spends the same input is broadcast.
