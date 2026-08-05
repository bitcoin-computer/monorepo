# load

_Loads a module from the blockchain._

### Type

```ts
;(rev: string) => Promise<ModuleExportsNamespace>
```

### Parameters

#### `rev`

A module specifier encoded as a string of the form `<transaction-id>:<output-number>`.

### Return Value

A JavaScript module.

### Inside smart contracts (`InnerComputer`)

Module locations are revs of the form `txId:outputIndex`. Inside a contract, the module’s deploy transaction must be **confirmed**; an unconfirmed deploy invalidates the evaluation. Off-chain `computer.load` may still resolve mempool deploys for development. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

:::code source="../../../lib/test/lib/computer/load.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/load.test.ts" target=_blank>Source</a>
