# encodeCall

_Creates a transaction from a function call._

## Type

```ts
;<T extends new (...args: any) => any, K extends keyof InstanceType<T>>(params: {
  target: InstanceType<T>
  property: string
  args: Parameters<InstanceType<T>[K]>
  mod?: string
}) =>
  Promise<{
    tx: NakamotoJS.Transaction
    effect: { res: Json; env: Json }
  }>
```

### Parameters

#### `params`

An object with the configuration parameters to encode the expression in a transaction.

{.compact}

| Key      | Type                               | Description                                    |
| -------- | ---------------------------------- | ---------------------------------------------- |
| target   | InstanceType\<T\>                  | The smart object on which to call the function |
| property | string                             | The name of the function being called          |
| args     | Parameters\<InstanceType\<T\>[K]\> | The arguments to the function call             |
| mod      | string                             | A module specifier                             |

Module specifiers are encoded as strings of the form \<transaction id\>:\<output number\>

### Return Value

See [`encode`](./encode.md).

## Description

See [`encode`](./encode.md).

## Examples

```ts
// A smart contract
class Counter extends Contract {
  n: number
  constructor() {
    super({ n: 0 })
  }

  inc(m) {
    this.n += m
  }
}

// Create a smart object from the smart contract
const computer = new Computer({ mnemonic: ... })
const counter = await computer.new(Counter)

// Encode a function call
const { tx } = await computer.encodeCall({
  target: counter,
  property: 'inc',
  args: [1]
})

// Decode the meta data
const decoded = await computer.decode(tx)
expect(decoded).to.deep.eq({
  exp: `__bc__.inc(1)`,
  env: { __bc__: counter._rev },
  mod: ''
})

// Broadcast the tx to commit the change
const txId = await computer.broadcast(tx)
```
