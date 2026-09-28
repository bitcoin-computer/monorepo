---
order: -44
icon: tools
---

# Operate & Troubleshoot

Operational guide for running a Bitcoin Computer Node and diagnosing empty results, auth failures, schema upgrades, and version mismatches. For install and `.env` reference see the [Node overview](./index.md).

## Authentication

Almost all HTTP routes go through **stateless public-key authentication**.

### How it works

1. The client signs a message: `SHA256(BCN_URL + timestamp)` with the wallet private key.
2. It sends an `Authentication` header:

   ```http
   Authentication: Bearer <base64(signature:publicKey:timestamp)>
   ```

3. The node checks:
   - Header is present
   - Timestamp is recent (within a few minutes; see `SIGNATURE_FRESHNESS_MINUTES`)
   - Signature matches `publicKey` for that origin + timestamp
   - Timestamp is strictly newer than the last successful auth for that public key (replay protection)

`@bitcoin-computer/lib` builds this header automatically for every request when the `Computer` wallet has a private key (normal constructor usage).

### Curl and external clients

Plain `curl` without a signed header gets **401**:

```json
{ "error": "Auth failed with error 'no Authentication key provided' ..." }
```

Options:

- Prefer the **lib** client (`new Computer({ url, chain, network, ... })`) for app code.
- For manual calls, sign with the same scheme as `createBCNAuthHeader` in the library (base URL must equal the node’s configured `BCN_URL`).

### Common auth errors

| Symptom | Likely cause | What to do |
| ------- | ------------ | ---------- |
| 401 no Authentication key | Missing header | Use lib, or add a valid Bearer token |
| 401 Signature is too old | Clock skew or reused token | Sync clocks; mint a new timestamp each request |
| 401 Please use a fresh authentication token | Replayed or out-of-order timestamp | Do not reuse headers; ensure monotonic client timestamps |
| 401 origin / public key mismatch | `BCN_URL` on node ≠ URL the client signs | Align `.env` `BCN_URL` with the URL clients use (e.g. `http://127.0.0.1:1031`) |

Health checks may skip auth depending on deployment; normal API routes do not.

---

## Empty or incomplete results

The chain stores transactions; the **node indexes** outputs, inputs, and modules into Postgres. Queries hit the index, not a full re-scan of the chain each time.

### Checklist

1. **Chain / network / URL**  
   Client `chain`, `network`, and `url` must match the node (`BCN_CHAIN`, `BCN_NETWORK`, `BCN_URL` / port).

2. **Sync status**  
   On mainnet/testnet the node may take a long time to catch up. Empty `get-txos` / `modules` while height is still catching up is expected. Watch logs until workers finish backfill; use regtest for local development.

3. **Indexer lag after write**  
   After `broadcast` / `new` / `deploy`, wait until the tx is indexed:

   ```ts
   await computer.waitForIndexed(txIdOrRev)
   // then:
   await computer.getOUTXOs({ publicKey })
   await computer.getModules({ limit: 50 })
   ```

   Or poll [`isIndexed`](../Lib/Computer/isIndexed.md). Prefer this over fixed `sleep`.

4. **Wrong query shape**  
   - Objects: [`getOUTXOs`](../Lib/Computer/getOUTXOs.md) / [get-txos](./get-txos.md) with `isObject` / `isSpent` filters.  
   - Module **source**: [modules](./modules.md) / [`getModules`](../Lib/Computer/getModules.md).  
   - `mod` on object queries filters **membership**, not deploy source.

5. **Mempool cleanup**  
   Unconfirmed rows can be removed after the stale grace period ([clean-mempool](./clean-mempool.md)). Apps can listen with [`streamMempoolCleanup`](../Lib/Computer/streamMempoolCleanup.md).

6. **Reorg**  
   Confirmation fields (`blockHash` / `blockHeight`) on outputs and modules are cleared for orphaned blocks. Re-query; do not assume a previous confirmation is final until deeper.

### “I see the tx on the chain but not in the API”

| Check | Action |
| ----- | ------ |
| Tx in bitcoind, not in DB | Sync/ZMQ path; inspect node logs for parse/insert errors |
| Tx in `Output` but not in `Module` | Deploy format (must be `{ ept }` or taproot `BC`); node version with Module table |
| `GET /module/:mod` 404 | Specifier wrong, not indexed yet, or hard-deleted unconfirmed row |
| Client `getModules` empty | Same as above + auth + filters (`storageType`, `isConfirmed`) |

---

## `BCN_QUERY_LIMIT` and apps

`BCN_QUERY_LIMIT` is the maximum number of rows a list query may return. It is set in the node `.env`:

```bash
BCN_QUERY_LIMIT='10000'
```

Unset, `get-txos` returns every match. That is acceptable on a private dev node. It is the wrong setting for an app other people will run.

Bitcoin Computer apps are written against a node the operator runs. The node is not a shared hosted API with one global page size. Anyone who wants to run the same app runs their own node and points the app at it. For in-contract `getTXOs` to agree on every such node, the query must not depend on a hidden, per-node prefix of the result.

### What the contract sees

Inside a contract, `computer.getTXOs` makes **one** request. The library does not page.

