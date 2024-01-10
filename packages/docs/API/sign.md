# sign

Signs a Bitcoin transaction. Options can be passed in that determine which inputs to sign, the sigHash type to use, and which script to use.

### Syntax
```js
computer.sign(tx, opts)
```

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

### Parameters

#### tx
A Bitcoin transaction, possibly partially signed.

#### opts
An object with specific parameters to use when signing

<div align="center" style="font-size: 14px;">
  <table>
    <tr>
      <th>option</th>
      <th>description</th>
    </tr>
    <tr>
      <td>inputIndex</td>
      <td>The input index to be signed</td>
    </tr>
    <tr>
      <td>sighashType</td>
      <td>A valid <a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/src/transaction.d.ts" > sighash type number </a> </td>
    </tr>
    <tr>
      <td>inputScript</td>
      <td>A buffer encoding the signature</td>
    </tr>
  </table>
</div>

### Return value

By default, the `sign` function will make a best effort to sign all inputs, but will not throw any error if the signature cannot be added due to hash mismatch. This is useful in the case of partially signed transactions, where a user can encode an expression, sign with the user private key and send the generated partially signed transaction to another user. Then, the receiver can sign other inputs.

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