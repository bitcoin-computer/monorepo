---
icon: shield
---

# Sandbox & Inner Computer

Contract methods run inside a restricted **SES compartment**. The only chain-facing API available to that code is the **InnerComputer** (`computer` global): a read-only, fail-closed view of **confirmed** blockchain state.

For the full method reference, stabilizers, and confirmation rules, see [Querying inside of a Contract](./index.md#querying-inside-of-a-contract).

## Goals

1. **Determinism** — If a query succeeds against a chain prefix, the same call must succeed with the same result on every extension of that chain.
2. **Fail closed** — Transient facts (mempool, “not yet”, future heights) never become part of a valid transition.
3. **No silent soft-fail** — Catching a thrown error does not clear invalidation; after the compartment returns, the host still rejects the transition if the evaluation was marked invalid.

## Observation stability

For any InnerComputer method `m` and arguments `args`: if `computer.m(...args)` succeeds without invalidation against chain state `b₁`, then on any extension `b₂ ⊇ b₁` the same call must succeed and return the same value.

Equivalently: every successful observation is **invariant under future chain growth**.

## Confirmed locations (summary)

Most APIs require the referenced transaction to be **in a block** before the call may succeed:

| Family                                      | Rule (summary)                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `sync` / `decode` / `load` / `getAncestors` | Start location/tx confirmed                                                          |
| `first` / `prev`                            | Start rev confirmed; `prev` may return `undefined` at root                           |
| `next`                                      | Start **and** returned successor confirmed; no next → invalidate                     |
| `last`                                      | Start and result confirmed; tip must be **spent confirmed** (not a live unspent tip) |
| Block time/height/hash of a tx              | Tx confirmed                                                                         |
| `getBlockHash(height)`                      | Height ≤ tip; not future                                                             |
| `getTXOs` (+ aliases)                       | Stabilizer: `lteBlockHeight` / `blockHeight` / `blockHash`                           |

`latest` is **not** exposed inside contracts (the live tip is non-deterministic under chain extension).

## Invalidation flow

1. A query fails or observes a transient fact (or a direct policy rule rejects, e.g. future height).
2. InnerComputer marks the **current evaluation frame** invalid and throws. Each `Db.eval` / `Modules.load` runs under `withEvalInvalidation`:
   - **Node:** `AsyncLocalStorage` via `process.getBuiltinModule('async_hooks')` (no static `node:async_hooks` import, so browser bundles stay clean). Concurrent evaluations are truly concurrent and isolated by async context.
   - **Browser:** await-scoped stack with **serialized root** frames (no Promise patching under SES `lockdown`). Nested frames (e.g. `Modules.load` inside `Db.eval`) still nest; concurrent root evals queue so stack tops never cross-talk.
3. Free-variable `computer` in methods may resolve to the **create-time or module-load** instance (SES lexical binding), which can differ from the eval endowment. Invalidation still applies to the **active eval frame**.
4. The compartment may return after `catch` — the frame flag is **not** cleared until the host has checked it.
5. The host accepts or rejects using **`frame.invalid` / `frame.msg`** (not only `computer.isInvalid`), so shadowing getters on the endowment cannot hide invalidation. If the compartment throws *or* returns after catch-and-continue, `Db.eval` still rejects when the frame is marked invalid.
6. The in-compartment `computer` is a **hardened method facade**: public query methods only, no internal client object, methods not replaceable, `resetInvalid` is admin-only.

### `console` endowment (dev only)

Compartment globals include host `console` only when the client `mode` is **`dev`** or **`debug`**.

In **`prod`**, `console` is **not** endowed. Contract or module code that references `console` gets a `ReferenceError` and the evaluation fails. **Do not use `console` in production smart contracts** — logging is not part of the on-chain API, and endowing the shared host `console` is ambient authority (especially without SES `lockdown`, which runs in prod).

Use off-chain tooling and the outer `Computer` client for diagnostics.

### Error message shape

Every invalidation path (policy `_invalidate`, missing/nullish `_safeCall`, and host rethrow from `Db.eval`) builds the public string with a shared formatter so callers always see **exactly one** copy of:

> Accessing non-existent on-chain state inside a smart contract is forbidden.

A short reason may appear before that suffix, for example:

- `getBlockHash with future height is forbidden. Accessing non-existent on-chain state inside a smart contract is forbidden.`
- `Transaction id … not found or not yet confirmed by sync. Accessing non-existent on-chain state inside a smart contract is forbidden.`

The formatter is idempotent (already-suffixed strings are not doubled). Match with `message.endsWith(...)` (or equivalent). Do **not** expect a short policy reason alone without the standard suffix.

## Client vs contract `computer`

|                                          | Outer [`Computer`](../Computer/index.md) | InnerComputer (`computer` in contracts) |
| ---------------------------------------- | ---------------------------------------- | --------------------------------------- |
| Writes (`new`, `broadcast`, …)           | Yes                                      | No                                      |
| Mempool / unconfirmed reads              | Often allowed (may return `undefined`)   | Forbidden → invalidate                  |
| `latest`                                 | Yes                                      | **Not exposed**                         |
| `getTXOs` without height/hash stabilizer | Yes                                      | Forbidden → invalidate                  |
| Host `console` in compartment            | N/A                                      | **`dev` / `debug` only** (not in `prod`) |
| Concurrent evaluations                   | Multiple clients/calls                   | Isolated eval frames (ALS on Node; serialized roots in browser) |

## Security notes (what contracts cannot do)

- Contracts cannot create or clear eval frames (`withEvalInvalidation` is host-only).
- `computer.resetInvalid()` is a no-op without admin privilege; `constructor.resetGlobalInvalid()` is a no-op for contracts.
- The endowment is hardened so contracts cannot replace `sync` / `first` / …, redefine `isInvalid`, or reassign the prototype to hide invalidation.
- Host reject decisions use the **frame**, not only endowment getters.
- In **`prod`**, contracts cannot use `console` (not endowed). Prefer no logging in on-chain code at all.

## Practical implications

- Confirm module deploys before contract `load`.
- Confirm object revisions before history walks or escrow audits.
- For terminal `last` checks, spend the tip (e.g. `delete`) and wait for confirmation.
- Stabilize in-contract TXO queries with a historical height or block hash; empty result sets with a valid stabilizer are fine (wait for indexing if apps/tests expect a known object to appear).
- Escrow / chess flows: cancel or settle, **wait for confirmation**, then `withdraw` / refund (cancel and withdraw cannot be one atomic observation of unconfirmed tip spend).
- Do not ship contract methods that call `console.*` if they must run under `mode: 'prod'`.

## See also

- [Contract – Querying API](./index.md#querying-inside-of-a-contract)
- [Computer API](../Computer/index.md)
- [How it Works](../../how-it-works.md)
