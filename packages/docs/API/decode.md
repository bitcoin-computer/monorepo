# decode

The `decode` function parses a Bitcoin transaction to determine if it is a Bitcoin Computer transaction. If so it returns an expression `exp`, a blockchain environment `env`, and a module specifier `mod`. The function `decode` is the inverse of `encode` when the latter is called with `exp`, `env`, and `mod`.


### Type
```ts
(tx: BitcoinLib.Transaction) => Promise<{
  exp: string,
  env?: { [s: string]: string },
  mod?: string
}>
```

### Syntax
```js
await computer.decode(tx)
```

### Parameters

#### tx

A [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/ts_src/transaction.ts) object.


### Return value

It returns a [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/ts_src/transaction.ts) and an object of type Effect.

The object of type `Effect` captures the changes induced by evaluating the expression: It contains the result of the evaluation (property `res`) and the side effects of the evaluation (property `env`). The object of type `Effect` can be used to determine if the evaluation had the desired effect. If it did, the transaction can be broadcast to commit the update to the blockchain. If the transaction is not broadcast, the state on the blockchain does not change. The transaction can be broadcast at an arbitrarily long delay after calling `encode`. If during the time between calling `encode` and broadcasting the transaction the blockchain undergoes any updates that could affect the evaluation, the miners will reject the transaction. However, if the transaction is accepted by the miners, it is guaranteed to have the effect indicated by object of type `Effect`.

```js
type EncodeResult = { tx: BitcoinLib.Transaction, effect: Effect }
type Effect = { res: unknown, env: unknown }
```

If fund is required, and the wallet has insufficient funds, an error is thrown.
If sign is required, the default behavior is to sign all inputs. 
The encode function will make a best effort to sign all inputs, but will not throw any error if the signature cannot be added due to hash mismatch. This is useful in the case of partially signed transactions, where a user can encode an expression, sign with the user private key and send the generated partially signed transaction to another user. Then, the receiver can sign the remaining inputs.

<!-- TODO: describe that when signing, some errors are swallowed in order to enable partially signed transactions -->


### Examples
```ts
class C extends Contract {}
const computer = new Computer()
const transition = {
  exp: `${C} new ${C.name}()`,
  env: {},
  mod: ''
}
const { tx } = await computer.encode(transition)
const decoded = await computer.decode(tx)

expect(decoded).to.deep.equal(transition)
```