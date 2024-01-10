# new

Creates a new smart object. The parameters are a smart contract (a Javascript class inheriting from ``Contract``), a list of arguments for the constructor of the class and an optional module specifier. The arguments of the constructor can be of basic data type or smart objects. The ``new`` function builds a transaction that records the creation of a new smart object, signs it and broadcasts it. Smart objects can be updated by calling their functions, see [here](/tutorial.md#update-a-smart-object).

### Type
```ts
<T extends new (...args: any) => any>(
  constructor: T,
  args?: ConstructorParameters<T>,
  mod?: string
) => Promise<InstanceType<T> & MetaData>;
```

Here a ``MetaData`` is the type

```ts
type MetaData = { 
  _id: string, 
  _rev: string, 
  _root: string, 
  _amount: number, 
  _owners: string[], 
  _readers?: string[], 
  _url?: string 
}
```

### Syntax
```js
await computer.new(A)
await computer.new(A, [10])
await computer.new(A, ['a'], '9128ab1232...18ba:0')
```

### Parameters

#### constructor
A named Javascript class that extends from `Contract`.

#### args
Arguments to the constructor of the class.

#### mod
A module specifier, i.e., the revision string of a deployed module (see [deploy](/api.md#deploy)).


### Return value
Returns an instance of the class `T`. The class `T` should extend from `Contract`. The returned object has extra properties `_id`, `_rev`, `_root`, `_owners`, `_amount` and possibly `_url`, `_readers`.

### Examples
```ts
import { Contract, Computer } from '@bitcoin-computer/lib'

// A smart contract
class A extends Contract {
  constructor(n) {
    this.n = n
  }
}

// Create a smart object
const computer = new Computer({ mnemonic: ... })
const a = await computer.new(A, [1])
expect(a).to.deep.equal({
  n: 1,
  _id: '667c...2357:0',
  _rev: '667c...2357:0',
  _root: '667c...2357:0',
  _owners: [computer.getPublicKey()],
  _amount: 5820
})
```