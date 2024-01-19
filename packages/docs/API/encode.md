# encode

The `encode` function builds a Bitcoin transaction from a Javascript expression according to the [Bitcoin Computer protocol](../how-it-works.md). In addition to the transaction, this function also returns the value of the expression.

If the expression contains free variables (for example the variable `x` in the expression `x.f()`) a "blockchain environment" must be passed. A blockchain environment is a JSON object that maps variable names to the latest revisions of smart objects.

A [module specifier](#modules) can be provided in order to make the exports of that module are available to the evaluation.

Other options can customize the funding and signing process.

!!!success
The state update effected by a Bitcoin Computer transaction is completely predictable:
* If the transaction is included in a block the new state will be exactly the state returned from the `effect` function.
* If the transaction is not included the state is not updated.
!!!

### Type
```ts
(opts: {
  exp: string, // an expression
  env?: Record<string, string>, // a blockchain environment
  mod?: string // a module specifier

  // Funding options
  fund?: boolean // whether to fund the transaction
  include?: string[] // include specific UTXOs when funding
  exclude?: string[] // exclude specific UTXOs when funding
  
  // Signing options
  sign?: boolean // whether to sign the transaction
  sighashType?: number // Sighash type to use
  index?: number // input index to be signed
  inputScript?: Buffer // use input script (instead of signing)
}) => Promise<{
  // the transaction with the expression inscribed
  tx: BitcoinLib.Transaction,
  // the result of the evaluation
  effect: { res: Json; env: Json }
}> 
```

### Syntax
```js
await computer.encode({ exp })
await computer.encode({ exp, env })
await computer.encode({ exp, env, mod })
await computer.encode({ exp, fund, sign })
...
```

### Parameters

#### opts
An object with the basic configuration parameters to encode the expression in a transaction.



{.compact}
| Key         | Type                   | Description                                                                                            | Default Value |
|-------------|------------------------|--------------------------------------------------------------------------------------------------------|---------------|
| exp         | string                 | A Javascript expression                                                                                |               |
| env         | Record<string, string> | A Blockchain environment, maps free variables to latest revisions                                      | \{\}          |
| mod         | string                 | A module specifier                                                                                     | undefined     |
| fund        | boolean                | Whether the transaction should be funded                                                               | true          |
| include     | string[]               | UTXOs to include when funding                                                                          | []            |
| exclude     | string[]               | UTXOs to exclude when funding                                                                          | []            |
| sign        | boolean                | Whether to sign the transaction                                                                        | true          |
| sighashType | number                 | The sighash type                                                                                       | 1=SIGHASH_ALL |
| index       | number                 | If set to an number the corresponding input is signed. If undefined all inputs are signed.             | undefined     |
| inputScript | string                 | If set to a string a custom input script can be provided. If undefined a signature script is generated | undefined     |

Module specifiers and UTXOs are encoded as strings of the form \<transaction id\>:\<output number\>

### Return value

It returns an object `{ tx, effect }` where `tx` is a Bitcoin transaction and `effect` is an object with keys `res` and `env`.

```ts
{ tx: BitcoinLib.Transaction, effect: { res: Json; env: Json } }
```

The transaction `tx` is an object from the [NakamotoJS](https://github.com/bitcoin-computer/monorepo/tree/main/packages/nakamotojs#nakamotojs-nakamotojs) library - a [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib?tab=readme-ov-file#bitcoinjs-bitcoinjs-lib) clone that supports LTC and BTC and has some extra features that make is easier to build advanced applications like exchanges.

The `res` object contains the result of the evaluation.

The `env` object has the same keys as the blockchain environment. However, whereas the values of the blockchain environment are revision strings, the values of `env` and the smart object at these revisions *after* evaluating the expression.


<!-- TODO: describe that when signing, some errors are swallowed in order to enable partially signed transactions -->


### Examples
```ts
import { Computer, Contract } from '@bitcoin-computer/lib'

// A smart contract
class C extends Contract {
  constructor(n) {
    this.n = n
  }
}

// Calling encode will not broadcast a transaction
// or change state of smart objects
const { effect, tx } = await computer.encode({
  exp: `${C} new C(1)`
})

// Effect captures state of smart objects
// if the transaction is broadcast
expect(effect).deep.eq({
  res: { 
    n:1
    _id: '667c...2357:0',
    _rev: '667c...2357:0',
    _root: '667c...2357:0',
    _owners: ['03...'],
    _amount: 5820
  },
  env: {}
})

// The tx can be broadcast to commit the change
const txId = await computer.broadcast(tx)

// Read the latest state
const synced = await computer.sync(txId)

// The new state in memory will always equal effect
expect(synced).deep.eq(effect)

```