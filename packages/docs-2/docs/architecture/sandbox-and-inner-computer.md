---
title: "Sandbox & Inner Computer"
---

# Sandbox & Inner Computer

Contract methods run inside a restricted SES compartment. The only chain-facing
API available to that code is the **InnerComputer** (`computer` global): a
read-only, fail-closed view of confirmed blockchain state.

## Goals

1. **Determinism** — If a query succeeds against a chain prefix, the same call
   must succeed with the same result on every extension of that chain.
2. **Fail closed** — Transient facts (mempool, “not yet”, future heights) never
   become part of a valid transition.
3. **No silent soft-fail** — Catching a thrown error does not clear invalidation;
   `Db.eval` still rejects the transition if the invalid flag is set.

## Observation stability

For any InnerComputer method `m` and arguments `args`: if
`computer.m(...args)` succeeds without setting the invalid flag against chain
state `b₁`, then on any extension `b₂ ⊇ b₁` the same call must succeed and
return the same value.

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

1. Query fails or observes a transient fact.
2. InnerComputer sets `globalInvalidState` and throws.
3. Compartment returns (possibly after `catch`).
4. `Db.eval` sees the flag and rejects the transition.

## Client vs contract `computer`

The outer [Computer](/docs/reference/computer-class) client may return
`undefined` for unconfirmed data and supports writes (`new`, `broadcast`, …).
The in-contract global is a different, stricter surface. Full method tables and
examples live in the library Contract reference (Retype docs:
`Lib/Contract` — Querying inside of a Contract).

## Practical implications

- Confirm deploys before `load` in contracts.
- Confirm object revisions before history walks or escrow audits.
- For terminal `last` checks, spend the tip and wait for confirmation.
- Stabilize in-contract TXO queries with a historical height or block hash.
- Escrow/chess apps: cancel or settle, wait for confirmation, then
  `withdraw` / refund.
