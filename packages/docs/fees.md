---
order: -37
icon: credit-card
---

# Fees

## Miner Fees

Miner fees are paid to the miners as usual. You can configure the `satsPerByte` parameter of the `Computer` constructor to adjust the fee level.

## Protocol Fees

We charge a small fee for using the protocol. The fee is independent of the amount being sent or the size of the transaction; it depends only on the size of the metadata:

!!! Fee Estimate
The protocol fees is one dust amount for every 66 bytes of metadata.
!!!

The table below gives an overview of the dust amounts across different blockchains. We are assuming BTC at $100.000, LTC at $100, DOGE at $0.15, and PEPE at $0.000005.

| Cryptocurrency | Dust Amount    | USD Value     |
| -------------- | -------------- | ------------- |
| BTC            | ~ 0.000007 BTC | ~ $0.70000    |
| LTC            | ~ 0.00007 LTC  | ~ $0.00700    |
| DOGE           | ~ 0.025 DOGE   | ~ $0.0375     |
| PEPE           | ~ 0.025 PEPE   | ~ $0.00000012 |

The actual fee might vary slightly from the estimates given above. In the following we explain how the fee is calculated in detail. Recall from the Section called [Tx Format](./format.md) that the metadata is encoded in bare multisig scripts. These scripts can contain up to three public keys. We use on of these to be able to spend the dust and the other 1 or 2 public keys encode the data. Therefore the fee to store two public keys worth of data (66 bytes) is one dust amount.

### How It Works

1. Each Bitcoin Computer transaction encodes a JavaScript expression and other metadata like the environment into bare multisig scripts, each carrying the smallest allowable (non-dust) output.
2. To ensure these outputs don’t bloat the UTXO set, we include a public key that only the company developing the Bitcoin Computer (BCDB Inc.) can spend.
3. When on-chain fees fall low enough, BCDB Inc. will collect these dust-level outputs to fund continued development.

This approach keeps your UTXO set clean while sustainably supporting the Bitcoin Computer platform.

We are able to recover the majority of these dust amounts, for example, on Litecoin the user pays ca $0.007 in dust fees per metadata script and we can recover about $0.005.
