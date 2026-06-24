---
order: -37
icon: credit-card
---

# Fees

## Miner Fees

Miner fees are paid to the miners as usual. You can configure the `satsPerByte` parameter of the `Computer` constructor to adjust the fee level.

## On-Chain Storage Costs and UTXO Hygiene Dust (Technical)

We recommend to minimize on-chain data, thereby minimizing user fees. Dust amounts are kept to the absolute minimum permitted by the Bitcoin protocol.

!!! Dust Estimate
The technical dust cost is one dust amount for every 66 bytes of on-chain metadata.
!!!

The table below gives an overview of the dust amounts across different blockchains. We are assuming BTC at $100,000, LTC at $100, DOGE at $0.15, and PEPE at $0.000005.

| Cryptocurrency | Dust Amount    | USD Value     |
| -------------- | -------------- | ------------- |
| BTC            | ~ 0.000007 BTC | ~ $0.70       |
| LTC            | ~ 0.00007 LTC  | ~ $0.007      |
| DOGE           | ~ 0.025 DOGE   | ~ $0.0375     |
| PEPE           | ~ 0.025 PEPE   | ~ $0.00000012 |

The actual dust amount might vary slightly from the estimates given above.

### How On-Chain Storage Dust and UTXO Hygiene Work

Bitcoin Computer transactions that create or update on-chain objects include metadata outputs in addition to the object outputs and any change outputs (see [Tx Format](./format.md) for the full structure).

These metadata outputs:

- Use bare multisig scripts so that the JavaScript expressions and other metadata are stored directly on chain (not just their hashes). Bare multisig allows the full data to be placed directly in the output of a *single* transaction.
- Contain the smallest allowable non-dust amount of satoshis (the absolute minimum permitted by the Bitcoin protocol).

**Rationale for the current direct on-chain storage method (bare multisig)**: Bare multisig is chosen for paths that store data directly because it enables single-transaction direct data storage (data in the output). In contrast, taproot and other standard output types that permit data storage only store hashes of data in the output; the data itself is provided in the spending input of a second transaction. This two-transaction (commit/reveal) pattern can introduce unacceptable latency, mempool stickiness, or inconsistent smart object state in high-throughput environments such as exchanges. RBF is not always a sufficient mitigation due to smart contract designs where it can be counterproductive.

OP_RETURN is not a viable alternative for achieving the same single-transaction UX: there can be only one OP_RETURN output per transaction and its size is strictly limited. We cannot achieve the required single-transaction direct data storage (including support for multiple metadata outputs and sufficient data sizes for expressions or modules) using OP_RETURN.

The single-tx direct-data property of bare multisig provides better UX and reliability for those use cases while still allowing the UTXO hygiene service.

To ensure these outputs do not remain on the blockchain indefinitely and bloat the UTXO set for everyone, each metadata output includes a public key controlled by BCDB Inc. among its signers. This makes the outputs spendable by BCDB Inc., which periodically consolidates them when on-chain fees are low. This is the UTXO hygiene service.

The dust value placed into these outputs is the technical cost of the chosen direct on-chain storage method plus compensation for the associated hygiene/consolidation service. BCDB Inc. recovers the majority of this value through consolidation.

This approach keeps your UTXO set clean.

**Important**:
- These metadata outputs (when present) are the **only** outputs created by the protocol that are spendable by BCDB Inc.
- There are no other mandatory payments or donations required to use the protocol on mainnet.
- The only transactions that do not generate these hygiene dust outputs are those that encode modules using the taproot storage option. All expression transactions and all non-taproot module transactions generate one or more minimal-dust metadata outputs.
- Users can independently verify the above (exact outputs, dust values, scripts, keys, and presence/absence of BCDB-controlled outputs) by parsing the produced transactions with open-source tools such as the widely used bitcoin-js-lib library and similar.

Any compensation for development of the protocol or the value of the patented technology itself is handled through traditional off-chain patent/commercial licenses (currently free under open terms; see [Legal Notice](./legal.md) for licensing details and reservation of rights). The on-chain dust is strictly technical.

### User Choices to Control On-Chain Data and Hygiene Dust Costs

To minimize on-chain data (and thereby user fees), the following options are available and recommended where suitable:

