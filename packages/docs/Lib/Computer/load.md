# load

_Loads a module from the blockchain and returns its exports._

### Type

```ts
;(rev: string) => Promise<ModuleExportsNamespace>
```

### Parameters

#### `rev`

A module specifier encoded as a string of the form `<transaction-id>:<output-number>` (typically `<txId>:0` as returned by [`computer.deploy`](./deploy.md)).

### Return Value

A JavaScript module namespace (the exports of the deployed ES module).

## Description

`load` fetches the module source for the given specifier and evaluates it in a SES compartment (with `Contract` and a restricted inner computer available as globals).

How the source is recovered depends on `moduleStorageType` (see [`deploy`](./deploy.md)):

- **`multisig`** — Reads cleartext `{ ept }` from the deploy transaction’s data outputs (`Transaction.onChainMetaData.ept`).
- **`taproot`** — Reads the module body from the reveal transaction’s input witness (`BC` protocol envelope, content type `text/javascript`).

Do not use [`computer.decode`](./decode.md) on a module specifier or deploy transaction; `decode` only handles transition metadata (`exp` / `env` / `mod`).

Module sources are cached client-side after the first successful fetch for a given deploy `txId`.

A Bitcoin Computer Node also indexes deploys in its `Module` table. To discover or inspect sources without evaluating them, see the node [modules](../../Node/modules.md) and [module](../../Node/module.md) endpoints.

## Example

:::code source="../../../lib/test/lib/computer/load.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/load.test.ts" target=_blank>Source</a>
