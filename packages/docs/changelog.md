---
order: -38
icon: history
---

# Breaking changes & protocol notes

Short log of protocol and API changes that affect upgrades. Prefer matching **lib** and **node** versions ([Operate & Troubleshoot](./Node/operations.md#version-compatibility)).

## 0.27 — First-class module deploys

### Wire format

Module deploys are **not** smart-object transitions.

| Storage | On-chain shape |
| ------- | -------------- |
| **multisig** | Cleartext metadata `{ ept: string }` in bare-multisig data outputs (no `exp` / `env` / `mod` / `v`, no encryption on modules yet) |
| **taproot** | Reveal-input witness envelope with protocol id **`BC`** (not ordinals `ord`), content type `text/javascript` |

Legacy shapes that stored modules as transition `exp` fields or ordinals-style `ord` inscriptions are **not** read.

### Client API

- [`deploy`](./Lib/Computer/deploy.md) / [`load`](./Lib/Computer/load.md) — write and evaluate modules  
- [`decode`](./Lib/Computer/decode.md) — **throws** `ModuleDecodeError` on module deploys; use `load`  
- [`getModules`](./Lib/Computer/getModules.md) / [`getModule`](./Lib/Computer/getModule.md) — list/fetch indexed source without evaluating  
- Static [`getInscription`](./Lib/Computer/getInscription.md) — parse a `BC` witness from raw hex  

### Node

- `Module` table + [`GET /modules`](./Node/modules.md) and [`GET /module/:mod`](./Node/module.md)  
- Existing databases must apply the `Module` DDL if they predate this feature — see [schema upgrade](./Node/operations.md#module-table-schema-upgrade)  
- ZMQ/sync index module deploys; reorg clears module confirmation fields; mempool cleanup can delete unconfirmed module rows  

### Docs / migration tips

1. Upgrade node, apply `Module` table if needed, restart.  
2. Upgrade `@bitcoin-computer/lib` to the same version.  
3. Replace any code that treated module txs as transitions (`decode` / fake `exp`).  
4. After `deploy`, call [`waitForIndexed`](./Lib/Computer/waitForIndexed.md) before relying on `getModules` / object queries.  
5. Prefer [`getOUTXOs`](./Lib/Computer/getOUTXOs.md) over deprecated [`query`](./Lib/Computer/query.md) for listing smart objects.

## Deprecated client APIs (still present)

| Deprecated | Prefer |
| ---------- | ------ |
| `computer.query` | `computer.getOUTXOs` |
| `export` / `import` | `deploy` / `load` |
| Wallet `getUtxos` (lowercase) | `getUTXOs({ address, isObject: false })` |

See the [Computer index](./Lib/Computer/index.md#deprecated) for the full list.
