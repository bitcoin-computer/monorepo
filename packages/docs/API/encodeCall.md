# encodeCall

Encodes a function call on a smart object.

### Syntax
```js
const { tx, effect } = await computer.encodeCall(params)
```

### Type
```ts
({
  target: InstanceType<T> & Location,
  property: string,
  args: Parameters<InstanceType<T>[K]>,
  mod?: string
}) => Promise<BitcoinLib.Transaction>
```

### Parameters

#### params
An object with the basic configuration parameters to encode the expression in a transaction.

<div align="center" style="font-size: 14px;">
  <table>
    <tr>
      <th>parameter</th>
      <th>description</th>
    </tr>
    <tr>
      <td>target</td>
      <td>A smart object to which the function will be applied</td>
    </tr>
    <tr>
      <td>property</td>
      <td>The name of the function being called</td>
    </tr>
    <tr>
      <td>args</td>
      <td>The argument list fo the function being called</td>
    </tr>
    <tr>
      <td>mod</td>
      <td>If the function call creates a object using a class from a module already deployed, the string with the location of that module</td>
    </tr>
  </table>
</div>

<br>

### Return value
It returns a [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/ts_src/transaction.ts) and an object of type Effect (see [encode return type](/api/encode/#return-value)).

### Examples
```ts
class Counter extends Contract {
  n: number
  constructor() {
    super({ n: 0 })
  }
  inc(m) {
    this.n += m
  }
}
const computer = new Computer()
const counter = await computer.new(Counter)

const { tx } = await computer.encodeCall({
  target: counter,
  property: 'inc',
  args: [1]
})
const decoded = await computer.decode(tx)

expect(decoded).to.deep.eq({
  exp: `__bc__.inc(1)`,
  env: { __bc__: counter._rev },
  mod: ''
})
```