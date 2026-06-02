---
order: -37
icon: credit-card
---

# Fees

## Miner Fees

Miner fees are paid to the miners as usual. You can configure the `satsPerByte` parameter of the `Computer` constructor to adjust the fee level.

## Protocol Fees

We charge a small fee for using the protocol. The fee is independent of the amount being sent or the size of the transaction; it depends only on the size of the metadata.

!!! Fee Estimate
The protocol fee is one dust amount for every 66 bytes of metadata.
!!!

The table below gives an overview of the dust amounts across different blockchains. We are assuming BTC at $100,000, LTC at $100, DOGE at $0.15, and PEPE at $0.000005.

| Cryptocurrency | Dust Amount    | USD Value     |
| -------------- | -------------- | ------------- |
| BTC            | ~ 0.000007 BTC | ~ $0.70       |
| LTC            | ~ 0.00007 LTC  | ~ $0.007      |
| DOGE           | ~ 0.025 DOGE   | ~ $0.0375     |
| PEPE           | ~ 0.025 PEPE   | ~ $0.00000012 |

The actual fee might vary slightly from the estimates given above.

### How the Protocol Fee Works

Bitcoin Computer transactions that create or update on-chain objects include metadata outputs in addition to the object outputs and any change outputs (see [Tx Format](./format.md) for the full structure).

These metadata outputs:

- Use bare multisig scripts so that the JavaScript expressions and other metadata are stored directly on chain (not just their hashes).
- Contain the smallest allowable non-dust amount of satoshis.

To ensure these outputs do not remain on the blockchain indefinitely and bloat the UTXO set for everyone, each metadata output includes a public key controlled by BCDB Inc. among its signers. This makes the outputs spendable by BCDB Inc., which periodically consolidates them when on-chain fees are low.

The dust value placed into these outputs is the protocol fee. BCDB Inc. recovers the majority of this value through consolidation and uses it to fund continued development and maintenance of the Bitcoin Computer platform.

This approach keeps your UTXO set clean while sustainably supporting the protocol.

**Important**:
- These metadata outputs are the **only** outputs created by the protocol that are spendable by BCDB Inc.
- There are no other mandatory payments or donations required to use the protocol on mainnet.
- When you select the taproot storage option for modules, those modules do not generate protocol-fee dust outputs.

The protocol fee mechanism is separate from the patented core technology. The patents (U.S. Patent Nos. 11,188,911 and 11,694,197 and related family members) cover the protocol and method for implementing object-oriented smart contracts on UTXO-based blockchains by storing expressions and computation history in transactions and associating evaluated values with outputs. For full details, see the [Legal Notice](./legal.md).

### Metadata Storage Options and Fee Impact

The amount of data written to the metadata outputs (and therefore the protocol fee) depends on how you configure storage for each object using the `_url` and `_readers` properties:

- **Neither `_url` nor `_readers`**: The expression and full metadata are stored unencrypted directly in the transaction’s metadata outputs.
- **Only `_readers`**: The expression and metadata are stored encrypted in the transaction’s metadata outputs.
- **Only `_url`**: Only a hash and pointer are stored in the transaction; the full (unencrypted) metadata lives on your server.
- **Both `_url` and `_readers`**: The metadata is stored encrypted on your server; only a pointer goes on-chain.

In all cases that write data to on-chain metadata outputs, the standard protocol fee applies. Using your own `_url` server can reduce on-chain data size in some scenarios but does not eliminate the fee for the on-chain pointer itself.

### Recovery of Dust Amounts

BCDB Inc. is able to recover the majority of these dust amounts when consolidating during periods of low on-chain fees. For example, on Litecoin a user pays approximately $0.007 in dust fees per metadata script and BCDB Inc. can typically recover about $0.005.

Last updated: 2026-06-01

See also: [Legal Notice](./legal.md) and [Tx Format](./format.md).