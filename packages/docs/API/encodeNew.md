# encodeNew

Encodes a smart object creation.

### Syntax
```js
const { tx, effect } = await computer.encodeNew(params)
```

### Type
```ts
<T extends new (...args: any) => any>({
  constructor: T,
  args?: ConstructorParameters<T>,
  mod?: string
}) => Promise<{
  tx: BitcoinLib.Transaction
  effect: Effect
}> 
```

### Parameters

#### constructor
A named Javascript class that extends from `Contract`

#### args
Arguments to the constructor of `T`

#### mod
A module specifier, i.e., the revision string of an already deployed module (see [deploy](/api.md#deploy)).


### Return value
It returns a [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/ts_src/transaction.ts) and an object of type Effect (see [encode return type](/api/encode/#return-value)).

### Examples
```ts
class C extends Contract { }
const computer = new Computer()
const { tx } = await computer.encodeNew({
  constructor: C
})
const decoded = await computer.decode(tx)

expect(decoded).to.deep.eq({
  exp: `${C} new C()`,
  env: {},
  mod: ''
})
```