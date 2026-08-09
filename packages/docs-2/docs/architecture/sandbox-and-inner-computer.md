---
title: "Sandbox & Inner Computer"
---

# Sandbox & Inner Computer

Contract methods run inside a restricted SES compartment. The only chain-facing
API available to that code is the **InnerComputer** (`computer` global): a
read-only, fail-closed view of confirmed blockchain state.

The live Retype reference lives under `packages/docs/Lib/Contract/` in the monorepo
(see `index.md` for querying and `sandbox-and-inner-computer.md` for the sandbox).

## Goals

1. **Determinism** — If a query succeeds against a chain prefix, the same call
   must succeed with the same result on every extension of that chain.
2. **Fail closed** — Transient facts (mempool, “not yet”, future heights) never
   become part of a valid transition.
3. **No silent soft-fail** — Catching a thrown error does not clear invalidation;
   the host still rejects if the evaluation frame is marked invalid.

## Observation stability

For any InnerComputer method `m` and arguments `args`: if
`computer.m(...args)` succeeds without invalidation against chain state `b₁`,
then on any extension `b₂ ⊇ b₁` the same call must succeed and return the same
value.

## Confirmed locations

Most APIs require the referenced transaction to be **in a block** before the
call may succeed:

| Family | Rule (summary) |
| --- | --- |
| `sync` / `decode` / `load` / `getAncestors` | Start location/tx confirmed |
| `first` / `prev` | Start rev confirmed; `prev` may return `undefined` at root |
| `next` | Start and **result** confirmed; no next → invalidate |
| `last` | Start and result confirmed; tip must be **spent confirmed** (not live unspent tip) |
| Block time/height/hash of a tx | Tx confirmed |
| `getBlockHash(height)` | Height ≤ tip; not future |
| `getTXOs` (+ aliases) | Stabilizer: `lteBlockHeight` / `blockHeight` / `blockHash` |

`latest` is **not** exposed inside contracts.

## Invalidation flow

1. Query fails or observes a transient fact (or a policy rule rejects, e.g.
   future height).
2. InnerComputer marks the **current evaluation frame** invalid and throws.
   Invalidation is **frame-only** (no per-instance flags; no contract-facing
   invalidation API). Each `Db.eval` / `Modules.load` runs under
   `withEvalInvalidation` (dedicated eval-frame module):
   - **Node:** `AsyncLocalStorage` (no static `node:async_hooks` import).
   - **Browser:** await-scoped stack with serialized root frames (no Promise
     patching under SES `lockdown`). Nested loads nest; concurrent roots queue.
3. Host installs the active observation client on the frame; free-var query
   methods route to that client. Invalidation always hits the **active frame**.
4. Compartment may return after `catch` — the frame flag is **not** cleared
   until the host checks it.
5. Host checks **only `frame.invalid` / `frame.msg`** on both throw and
   catch-and-continue paths.
6. In-compartment `computer` is a **hardened query-only facade** (no
   `isInvalid` / `resetInvalid`).
7. Host `console` is endowed only in client `dev` / `debug` mode. In **`prod`**,
   contracts must not use `console` (not in scope). Logging is not part of the
   on-chain API.

Error text always ends with exactly one copy of:

> Accessing non-existent on-chain state inside a smart contract is forbidden.

A short reason may appear before that suffix. Policy rejects and missing
observations share the same single-suffix form (never a short reason alone,
never a doubled forbidden sentence). Match with `message.endsWith(...)`.

## Client vs contract `computer`

The outer Computer client may return `undefined` for unconfirmed data and
supports writes (`new`, `broadcast`, …). The in-contract global is a different,
stricter surface. Full method tables: `packages/docs/Lib/Contract/`.

## Practical implications

- Confirm deploys before `load` in contracts.
- Confirm object revisions before history walks or escrow audits.
- For terminal `last` checks, spend the tip and wait for confirmation.
- Stabilize in-contract TXO queries with a historical height or block hash;
  empty results with a valid stabilizer are allowed.
- Escrow/chess apps: cancel or settle, wait for confirmation, then
  `withdraw` / refund.
