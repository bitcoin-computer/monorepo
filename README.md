<div align="center">
  <img src="imgs/bitcoin-computer@1x.png" alt="Bitcoin Computer" style="max-height: 180px" />

  <h1>Bitcoin Computer</h1>

  <p>
    <a href="https://www.npmjs.com/package/@bitcoin-computer/lib">
      <img src="https://img.shields.io/npm/v/@bitcoin-computer/lib.svg" alt="npm version" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
    </a>
    <a href="https://github.com/bitcoin-computer/monorepo">
      <img src="https://img.shields.io/github/stars/bitcoin-computer/monorepo?style=social" alt="GitHub stars" />
    </a>
  </p>

  <p>
    Turing-complete smart contracts on UTXO chains, written in JavaScript<br />
    <a href="https://bitcoincomputer.io/">website</a> ·
    <a href="https://docs.bitcoincomputer.io/">docs</a> ·
    <a href="https://t.me/thebitcoincomputer">telegram</a>
  </p>
</div>

Objects live in UTXOs. Ownership is as strong as holding bitcoin. No sidechains.
No extra tokens. No trusted intermediaries. Computation cost is independent of
the number of steps.

Write normal JavaScript/TypeScript classes. Calling a method that changes state
automatically builds, funds, signs and broadcasts a real transaction on a UTXO
chain.

Supported chains: Bitcoin · Litecoin · Dogecoin · Pepecoin

## Why Bitcoin Computer?

- **Native UTXO ownership** — Smart objects are stored in outputs. Only the
  owner can update them.
- **Cost independent of computational complexity** — All logic runs on the
  client. You pay for the size of the metadata, not for the number of
  computational steps.
- **Real JavaScript** — No new language or virtual machine. Use the tools and
  libraries you already know.
- **Multichain by design** — The same contract code runs on Bitcoin, Litecoin,
  Dogecoin and Pepecoin.
- **Perfectly sharded** — Users only compute the objects they care about. There
  is no global state execution.
- **Composable** — Objects can freely reference each other (with explicit
  ownership consent).
- **Compatible** — Works alongside Ordinals, Runes, BitVM and other Bitcoin
  protocols.

## Quick Example

You need to have [node.js](https://nodejs.org/en/) installed. First download and
install the Bitcoin Computer library from
[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):

```bash Terminal
# Create packages.json file
npm init -y

# Install library
npm install @bitcoin-computer/lib
```

Then create a file `index.mjs`.

```js index.mjs
import { Computer, Contract } from "@bitcoin-computer/lib";

class Counter extends Contract {
  constructor() {
    super({ n: 0 });
  }
  inc() {
    this.n += 1;
  }
}

// Connects to the public Litecoin regtest node
const computer = new Computer({ chain: "LTC", network: "regtest" });
await computer.faucet(1e5);

const counter = await computer.new(Counter);
await counter.inc();

console.log(counter);
// → Counter { n: 1, _id: "...", _rev: "...", _root: "...", _satoshis: <dust>, _owners: [...] }
```

Execute the smart contract.

```bash Terminal
node index.mjs
```

The expected output is:

```js Terminal
Counter {
  n: 1,
  _id: <transaction id>:<output number>,
  _rev: <transaction id>:<output number>,
  _root: <transaction id>:<output number>,
  _satoshis: 7860n,
  _owners: [<string encoding of public key>]
}
```

## Getting Started

Full setup instructions (browser, Node, local node, templates):

→ [docs.bitcoincomputer.io/start](https://docs.bitcoincomputer.io/start)

## Live Demos

- [Wallet](https://wallet.bitcoincomputer.io) — Non-custodial wallet with smart
  object support
- [Explorer](https://explorer.bitcoincomputer.io) — Block explorer that
  understands smart contracts
- [NFT App](https://nft.bitcoincomputer.io) — Mint, send and view non-fungible
  tokens

## Monorepo Structure

### Core

| Package                                               | Description                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| [`@bitcoin-computer/lib`](packages/lib)               | Main client library — smart contracts, evaluation, wallet helpers |
| [`@bitcoin-computer/node`](packages/node)             | Indexer + REST API server (the “Bitcoin Computer Node”)           |
| [`@bitcoin-computer/nakamotojs`](packages/nakamotojs) | Low-level transaction building and parsing                        |

### Applications

| Package                         | Description                                   |
| ------------------------------- | --------------------------------------------- |
| [`wallet`](packages/wallet)     | Non-custodial wallet                          |
| [`explorer`](packages/explorer) | Blockchain explorer with smart-object support |
| [`chat`](packages/chat)         | P2P chat over Bitcoin / Litecoin              |
| [`nft`](packages/nft)           | Non-fungible token application                |

### Standard Contracts

| Package                     | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| [`TBC20`](packages/TBC20)   | Fungible token standard (ERC-20 equivalent)             |
| [`TBC721`](packages/TBC721) | Non-fungible token standard (ERC-721 equivalent)        |
| [`TBC777`](packages/TBC777) | Programmable escrow token standard (similar to ERC-777) |
| [`swap`](packages/swap)     | Atomic swap and sale contracts                          |

### Templates & Docs

- [`nextjs-template`](packages/nextjs-template) /
  [`cra-template`](packages/cra-template) /
  [`nodejs-template`](packages/nodejs-template) — Starter projects
- [`docs-2`](packages/docs-2) — Source for the official documentation
- [`website`](packages/website) — Source for bitcoincomputer.io

## How It Works (High Level)

1. You define a class `C` that extends `Contract`.
2. `c = await computer.new(C, args)` evaluates the constructor inside a secure
   SES compartment and creates a transaction whose outputs represent the new
   objects.
3. Calling a method on `c` that mutates state creates another transaction. The
   previous revision is spent and a new revision is created.
4. The library maintains a partially-persistent object graph (node-copying
   method) so that history is efficient and concurrent evaluation is safe.
5. Dual-layer security proxies prevent unauthorized mutation outside of a
   transition. Only the methods you defined can change state.
6. Contracts can safely read chain state through a restricted `InnerComputer`
   API.

For the full technical design see the
[documentation](https://docs.bitcoincomputer.io).

## Community

- **Telegram** — [t.me/thebitcoincomputer](https://t.me/thebitcoincomputer)
  (primary support channel)
- **Twitter / X** — [@BTC_Computer](https://twitter.com/BTC_Computer)
- **GitHub Issues** — Bug reports and feature requests

Contributions are welcome. See the contributing guidelines in the individual
packages.

## License & Legal

This software is licensed under the **MIT License**. See
[LICENSE.md](LICENSE.md).

The software includes patented technology (U.S. Patent Nos. 11,188,911 and
11,694,197 and related family members).  
The patented technology is currently available under free open terms for all
uses. BCDB Inc. reserves the right to introduce paid commercial licensing terms
in the future. Transactions created before 2026-06-15 are grandfathered.

When using direct on-chain storage, transactions include minimal technical dust
required by the Bitcoin protocol plus a small amount for UTXO hygiene. See
[LEGAL.md](LEGAL.md) and the [Fees
documentation](https://docs.bitcoincomputer.io) for full details.

For alternative licensing inquiries contact
[clemens@bitcoincomputer.io](mailto:clemens@bitcoincomputer.io).

---

Questions? Join the [Telegram](https://t.me/thebitcoincomputer).
