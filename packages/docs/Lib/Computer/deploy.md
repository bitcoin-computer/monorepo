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

The `deploy` function stores a JavaScript module on the blockchain and returns a module specifier that identifies that module. This specifier can be passed into [`computer.new`](./new.md), [`computer.encode`](./encode.md), [`computer.encodeNew`](./encodeNew.md), and [`computer.encodeCall`](./encodeCall.md) as an optional parameter. In this case, the names exported from the module are available in the evaluation of these functions.

Module deploys are **not** smart-object transitions. They do not store `{ exp, env, mod, v }` metadata. Use [`computer.load`](./load.md) to retrieve and evaluate a module; [`computer.decode`](./decode.md) rejects module deploy transactions.

The rationale for deploying modules is to minimize on-chain data (and thereby the technical on-chain storage costs / hygiene dust): a module can be deployed once (preferably via taproot) and then referenced to create or update many smart objects using tiny expressions. This keeps using transactions small. This is unlike on-chain objects whose associated data is tied to a single use/revision. See the [Fees](../../fees.md) "User Choices..." section for full minimization guidance.

### On-chain encoding

The protocol supports two module storage types:

- **`multisig`** — One transaction. An owner output is created (so the UTXO appears in the node’s `Output` table), and the module source is stored in cleartext data outputs as:

  ```ts
  { ept: string }  // module source only; no encryption
  ```

  These data outputs use bare multisig scripts. The maximum module size is about 18 kB; larger modules must be split into chunks of less than 18 kB and recombined in another module. *Module encoding transactions using `multisig` generate hygiene dust outputs* (see Fees for scope and costs).

- **`taproot`** — Two transactions (commit + reveal). The commit tx locks a taproot output whose leaf commits to the data; the reveal tx spends that output and embeds the full module source in the **input witness**, inside a script-path envelope tagged with protocol id **`BC`** (Bitcoin Computer module protocol; not ordinals `ord`). Content type is `text/javascript`. These modules can be close to 400 kB or even close to 4 MB (if you know a miner that will include them). Module storage is 4× cheaper due to the SegWit discount. *Crucially, taproot module encoding transactions generate no hygiene dust outputs.*

Encryption of module payloads is not supported yet (may be added later). Only new-format deploys (`{ ept }` / `BC`) are valid; legacy shapes that stored modules as transition `exp` fields or ordinals-style `ord` inscriptions are not read.

To select the module storage type, pass either `multisig` or `taproot` into the property `moduleStorageType` of the `Computer` constructor. If `moduleStorageType` is not specified, it will use `taproot` if available and `multisig` otherwise. For minimization of on-chain data and hygiene dust (and the UX trade-offs of single-tx vs. two-tx), see the [Fees](../../fees.md) documentation, especially "User Choices to Control On-Chain Data and Hygiene Dust Costs" and the bare-multisig rationale (single-tx direct data for high-throughput reliability).

See also [`Transaction.onChainMetaData`](../Transaction/index.md#onchainmetadata) for how metadata differs between transitions and module deploys.

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

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/deploy.test.ts" target=_blank>Source</a>
