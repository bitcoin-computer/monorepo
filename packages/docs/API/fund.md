# fund

Funds a Bitcoin transaction.

### Syntax
```js
await computer.fund(tx)
```

### Type
```ts
(tx: BitcoinLib.Transaction, opts?: Fee & FundOptions): Promise<void>
```

### Parameters

#### tx
A Bitcoin transaction object.

#### opts

An optional object can be passed as parameter to ```include``` or ```exclude``` certain UTXOs. When using ``include``, the transaction will be funded with the UTXOs specified as the first inputs. 

<div align="center" style="font-size: 14px;">
  <table>
    <tr>
      <th>option</th>
      <th>description</th>
    </tr>
    <tr>
      <td>include</td>
      <td>An array of UTXOs to be included in the funding process</td>
    </tr>
    <tr>
      <td>exclude</td>
      <td>An array of UTXOs to be excluded in the funding process</td>
    </tr>
  </table>
</div>


### Return value

If the wallet does not have sufficient funds, an error is thrown. 

### Examples
```ts
class C extends Contract {}
const { tx } = await computer.encode({
  exp: `${C} new ${C.name}()`
  fund: false
})
await computer.fund(tx)
```