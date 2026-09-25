# Bitcoin Computer Explorer — Improvement Plan

**Status:** Phase 0 + object detail UX (history/methods/feedback); Modules list/detail staged separately  
**Last updated:** 2026-08-11  
**Scope:** `packages/explorer`, `packages/components` (shared UI), later `packages/lib` / `packages/node` for scale

## Goals

1. Make object browsing **fast and readable** without requiring full SES evaluation on every card.
2. Deliver **rich object detail and interaction** once a user selects an object.
3. Provide **clear navigation, onboarding, and non-custodial wallet UX**.
4. Preserve **security invariants** (SES sandbox, no XSS via object rendering, honest signing UX).

## Architecture principles

- **Two layers:** (A) fast index/metadata browse, (B) on-demand live object evaluation + interaction.
- Prefer fixing shared UI in `@bitcoin-computer/components` so NFT/chat/other apps benefit.
- Do not reimplement evaluation outside `@bitcoin-computer/lib` / SES.
- **Object evaluation cache is owned by lib** (`Db` + `Cache` via `computer.sync`). UI must not keep a second Map of smart objects; only schedule work (`limitConcurrency`) and present data.
- Prefer **index APIs with `verbosity: 1`** for lists (modules, objects) before calling `load` / `sync`.
- Prefer **source without evaluation** when inspecting modules (`getModule` / `ept`); evaluate exports only as a secondary step.
- Render object/module state as React text / structured JSON only (no unsanitized HTML from chain data).

## Package ownership

| Concern | Package |
|---------|---------|
| Gallery cards, SmartObject layout, Auth/Wallet chrome, concurrency helper | `components` |
| Nav, search, playground, modules list/detail, onboarding shell | `explorer` |
| Batch hex APIs, rate limits, optional state index | `node` + `lib` |
| SES / lockdown / evaluation cache | `lib` only |

---

## Completed outside the original phase grid (Modules)

These land as their own commit (modules page refactor) and establish the **metadata-first** pattern Phase 0 reuses for objects.

| Item | Status | Notes |
|------|--------|--------|
| `/modules` list with filters (storage, confirmed, order), pagination, `getModules({ verbosity: 1 })` | Done (staged) | Table UI: mod, storage badge, status, indexed time, source preview |
| `/modules/:rev` detail: on-chain meta, copyable mod, source panel, optional SES exports | Done (staged) | `getModule` first; `load` only for exports; errors isolated |
| `ModuleSource` read-only `ept` viewer | Done (staged) | Line count + copy; no evaluation required |
| Nav + SearchBar: Modules link; search prefers `getModule` before object route | Done (staged) | Avoid evaluating module source as an object |
| Playground success modal: link to `/modules/:rev` when `type === 'modules'` | Done (staged) | `SmartCallExecutionResult` |
| App route `/modules` | Done (staged) | |

**Takeaway for objects:** Modules already prove that index records + progressive evaluation is the right explorer pattern.

---

## Phase 0 — Quick wins

**Objective:** Fix broken search wiring, stop forcing N full `sync`s for a useful first paint, improve nav/onboarding/security copy. **Do not duplicate lib’s evaluation cache in the UI.**

| ID | Work item | Package | Acceptance criteria | Status |
|----|-----------|---------|---------------------|--------|
| 0.1 | Map URL query params correctly (`publicKey`, not `public-key`); refetch when `location.search` changes | `components` Gallery, `explorer` SearchBar | Searching by public key filters objects | Done (local) |
| 0.2 | List objects with `getOUTXOs({ verbosity: 1, isObject: true, … })` | `components` Gallery | Cards show satoshis / owner / mod / height without waiting on sync | Done (local) |
| 0.3 | `ObjectCard` with badges, value, owner, rev short form, skeleton | `components` | Visual hierarchy; no raw `{}` / hanging “Loading…” as only content | Done (local) |
| 0.4 | Progressive `computer.sync` for visible cards (IntersectionObserver + `limitConcurrency` ≤3). **No UI object store** — rely on lib `Db`/`Cache` | `components` | Deep state fills in without flooding the node; detail open reuses lib cache after gallery preview | Done (local); simplified after cache review |
| 0.5 | Always-visible primary nav: Objects, Playground, Modules, UTXOs, Docs, Wallet/Sign-in | `explorer` Navbar | Logged-out users still see Playground + Docs | Done (local; extends staged Modules nav) |
| 0.6 | Empty state: explain smart objects + CTAs to Playground and Docs | `components` Gallery | Empty home is educational, not dead end | Done (local) |
| 0.7 | Non-custodial + mnemonic backup warning on sign-in | `components` Auth | Warning visible before Log In | Done (local) |

**Out of scope for Phase 0:** infinite scroll, node batch APIs, full detail redesign, dark-mode toggle, Flowbite drawer rewrite.

### Evaluation caching decision (post Phase 0 review)

After reviewing `lib-secret` `db.ts` / `cache.ts`:

