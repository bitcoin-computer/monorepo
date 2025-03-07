# encodeNew

_Creates a transaction from a constructor call._

## Type

```ts
;<T extends new (...args: any) => any>(params: {
  constructor: T
  args?: ConstructorParameters<T>
  mod?: string
}) =>
  Promise<{
    tx: NakamotoJS.Transaction
    effect: { res: Json; env: Json }
  }>
```

### Parameters

#### `params`

{.compact}
| Key | Description |
| -----------| ----------------------------------------------- |
| constructor| A JavaScript class that extends from `Contract`. |
| args | Arguments to the constructor of the class. |
| mod | A string of the form `<id>:<num>` specifying the location of a module. |

### Return Value

See [`encode`](./encode.md).

## Description

See [`encode`](./encode.md).

## Examples

```ts
// A smart contract
class C extends Contract {}

// Encode a constructor call
const computer = new Computer()
const { tx, effect } = await computer.encodeNew({
  constructor: C,
  args: [],
})

// Decode transaction
const decoded = await computer.decode(tx)
expect(decoded).to.deep.eq({
  exp: `${C} new C()`,
  env: {},
  mod: '',
})

// Broadcast the tx to create the on-chain object
const txId = await computer.broadcast(tx)

// Synchronizing to the transaction id always returns the effect
expect(await computer.sync(txId)).deep.eq(effect)
```
