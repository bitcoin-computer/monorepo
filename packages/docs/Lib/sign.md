# sign

Signs a Bitcoin transaction. Options can be passed in that determine which inputs to sign, the sigHash type to use, and which script to use.

### Type
```ts
(
  tx: BitcoinLib.Transaction,
  opts: {
    inputIndex?: number
    sighashType?: number
    inputScript?: Buffer
  }
) => void
```

### Syntax
```js
computer.sign(tx, opts)
```

### Parameters

#### tx
A Bitcoin transaction, possibly partially signed.

#### opts
An object with specific parameters to use when signing

{.compact}
| Key         | Type   | Description                                                                                                                                                   |
|-------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| inputIndex  | number | The input index to be signed                                                                                                                                  |
| sighashType | number | A valid <a target="_blank" href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/src/transaction.d.ts">sighash type number</a> |
| inputScript | Buffer | A buffer encoding the signature                                                                                                                               |


### Return value

By default, the `sign` function will make a best effort to sign all inputs, but will not throw an error if the signature cannot be added due to hash mismatch.

This is useful in the case of partially signed transactions, where a user can encode an expression, sign with the user private key and send the generated partially signed transaction to another user. Then, the receiver can sign other inputs.

### Examples
```ts
class C extends Contract {}
const tx = await computer.encode({
  exp: `${C} new ${C.name}()`
  sign: false
})
await computer.fund(tx)
computer.sign(tx)
```