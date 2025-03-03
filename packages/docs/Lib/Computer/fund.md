# fund

Funds a Bitcoin transaction.

### Type

```ts
(
  tx: BitcoinLib.Transaction,
  opts?: {
    include?: string[]
    exclude?: string[]
  }
): Promise<void>
```

### Syntax

```js
await computer.fund(tx)
```

### Parameters

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| tx | A [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/ts_src/transaction.ts) object.|

#### opts

An optional object can be passed as parameter to `include` or `exclude` certain UTXOs. When using `include`, the transaction will be funded with the UTXOs specified as the first inputs.

{.compact}
| Key | Type | Description | Default Value |
|---------|----------|------------------|---------------|
| include | string[] | UTXOs to include | [] |
| exclude | string[] | UTXOs to exclude | [] |

### Return value

If the wallet does not have sufficient funds, an error is thrown.

### Examples

```ts
// A smart contract
class C extends Contract {}

// Encode a constructor call without funding the transaction
const computer1 = new Computer({ mnemonic: ... })
const { tx } = await computer1.encode({
  exp: `${C} new ${C.name}()`
  fund: false
})

// Fund the transactions (can be another computer)
const computer2 = new Computer({ mnemonic: ... })
await computer1.fund(tx)

// Broadcast the tx
const txId = await computer2.broadcast(tx)
```
