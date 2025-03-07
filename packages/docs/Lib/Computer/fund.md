# fund

_Funds a Bitcoin transaction._

## Type

```ts
(
  tx: NakamotoJS.Transaction,
  opts?: {
    include?: string[]
    exclude?: string[]
  }
): Promise<void>
```

### Parameters

#### `tx`

A [NakamotoJS transaction](../../NakamotoJs/) object or a [Bitcoin Computer Transaction](../Transaction/) object (that the object from Bitcoin Computer extends the object from NakamotoJS).

#### `opts`

An optional object can be passed as parameter to `include` or `exclude` certain UTXOs. When using `include`, the transaction will be funded with the UTXOs specified as the first inputs.

{.compact}

| Key     | Description      | Default Value |
| ------- | ---------------- | ------------- |
| include | UTXOs to include | `[]`          |
| exclude | UTXOs to exclude | `[]`          |

UTXOs are encoded as `<transaction-id>:<output-number>`.

### Return Value

If the wallet does not have sufficient funds, an error is thrown.

## Examples

The first example shows how to use `fund` with a NakamotoJS transaction.

```ts
import { address, networks, Transaction } from '@bitcoin-computer/nakamotojs'
const { regtest } = networks

const tx = new Transaction()
const outputScript = address.toOutputScript('mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt', regtest)
tx.addOutput(outputScript, 1e7)
await computer.fund(tx)
await computer.sign(tx)
await computer.broadcast(tx)
```

The next example shows how to use `fund` with a Bitcoin Computer transaction.

```ts
// A smart contract
class C extends Contract {}

// Encode a constructor call without funding the transaction
const { tx } = await computer.encode({
  exp: `${C} new ${C.name}()`,
  fund: false,
})

// Another user can fund and sign
const computer2 = new Computer()
await computer2.faucet(1e8)
await computer2.fund(tx)
await computer2.sign(tx)
await computer2.broadcast(tx)
```
