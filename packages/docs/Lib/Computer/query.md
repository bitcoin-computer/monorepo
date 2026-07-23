# query

!!!
**Deprecated.** Use [`getOUTXOs`](./getOUTXOs.md) instead. `query` logs a deprecation warning and forwards to `getOUTXOs`.
!!!

_Returns unspent smart-object revisions matching the query (legacy API)._

## Type

```ts
type Query = {
  mod?: string
  publicKey?: string
  limit?: number
  offset?: number
  order?: 'ASC' | 'DESC'
}

async query(q: Query): Promise<string[]>
```

### Parameters

#### `q`

{.compact}
| Key | Description |
| --------- | ------------------------------------------------------------------------------ |
| publicKey | Filter by public key present in the output script |
| mod | Filter smart objects created with this module specifier (membership) |
| limit | Maximum number of revisions returned |
| offset | Number of results to skip |
| order | `ASC` or `DESC` |

There is **no** `ids` parameter on the current implementation.

### Return Value

An array of revision strings for **unspent smart objects** (same as `getOUTXOs` with `verbosity: 0`).

## Description

Historically used as the main “find my objects” API. Prefer:

```ts
const revs = await computer.getOUTXOs({ publicKey, mod, limit, offset, order })
// or with full rows:
const rows = await computer.getOUTXOs({ publicKey, verbosity: 1 })
```

To list **module deploys** (source on chain), use [`getModules`](./getModules.md) / [`getModule`](./getModule.md), not `query` / `getOUTXOs`.

## Example

:::code source="../../../lib/test/lib/computer/query.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/query.test.ts" target=_blank>Source</a>
