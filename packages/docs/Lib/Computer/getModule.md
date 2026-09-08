# getModule

_Returns one module row indexed by the node, including the source text._

## Type

```ts
type ModuleRecord = {
  mod: string
  ept: string
  storageType: 'multisig' | 'taproot'
  blockHash?: string | null
  blockHeight?: number | null
  timestamp?: string | number
}

async getModule(mod: string): Promise<ModuleRecord>
```

### Parameters

#### `mod`

Module specifier of the form `<transaction-id>:<output-number>` (typically `<txId>:0` from [`deploy`](./deploy.md)).

### Return Value

A `ModuleRecord` with the stored source (`ept`), storage type, and optional confirmation fields.

Throws if the specifier is invalid or the node has no row for that module (not found).

## Description

Calls the node’s [`GET /module/:mod`](../../Node/module.md) endpoint. This returns the **indexed source string**; it does not evaluate the module. Use [`load`](./load.md) to obtain exports.

Prefer this when you already know the specifier and need the source or confirmation metadata without listing all modules. Use [`getModules`](./getModules.md) to discover deploys.

## Example

```ts
const mod = await computer.deploy(`export const n = 42`)
// after the node has indexed the deploy:
const row = await computer.getModule(mod)
expect(row.ept).to.equal(`export const n = 42`)
expect(row.storageType).to.be.oneOf(['multisig', 'taproot'])

const { n } = await computer.load(mod)
expect(n).to.equal(42)
```

## See also

- [getModules](./getModules.md)
- [load](./load.md)
- Node [module](../../Node/module.md) API
- Empty index / schema / auth: [Operate & Troubleshoot](../../Node/operations.md)
