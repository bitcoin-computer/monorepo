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