| Layer | Responsibility |
|-------|----------------|
| `Db.cache` + `pendingEffects` | Persistent object graph after chain eval; in-flight dedupe per `txId` |
| `computer.sync(rev)` | Public API that hits that cache |
| UI `limitConcurrency` | **Only** caps parallel first-time chain evals (e.g. gallery) so public nodes are not flooded |
| ~~UI `objectCache` Map~~ | **Removed** — duplicated lib state, wrong global scope vs per-`Computer` `Db` |

Do **not** call `computer.db.cache` from explorer/components (`@internal`).

---

## Phase 1 — Performance foundation

| ID | Work item | Package | Notes |
|----|-----------|---------|-------|
| 1.1 | Rely on lib `Db` cache for all `computer.sync` paths (Wallet multi-sync included) | `lib` / callers | No second object Map in UI |
| 1.2 | Reuse `limitConcurrency` for multi-sync UIs (Wallet, etc.) | `components` | Rate-limit only |
| 1.3 | Optional live home feed via `streamTXOs` | `components` / `explorer` | Append new revs |
| 1.4 | Virtualized list or infinite scroll | `components` Gallery | Replace simple prev/next as default |
| 1.5 | Client backoff on 429/5xx | `lib` or `components` | |
| 1.6 | Batch hex endpoint (if still needed after 0.x/1.x) | `node` + `lib` | `POST` multi-txid hex |
| 1.7 | Public node rate limits + cache headers | `node` / infra | |

**Exit criteria:** Meaningful first paint after OUTXO list &lt; ~500ms on typical public node; ≤3–6 concurrent syncs for optional previews.

---

## Phase 2 — Rich object detail

| ID | Work item | Package | Status |
|----|-----------|---------|--------|
| 2.1 | Summary header: mod/class, value, owners, spent/latest status | `components` SmartObject | Partial — sats/owner snippet; class/mod badge still TODO |
| 2.2 | Always-visible metadata (not hidden by default) | `components` | Done |
| 2.3 | Single revision history at top: First/Prev/Next/Latest + **horizontal** timeline | `components` | Done (2026-08-11) — no duplicate bottom nav |
| 2.4 | Related objects from property revs | `components` | Open |
| 2.5 | Explicit loading/error UI (stop silent redirect-only on sync fail) | `components` | Done — `InlineAlert` + link to tx |
| 2.6 | Method call confirm sheet (exp, env, fee) before broadcast | `components` | Open |
| 2.7 | Two-panel methods UI (list + call form) | `components` | Done (2026-08-11) |
| 2.8 | Consistent toast / InlineAlert feedback for method calls | `components` | Done — errors: toast + FieldError; success: toast + modal |

Align object detail with module detail patterns where useful (meta first, evaluate second, clear error isolation).

**Exit criteria:** Clicking a card feels like a full explorer detail page, not a JSON dump + hidden table.

---

## Phase 3 — Search and filters

| ID | Work item | Package |
|----|-----------|---------|
| 3.1 | `/search?q=` results page with typed sections | `explorer` |
| 3.2 | Home filter bar: owner, mod, sat range, confirmed, order | `explorer` + Gallery query (mirror Modules filters) |
| 3.3 | Search placeholder and validation hints | `explorer` SearchBar (partially started) |

---

## Phase 4 — Design system and mobile

| ID | Work item | Package |
|----|-----------|---------|
| 4.1 | Consistent brand tokens (`blue-1`…`blue-4`) on badges/CTAs | both |
| 4.2 | User dark-mode toggle (`class` + localStorage) | `explorer` |
| 4.3 | Responsive content shell and card grid | both |
| 4.4 | Replace brittle multi-`initFlowbite` drawer/modal with controlled React components | `components` |

---

## Phase 5 — Onboarding and Playground

| ID | Work item | Package |
|----|-----------|---------|
| 5.1 | First-visit dismissible intro | `explorer` |
| 5.2 | Home CTA “Create a Counter” → Playground with example | `explorer` |
| 5.3 | Guest-visible Playground with clear sign-in gate for writes | `explorer` |

---

## Phase 6 — Security hardening

| ID | Work item | Owner |
|----|-----------|-------|
| 6.1 | CSP audit (CloudFront/S3) | Infra |
| 6.2 | No `dangerouslySetInnerHTML` for on-chain fields | All UI |
| 6.3 | Signing confirmation on every broadcast path | `components` / Playground |
| 6.4 | Threat-model note: mnemonic XSS risk if HTML rendering ever added | Docs |

---

## Success metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Home first meaningful paint | Cards stuck on Loading… | Metadata from verbosity:1 immediately |
| Syncs per home page | ~12 always | 0 required; few for progressive preview via lib cache |
| Public-key search | Broken (`public-key`) | Works (`publicKey`) |
| Primary nav when logged out | Sparse | Playground, Modules, Docs, Sign-in visible |
| Empty home | “No Assets” | Explains objects + CTAs |
| Module browse | Single detail only / weak meta | List + filters + source-first detail |
| Wallet drawer | Possible Flowbite errors | Tracked in Phase 4.4 |

---

## Implementation log

### Modules (separate commit — staged)

