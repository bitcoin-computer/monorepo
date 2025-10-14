---
order: -37
icon: beaker
visibility: hidden
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

#### `min relay fee not met` error

This error is thrown by the Bitcoin node. This error occurs when the transaction fee is lower than the minimum required by the network. In general, the parameter `satPerByte` is considered to build the transaction, but in some scenarios the mempool may require a higher fee to accept the transaction (e.g., large transactions with multiple signature operations). To resolve this, you can increase the transaction fee, modify the `satPerByte` parameter in your configuration.

#### `bad-txns-inputs-missingorspent` error

This error is thrown by the Bitcoin node. This error indicates that the transaction is missing an input or the input has already been spent. To fix this, ensure that all inputs are valid and not previously used in another transaction.

#### `Cannot call a function on a smart object that is pointed to` error

When one on chain object `a` is the property of another on chain object `b`, then, you cannot directly call a function on `b`. To update `b`, you have to call a function on `a` that modifies it's property `b`.