- **Taproot modules**: Using `moduleStorageType: 'taproot'` (the default where available) for modules means the module encoding transactions generate *no* hygiene dust outputs. Taproot modules use a two-transaction pattern (hash commit then reveal) but provide the lowest on-chain footprint for code/modules.
- **Module system (especially taproot)**: Deploy large code or expressions once as a (taproot) module. Subsequent expression transactions can then reference the module and contain extremely small data. This results in minimal *constant* dust (rather than data-size-proportional) for the using transactions.
- **`_url` (with or without `_readers`)**: Only a small pointer/hash is stored on-chain in the (still-present) dust metadata output(s). This changes the dust cost from proportional to the size of the expression to a small constant, independent of expression size. Especially valuable when the expression would otherwise be large. Your server holds the full data.
- **Direct bare-multisig path (no `_url`, or `moduleStorageType: 'multisig'`)**: This is the path that stores expressions (or modules) directly via bare multisig. It is chosen when single-tx reliability and low latency are important for high-throughput scenarios (e.g. exchanges). Even on this path, minimize the data written in the expression. Note that hygiene dust outputs are still present (as a technical necessity of the direct storage method plus for hygiene).

**Trade-offs**: Taproot modules require two transactions for the module itself (availability/latency considerations); `_url` requires you to run/maintain a server for the full data; direct bare-multisig gives single-tx UX for the using transactions but writes more data on-chain when the expression is large (hence the strong recommendation to use modules + `_url` to keep expressions tiny).

**Verification**: Users can parse the produced transactions with bitcoin-js-lib (and similar open-source tools) to confirm exact outputs, sizes, scripts, and keys, and to observe precisely when hygiene dust outputs are or are not present.

### Dust Impact

The amount of data written to the metadata outputs (and therefore the hygiene dust cost) depends on how you configure storage for each object using the `_url` and `_readers` properties:

- **Neither `_url` nor `_readers`**: The expression and full metadata are stored unencrypted directly in the transaction’s metadata outputs.
- **Only `_readers`**: The expression and metadata are stored encrypted in the transaction’s metadata outputs.
- **Only `_url`**: Only a small pointer/hash is stored on-chain in the (still-present) dust metadata output(s). The full (unencrypted) metadata lives on your server. This changes the dust cost from proportional to the size of the expression to a small constant, independent of expression size. Especially valuable when the expression would otherwise be large.
- **Both `_url` and `_readers`**: The metadata is stored encrypted on your server; only a pointer goes on-chain.

In all cases that write data (or a pointer) to on-chain metadata outputs, the standard technical dust applies. Using your own `_url` server can reduce on-chain data size in some scenarios but does not eliminate the dust for the on-chain pointer itself.

### Recovery of Dust Amounts

BCDB Inc. performs the UTXO hygiene service by consolidating (spending) the minimal-dust metadata outputs during periods of low on-chain fees. This prevents permanent bloat of the UTXO set. For example, on Litecoin a user pays approximately $0.007 in dust per metadata script and BCDB Inc. can typically recover about $0.005 through consolidation.

### Forward-Looking Storage Evolution

The current bare-multisig direct-storage approach (with associated metadata outputs) is one implementation of on-chain storage, chosen in part because it enables single-transaction direct data storage with good UX and reliability for high-throughput use cases. The project anticipates exploring and supporting improved storage techniques over time (building on existing taproot support for modules) that can further reduce or eliminate the need for BCDB-controlled metadata outputs while preserving (or improving) reliability, latency, and single-tx characteristics where possible. Any future changes will be documented here and in the release notes.

### Regulatory, Compliance, and Risk Considerations

On-chain activity consists of the technical dust required by the chosen direct on-chain storage method (bare multisig for expressions and non-taproot modules, chosen in part for single-transaction reliability in high-throughput settings) plus the UTXO hygiene service. The patented technology itself is currently available free under open terms (see the Licensing section in the [Legal Notice](./legal.md)). Users control their on-chain footprint via the choices documented in the "User Choices to Control On-Chain Data and Hygiene Dust Costs" section above; transactions are independently verifiable with tools such as bitcoin-js-lib.

This software is a technical tool that enables users to write expressions, metadata, and objects directly into transactions on public blockchains. BCDB Inc. provides no custody, platform service, or financial services. Compliance with applicable laws—including U.S. securities laws (e.g., Howey test considerations), the upcoming California Digital Financial Asset Law (DFAL), AML, tax, and sanctions—is solely the responsibility of the user. See the full [Legal Notice](./legal.md) (especially Legal and Regulatory Compliance and Licensing sections) for details, disclaimers, and grandfathering.

Last updated: 2026-06-15

See also: [Legal Notice](./legal.md) and [Tx Format](./format.md).