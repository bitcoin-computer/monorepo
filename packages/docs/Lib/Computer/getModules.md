# getModules

_Lists module deploys indexed by the connected Bitcoin Computer Node._

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

type ModuleQuery = {
  verbosity?: number
  limit?: number
  offset?: number
  order?: 'ASC' | 'DESC'
  storageType?: 'multisig' | 'taproot'
  isConfirmed?: boolean
}

async getModules(q?: ModuleQuery & { verbosity?: 0 }): Promise<string[]>
async getModules(q: ModuleQuery & { verbosity: 1 }): Promise<ModuleRecord[]>
async getModules(q?: ModuleQuery): Promise<string[] | ModuleRecord[]>
```

### Parameters

#### `query` (optional)

{.compact}
| Key | Description |
| ------------- | --------------------------------------------------------------------------- |
| verbosity | `0` (default): module specifier strings. `1`: full `ModuleRecord` rows including source (`ept`) |
| limit | Maximum number of results |
| offset | Number of results to skip |
| order | Sort by node insert timestamp: `ASC` or `DESC` (default `DESC`) |
| storageType | Filter by on-chain encoding: `multisig` or `taproot` |
| isConfirmed | `true`: only confirmed modules; `false`: mempool only |

### Return Value

- **verbosity 0** — `string[]` of module specifiers (`<txId>:0`)
- **verbosity 1** — `ModuleRecord[]` with source text and confirmation fields

## Description

Calls the node’s [`GET /modules`](../../Node/modules.md) endpoint. The node indexes **module deploys** (multisig cleartext `{ ept }` or taproot `BC` witness) into its `Module` table when they appear in the mempool or a block.

This method does **not** evaluate modules. Use [`load`](./load.md) to import exports in a SES compartment. Use [`getModule`](./getModule.md) for a single known specifier.

After [`deploy`](./deploy.md), allow a short delay (or poll) until the indexer has the row. Confirmation fields are set when the deploy is in a block; they are cleared on reorg.

## Example

```ts
const mod = await computer.deploy(`export const x = 1`)

// Specifiers only
const mods = await computer.getModules({ limit: 50 })
expect(mods.includes(mod)).to.equal(true)

// Full rows, filter by storage type
const rows = await computer.getModules({
  verbosity: 1,
  storageType: 'taproot',
  isConfirmed: true,
  limit: 20,
})
for (const row of rows) {
  console.log(row.mod, row.ept.slice(0, 40))
}
```

## See also

- [getModule](./getModule.md) — one module by specifier
- [deploy](./deploy.md) / [load](./load.md)
- Node [modules](../../Node/modules.md) API
- Empty index / schema / auth: [Operate & Troubleshoot](../../Node/operations.md)
