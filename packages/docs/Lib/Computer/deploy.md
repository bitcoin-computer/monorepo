# deploy

_Stores a Javascript module on the blockchain._

## Type

```ts
;(module: string) => Promise<string>
```

### Parameters

#### `module`

A string encoding a JavaScript module.

### Return value

A string of the form `<transaction-id>:<output number>` encoding the location where the module is stored.

## Description

The `deploy` function stores a JavaScript module on the blockchain and returns a module specifier that identifier that module. This specifier can be passed into [`computer.new`](./new.md), [`computer.encode`](./encode.md), [`computer.encodeNew`](./encodeNew.md), and [`computer.encodeCall`](./encodeCall.md) as an optional parameter. In this case, the names exported from the module are available in the evaluation of these functions.

The rational of deploying modules is that it can save transaction fees: A module can be deployed once and then used to create or update many smart objects. This is unlike on-chain objects whose value can only be used once.

The protocol supports two module storage types

- `multisig` - A module is stored in one transaction with several outputs that contain a bare multisig script each. These outputs are currently un-spendable, in a future update we will make them spendable. The maximum module size is about 18 kB, larger modules must be split into chunks of less than 18 kB and recombined in another module.
- `taproot` - A module is stored two transactions, one commits to the hash of the data ona taproot output script and the second one spends that output and contains the entire module in its input. These modules can be close 400 kB or even close to 4 MB if you know a miner that will include them. In addition module storage is 4x cheaper due to the Segwit discount.

To select the module storage type pass either `multisig` or `taproot` into the property `moduleStorageType` of the `Computer` constructor. If `moduleStorageType` is not specified it will use `taproot` if available and `multisig` otherwise.

{.compact}
| Coin | Taproot | Module Storage Types | Default | Max Module Size | Segwit Discount
| ---- | ------- | --------------------- | ---------- | -------------
| BTC | Yes | `taproot` `multisig` | `taproot` | 4 MB | Yes
| LTC | Yes | `taproot` `multisig` | `taproot` | 4 MB | Yes
| PEPE | No | `multisig` | `multisig` | 18 kB | No
| BCH* | No | `multisig` | `multisig` | 18 kB | No
| DOGE* | No | `multisig` | `multisig` | 18 kB | No

\* Bitcoin Computer support coming soon

## Examples

The first example shows that modules can depend on one another.

```ts
const revA = await computer.deploy(`export class A extends Contract {}`)

const revB = await computer.deploy(`
  import { A } from '${revA}'
  export class B extends A {}
`)

const transition = { exp: `new B()`, mod: revB }
const tx = await computer.encode(transition)
```

The next example shows how to deploy a module with module storage type `multisig`.

```js
const computer = new Computer({ moduleStorageType: 'multisig' })
await computer.faucet(1730000)
const big = `x`.repeat(18262) // ~ 18KB

const rev = await computer.deploy(big)
expect(rev).to.not.equal(undefined)
```

On BTC and LTC it is possible to deploy larger modules for lower fees by using `taproot`.

```js
const computer = new Computer({ moduleStorageType: 'taproot' })
await computer.faucet(436000)
const veryBig = `x`.repeat(396000) // ~ 400KB

const rev = await computer.deploy(veryBig)
expect(rev).to.not.equal(undefined)
```
