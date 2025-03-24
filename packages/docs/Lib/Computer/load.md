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

## Example

:::code source="../../../lib/test/lib/computer/load.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/load.test.ts" target=_blank>Sources</a>