- **No `limit`.** The call asks for every output that matches, in `rev` order. If that set is larger than `BCN_QUERY_LIMIT`, the node refuses the query and the transition is **invalidated**. It does not succeed with the first N rows. A successful call is the complete match set. Raising the cap later does not change that result. A cap that is too low rejects the transition instead of returning a different, shorter list.
- **Explicit `limit` (and `offset`).** This is a window the contract chose. It is deterministic. The requested `limit` must be less than or equal to `BCN_QUERY_LIMIT`, or the node rejects it and the transition is invalidated. A full window of that size is a successful observation; the contract asked for at most that many rows.

The outer `Computer.getTXOs` used by wallets and off-chain code is different. It may still return a list cut at `BCN_QUERY_LIMIT`. Do not copy that behavior into a contract and expect every replica to see the same prefix unless every node is configured identically **and** the contract treats the cap as part of the answer. The in-contract path refuses that.

### What to publish with an app

Publish the node parameters the app was tested with (`BCN_CHAIN`, `BCN_NETWORK`, and `BCN_QUERY_LIMIT` at minimum). Operators who want to run that app set the same chain and network, and set `BCN_QUERY_LIMIT` **at least as high** as the largest in-contract `getTXOs` the app must observe — including any explicit `limit` the contract passes.

A higher cap is safe: successful queries still return the same rows. A lower cap is not: those queries invalidate. Leaving the variable unset is also not the same as another operator's `10000`; one node returns every row, the other rejects once the match count passes 10000.

Size the cap from the app, not from a default page size. If an election contract loads every vote for a proposal with `getTXOs({ mod, lteBlockHeight })` and the design allows 50000 votes, the app's nodes need `BCN_QUERY_LIMIT` of at least 50000. If the contract only ever reads `limit: 20`, the cap must be at least 20, and the contract must not assume those 20 rows are the entire set.

Restart the node after changing `.env`. The value is process configuration, not chain state.

## Module table (schema upgrade)

New nodes create the `Module` table from [db_schema.sql](https://github.com/bitcoin-computer/monorepo/blob/main/packages/node/db/db_schema.sql).

Existing Postgres volumes created **before** module indexing need the table applied manually (schema is `CREATE TABLE IF NOT EXISTS`, but older DBs never ran that statement).

### Apply on an existing database

```sql
CREATE TABLE IF NOT EXISTS
  "Module" (
    "mod" VARCHAR(70) NOT NULL PRIMARY KEY,
    "ept" TEXT NOT NULL,
    "storageType" VARCHAR(16) NOT NULL,
    "blockHash" VARCHAR(64),
    "blockHeight" INTEGER,
    "timestamp" timestamp default CURRENT_TIMESTAMP not null
  );

CREATE INDEX IF NOT EXISTS "ModuleBlockHashIndex"
ON "Module"("blockHash");

CREATE INDEX IF NOT EXISTS "ModuleBlockHeightIndex"
ON "Module"("blockHeight");
```

Connect with:

```sh
docker exec -it <postgres_container> psql -h localhost -p 5432 -U bcn bcn
```

Symptoms if the table is missing: 500s on `/modules` or `/module/:mod`, or insert errors when indexing deploys.

### Backfill

New deploys are indexed from ZMQ and sync. Historical deploys before the feature may require a re-sync or targeted re-index of those blocks (not automatic for already-synced height). For regtest, a clean `npm run clean` + `up` is simplest.

---

## Version compatibility

**Use the same release version of `@bitcoin-computer/lib` and the Bitcoin Computer Node.**

| Mismatch symptom | Typical cause |
| ---------------- | ------------- |
| Module routes 404 / table missing | Old node without Module API/schema |
| Client cannot parse module txs / `load` fails | Lib expects `{ ept }` / `BC`; node or peers on legacy assumptions |
| `decode` vs `load` confusion | Lib rejects module deploys in `decode` (`ModuleDecodeError`) |
| Empty index after upgrade | Schema not applied (see above) or node not restarted |

See also [Breaking changes](../changelog.md) for protocol-level wire format notes (module deploys, protocol id `BC`).

Pin versions in apps:

```json
{
  "dependencies": {
    "@bitcoin-computer/lib": "0.27.0-beta.1"
  }
}
```

Match the node image / monorepo tag to the same version line.

---

## Quick FAQ (ops)

### 401 Unauthorized

Missing or invalid `Authentication` header, clock skew, or `BCN_URL` mismatch. See [Authentication](#authentication).

### 404 Module not found / Not found

Unknown specifier/tx, not yet indexed, or cleaned from mempool. Use `waitForIndexed`, confirm chain tip, check `Module` / `Output` tables.

### 400 Invalid module specifier / validation errors

Path or query params failed validation (e.g. `mod` not `txid:vout`, bad `storageType`). Fix the client request.

### Empty `[]` with 200

Usually filters, sync lag, or indexer lag—not always an error. Walk the [empty results checklist](#empty-or-incomplete-results).

### Reorg: confirmation fields null

Expected. Rows remain; `blockHash` / `blockHeight` cleared until re-confirmed.

---

## Related

- [Node overview](./index.md) — install, env, architecture  
- [modules](./modules.md) / [module](./module.md) — module HTTP API  
- [get-txos](./get-txos.md) — output queries  
- Client: [waitForIndexed](../Lib/Computer/waitForIndexed.md), [getModules](../Lib/Computer/getModules.md), [getOUTXOs](../Lib/Computer/getOUTXOs.md)  
