# encode

The functions ``encode`` and ``decode`` provide the core functionality of the Bitcoin Computer: recording Javascript expressions on the blockchain and computing their values. The basic interface is syntactic sugar on top of the basic interface. The advanced interface is a more efficient than the basic interface and it provides access to advanced features.

The ``encode`` function evaluates a Javascript expression on a blockchain. It returns a [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/ts_src/transaction.ts) and an object of type Effect (see [return type](encode.md#return-value)).

If the expression to encode contains free variables (for example the variable ``x`` in the expression ``x.f()``) an environment must be passed in to define where the free variables are defined. Specifically, an environment is a JSON object that maps variables to their respective revisions.

If a [module specifier](#modules) is provided, the exports of that module are imported when the expression is evaluated. The module specifier can also be used to [query](#query) for all objects that were created in expressions that imported that module specifier.

Other options can customize the funding and signing process.

### Syntax
```js
const { effect, tx } = await computer.encode(opts)
```

### Type
```ts
(opts: {
  exp: string,
  env?: { [s: string]: string },
  mod?: string
  fund?: boolean
  include?: string[]
  exclude?: string[]
  sign?: boolean
  sighashType?: number
  index?: number
  script?: Buffer
}) => Promise<{
  // the changes caused by evaluating exp
  effect: Effect
  // transaction to commit the changes
  tx: BitcoinLib.Transaction
}> 
```

### Parameters

#### opts
An object with the basic configuration parameters to encode the expression in a transaction.

<div align="center" style="font-size: 14px;">
  <table>
    <tr>
      <th>option</th>
      <th>description</th>
    </tr>
    <tr>
      <td>exp</td>
      <td>Javascript expression</td>
    </tr>
    <tr>
      <td>env</td>
      <td>Environment, maps free variables to revisions</td>
    </tr>
    <tr>
      <td>mod</td>
      <td>An string for the module specifier</td>
    </tr>
    <tr>
      <td>fund</td>
      <td>A boolean value to indicate whether the transaction must be funded (defaults to true) </td>
    </tr>
    <tr>
      <td>include</td>
      <td>An array of strings with specific utxos (transaction id and output number) to include when funding (defaults to [])</td>
    </tr>
    <tr>
      <td>exclude</td>
      <td>An array of string with specific utxos  (transaction id and output number) to skip when funding (defaults to [])</td>
    </tr>
    <tr>
      <td>sign</td>
      <td>A boolean value indicating if the transaction needs to be signed with the computer private key (defaults to true)</td>
    </tr>
    <tr>
      <td>sighashType</td>
      <td>A number that specifies which part of transaction to sign (defaults to 1, sighash_all)</td>
    </tr>
    <tr>
      <td>index</td>
      <td>If sign is required, this is the index of a single input to be signed (defaults to undefined, i.e., sign all inputs)</td>
    </tr>
    <tr>
      <td>script</td>
      <td>If sign is required, a custom input script can be provided</td>
    </tr>
  </table>
</div>

<br>

### Return value

It returns a [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/ts_src/transaction.ts) and an object of type Effect.

The object of type ``Effect`` captures the changes induced by evaluating the expression: It contains the result of the evaluation (property ``res``) and the side effects of the evaluation (property ``env``). The object of type ``Effect`` can be used to determine if the evaluation had the desired effect. If it did, the transaction can be broadcast to commit the update to the blockchain. If the transaction is not broadcast, the state on the blockchain does not change. The transaction can be broadcast at an arbitrarily long delay after calling ``encode``. If during the time between calling ``encode`` and broadcasting the transaction the blockchain undergoes any updates that could affect the evaluation, the miners will reject the transaction. However, if the transaction is accepted by the miners, it is guaranteed to have the effect indicated by object of type ``Effect``.

```js
type EncodeResult = { tx: BitcoinLib.Transaction, effect: Effect }
type Effect = { res: unknown, env: unknown }
```

If fund is required, and the wallet has insufficient funds, an error is thrown.
If sign is required, the default behavior is to sign all inputs. 
The encode function will make a best effort to sign all inputs, but will not throw any error if the signature cannot be added due to hash mismatch. This is useful in the case of partially signed transactions, where a user can encode an expression, sign with the user private key and send the generated partially signed transaction to another user. Then, the receiver can sign other inputs.

<!-- TODO: describe that when signing, some errors are swallowed in order to enable partially signed transactions -->


### Examples
```ts
// The code below works for any smart contract.
class C extends Contract {
  constructor(n) {
    this.n = n
  }
}

// Calling encode will not change the global memory.
const { effect, tx } = await computer.encode({
  exp: `${C} new C(1)`
})

// Effect captures change caused by evaluation.
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
// to the global memory. Will be rejected by
// miners if another update might change the effect
const txId = await computer.broadcast(tx)

// Read the latest state.
const synced = await computer.sync(txId)

// The new state in memory will always equal effect.
expect(synced).deep.eq(effect)

```