# deploy

_Stores a Javascript module on the blockchain._

## Type

```ts
;(module: string) => Promise<string>
```

### Parameters

#### `module`

A string encoding a JavaScript module.

### Return Value

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

:::code source="../../../lib/test/lib/computer/deploy.test.ts" :::

The last example shows how a string of arbitrary length can be stored using the module system. The idea is to partition a long string into constant size chunks, deploy each chunk in a separate module, and then deploy one additional module that recombined the modules for the chunks and exports their concatenation. In the example the "recombining" module is as follows:

```ts
import { c0 } from 'f86ec90ce2ab7367e197df1e63b45114a381d5636dc85e35dc28d721fbf0c228:0' // stores '000'
import { c1 } from 'ae90c7aa091045239d61011c770754b8cd8409541e56177d2a15e591e337bd67:0' // stores '000'
import { c2 } from '5530cfcc89fde62c2cfab4eea56e3aa2d41071480b7b094d7a01316776712701:0' // stores '000'
import { c3 } from 'dc63fbf200595012b239d69936ac63e4155040042ef7d2e6dff4ca49dec3f51e:0' // stores '0'
export const s = c0 + c1 + c2 + c3
```
