# encode

_Creates a transaction according to the Bitcoin Computer protocol._

## Type

```ts
;(opts: {
  exp: string // an expression
  env?: Record<string, string> // a blockchain environment
  mod?: string // a module specifier

  // Funding options
  fund?: boolean // whether to fund the transaction
  include?: string[] // include specific UTXOs when funding
  exclude?: string[] // exclude specific UTXOs when funding

  // Signing options
  sign?: boolean // whether to sign the transaction
  sighashType?: number // signature hash type to use
  inputIndex?: number // input index to be signed
  inputScript?: Buffer // use input script (instead of signing)

  // Mock options
  mocks?: Record<string, any> // values to mock
}) =>
  Promise<{
    // the transaction with the expression inscribed
    tx: NakamotoJS.Transaction

    // the result of the evaluation
    effect: { res: unknown; env: { [s: string]: unknown } }
  }>
```

### Parameters

#### `opts`

An object with a specification to build a transaction according to the Bitcoin Computer protocol.

{.compact}

| Key         | Description                                                                                                                                                               | Default       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| exp         | A JavaScript expression.                                                                                                                                                  | -             |
| env         | A Blockchain environment mapping variables names to revisions.                                                                                                            | `{}`          |
| mod         | A string of the form `<id>:<num>` specifying the location of a module.                                                                                                    | `undefined`   |
| fund        | Whether the transaction should be funded.                                                                                                                                 | `true`        |
| include     | UTXOs to include when funding.                                                                                                                                            | `[]`          |
| exclude     | UTXOs to exclude when funding.                                                                                                                                            | `[]`          |
| sign        | Whether to sign the transaction.                                                                                                                                          | `true`        |
| sighashType | The signature hash type.                                                                                                                                                  | `SIGHASH_ALL` |
| inputIndex  | If set to an number only the corresponding input is signed. If undefined all inputs are signed.                                                                           | `undefined`   |
| inputScript | If set to a string a custom input script can be provided. If undefined a signature script is generated.                                                                   | `undefined`   |
| mocks       | A pair <name, object>. The object is an instance of a mocked class (A class that does not extends from Contract but has the keywords `_id`, `_root`, `_amount`,`_owners`) | `{}`          |

### Return value

It returns an object `{ tx, effect }` where `tx` is a [NakamotJS](../../NakamotoJs/) transaction and `effect` is an object with keys `res` and `env`. The `res` object contains the result of the evaluation. The `env` object has the same keys as the blockchain environment. However, whereas the values of the blockchain environment are revision strings, the values of `env` and the smart object at these revisions _after_ evaluating the expression.

## Description

The `encode` function builds a Bitcoin transaction from a JavaScript expression. It returns a transaction and an object `effect` containing the result of the evaluation in a property `res`. If the expression contains undefined variables a blockchain environment `env` must be passed into `encode`. A _blockchain environment_ maps the named of the undefined variable to UTXOs containing on-chain objects. A [module specifier](#modules) can be provided in order to make the exports of that module are available to the evaluation. Other options can customize the funding and signing process. It is also to pass in an object specifying [mocked](../../tutorial.md#mocking) objects.

It is important to note that `encode` does not broadcast the transaction. Nonetheless the `effect` object reflects the on-chain state that will emerge once the transaction is broadcast.

!!!success
The state update effected by a Bitcoin Computer transaction is completely predictable:

- If the transaction is included in a block the new state will be exactly the state returned from the `effect` function.
- If the transaction is not included the state is not updated.
  !!!

## Examples

The first example shows how to store a basic type

```js
import { Computer, Contract } from '@bitcoin-computer/lib'

// Encode the expression '1'
const { effect, tx } = await computer.encode({ exp: '1' })

// The effect object captures the on-chain state if the transaction is broadcast
expect(effect).deep.eq({ res: 1, env: {} })

// Broadcast the transaction
const txId = await computer.broadcast(tx)

// Synchronizing to the transaction id always returns the effect
expect(await computer.sync(txId)).deep.eq(effect)
```

The second example shows how to encode a constructor and a function call.

```js
import { Computer, Contract } from '@bitcoin-computer/lib'

// A smart contract
class Counter extends Contract {
  n: number

  constructor() {
    super({ n: 0 })
  }
  inc() {
    this.n += 1
  }
}

// Encode a constructor cal
const { effect: e1, tx: tx1 } = await computer.encode({
  exp: `${Counter} new Counter()`,
})

// Broadcast the transaction
const txId1 = await computer.broadcast(tx1)

// As above, synchronizing to a transaction id always returns the effect
expect(await computer.sync(txId1)).deep.eq(e1)

// Encode a function call
const { effect: e2, tx: tx2 } = await computer.encode({
  // The expression
  exp: `c.inc()`,

  // The blockchain environment specifies that the value for c is stores
  // the the location e1.res._rev on the blockchain
  env: { c: e1.res._rev },
})

// As before we can broadcast the transaction to update the on-chain state
const txId2 = await computer.broadcast(tx2)

// The sync function reads the on-chain state
expect(await computer.sync(txId2)).deep.eq(e2)
```