- [x] `Modules.tsx` — paginated index with storage/status/order filters
- [x] `Module.tsx` — meta + source + optional evaluated exports
- [x] `ModuleSource.tsx` — read-only `ept` panel
- [x] Routes, navbar Modules entry, search module preference
- [x] Playground deploy success → module link when applicable

### Phase 0 (local working tree; not part of modules commit)

- [x] Plan document (`docs/IMPROVEMENT_PLAN.md`)
- [x] 0.1 Public-key query + search param reactivity
- [x] 0.2–0.3 Metadata gallery + `ObjectCard`
- [x] 0.4 Progressive `computer.sync` + `limitConcurrency` (UI object cache **removed** after lib review)
- [x] 0.5 Expanded always-visible nav
- [x] 0.6 Empty state CTAs
- [x] 0.7 Auth non-custodial warning

### Follow-up UX (2026-08-10)

- [x] **txId search fix:** 64-char hex was misclassified as public key; search now routes txids to `/transactions/:id` and only treats 02/03/04-prefixed keys as pubkeys
- [x] `/?txId=` / `/?txid=` redirects to the transaction page (getOUTXOs has no bare txId filter)
- [x] UTXOs page: balance/count cards, empty/error/loading, tx links, copy
- [x] Transactions page: summary strip, loading/error, rounded tables, unspent badge
- [x] Objects gallery: page header, filter chips, filtered empty state
- [x] Object detail header polish + loading skeleton
- [x] **Etherscan-style search placement:** full `HomeSearch` on `/` only; compact `NavbarSearch` always visible on other routes
- [x] **Design system pass:** consistent `text-xl/2xl font-semibold` titles, denser ObjectCards, shared `PageHeader`/`StatCard`, tighter page padding across Objects/UTXOs/Tx/Modules/Blocks/Playground

### Object detail UX (2026-08-11)

- [x] **One history section** at top (removed duplicate bottom History nav)
- [x] **Horizontal revision timeline** chips (scroll-x, auto-centers current) — no long vertical list before content
- [x] **Two-panel methods**: left method list (name + arity), right call form for selected method
- [x] **Two-column page layout**: Metadata + State | Methods (sticky methods on large screens)
- [x] **Load errors**: `InlineAlert` with “View transaction” instead of silent redirect-only
- [x] **Method errors**: `toast.error` + `FieldError` (no error modal dual-path)
- [x] **Method success**: `toast.success` with action link + success modal (green InlineAlert-aligned body)
- [x] Success modal content restyled to match toast/alert palette

### Later phases

Not started — see **Further improvements** below.

---

## Further improvements (prioritized backlog)

### Object detail (near-term)

| Priority | Idea | Why |
|----------|------|-----|
| P0 | **Class / mod badge** in header (`_mod` or constructor name) | Users identify what they opened without scanning metadata |
| P0 | **Spent / not-latest banner** when viewing historical rev | Prevents calling methods on dead revisions by accident |
| P1 | **Confirm sheet before broadcast** (exp, env, estimated fee) | Phase 2.6 — reduces accidental spends; aligns with security goals |
| P1 | **Auto-navigate to latest rev after successful call** | Optional toggle; fewer clicks after mutation |
| P1 | **Related objects panel** from property revs / env links | Graph navigation without leaving the page |
| P2 | **Diff view** between selected timeline revs (state JSON) | Power users auditing history |
| P2 | **Keyboard nav** for methods list (↑/↓ + Enter) | Faster interaction when many methods |
| P2 | Drop success **modal** once toast actions are trusted everywhere | One feedback channel only |

### Feedback system (app-wide consistency)

| Priority | Idea | Why |
|----------|------|-----|
| P0 | Prefer `toast.*` over legacy `showSnackBar` in remaining call sites (chess-app, templates) | One API surface |
| P1 | Shared **ResultBanner** primitive used by InlineAlert body + modal success | Pixel-identical success/error blocks |
| P1 | Playground results: same toast + green success panel as object methods | Cross-page consistency |
| P2 | Controlled React **Modal** (Phase 4.4) so Flowbite init races stop | Reliability |

### Performance & scale

| Priority | Idea | Notes |
|----------|------|-------|
| P1 | Virtualized gallery / infinite scroll | Phase 1.4 |
| P1 | Optional `streamTXOs` live home feed | Phase 1.3 |
| P2 | Batch hex / rate-limit headers on public node | Phase 1.6–1.7 |

### Product polish

| Priority | Idea | Notes |
|----------|------|-------|
| P1 | Home filters (owner, mod, sats, order) | Phase 3.2 — mirror Modules |
| P1 | Typed `/search?q=` results page | Phase 3.1 |
| P2 | Dark-mode toggle | Phase 4.2 |
| P2 | First-visit intro + “Create a Counter” CTA | Phase 5 |

---

## Suggested commit split

1. **Modules page only** (currently staged): list, detail, source panel, nav/search/playground wiring.  
2. **Phase 0 explorer UX** (unstaged / untracked): gallery, ObjectCard, limitConcurrency, Auth warning, nav expansion, this plan doc.
