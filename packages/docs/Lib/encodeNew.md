# encodeNew

Encodes a constructor call. This function is syntactic sugar for [encode](./encode.md).

### Type
```ts
<T extends new (...args: any) => any>(params: {
  constructor: T,
  args?: ConstructorParameters<T>,
  mod?: string
}) => Promise<{
  tx: BitcoinLib.Transaction,
  effect: { res: Json; env: Json }
}>
```

### Syntax
```js
await computer.encodeNew({ constructor })
await computer.encodeNew({ constructor, args })
await computer.encodeNew({ constructor, args, mod })
```

### Parameters

#### params
An object with the configuration parameters to encode the expression in a transaction.

{.compact}
| Key         | Type                                | Description                                     |
|-------------|-------------------------------------|-------------------------------------------------|
| constructor | T extends new (...args: any) => any | A Javascript class that extends from `Contract` |
| args        | ConstructorParameters\<T\>          | Arguments to the constructor of the class       |
| mod         | string                              | A module specifier                              |



Module specifiers are encoded as strings of the form \<transaction id\>:\<output number\>

### Return value

It returns an object `{ tx, effect }` where `tx` is a Bitcoin transaction and `effect` is an object with keys `res` and `env`. For more details see the description of the return type of [encode](./encode.md).

### Examples
```ts
// A smart contract
class C extends Contract {}

// Encode a constructor call
const computer = new Computer()
const { tx } = await computer.encodeNew({
  constructor: C
})

// Decode meta data
const decoded = await computer.decode(tx)
expect(decoded).to.deep.eq({
  exp: `${C} new C()`,
  env: {},
  mod: ''
})

// Broadcast the tx to create the smart object
const txId = await computer.broadcast(tx)
```