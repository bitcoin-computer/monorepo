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

### Error message shape

Every invalidation path builds the public string with a shared formatter so callers always see **exactly one** copy of:

> Accessing non-existent on-chain state inside a smart contract is forbidden.

A short reason may appear before that suffix, for example:

- `getBlockHash with future height is forbidden. Accessing non-existent on-chain state inside a smart contract is forbidden.`
- `Transaction id … not found or not yet confirmed by sync. Accessing non-existent on-chain state inside a smart contract is forbidden.`

## Client vs contract `computer`

|                                          | Outer [`Computer`](../Computer/index.md) | InnerComputer (`computer` in contracts)                         |
| ---------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| Writes (`new`, `broadcast`, …)           | Yes                                      | No                                                              |
| Mempool / unconfirmed reads              | Often allowed (may return `undefined`)   | Forbidden → invalidate                                          |
| `latest`                                 | Yes                                      | **Not exposed**                                                 |
| `getTXOs` without height/hash stabilizer | Yes                                      | Forbidden → invalidate                                          |
| Concurrent evaluations                   | Multiple clients/calls                   | Isolated eval frames (ALS on Node; serialized roots in browser) |

## Security notes (what contracts cannot do)

- Contracts cannot create or clear eval frames.
- The endowment is hardened so contracts cannot replace `sync` / `first` / …, redefine internal functions, or reassign the prototype to hide invalidation.
- Host reject decisions use the **frame**, not only endowment getters.

## Practical implications

- Confirm module deploys before contract `load`.
- Confirm object revisions before history walks or escrow audits.
- For terminal `last` checks, spend the tip (e.g. `delete`) and wait for confirmation.
- Stabilize in-contract TXO queries with a historical height or block hash; empty result sets with a valid stabilizer are fine (wait for indexing if apps/tests expect a known object to appear).
- Escrow / chess flows: cancel or settle, **wait for confirmation**, then `withdraw` / refund (cancel and withdraw cannot be one atomic observation of unconfirmed tip spend).

## See also

- [Contract – Querying API](./index.md#querying-inside-of-a-contract)
- [Computer API](../Computer/index.md)
- [How it Works](../../how-it-works.md)
