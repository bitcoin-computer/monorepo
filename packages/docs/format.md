---
order: -36
icon: note
---

# Tx Format

The outputs of a Bitcoin Computer transaction are partitioned as follows:

## Outputs Containing Objects

The first number of outputs represent on-chain objects. Their amounts and scripts are determined by the `_satoshis` and `_owners` property of the corresponding on-chain objects. These outputs can only be spent by their owners and they are spent when the corresponding on-chain object is updated.

## Outputs Containing Metadata

Next is a sequence of outputs encoding the metadata—for example JavaScript expressions or the code of a module. These outputs use bare multisig scripts so that the data (not just its hash) is stored directly on chain. These outputs contain the minimal non-dust amount of satoshis permitted by the Bitcoin protocol.

**UX rationale for bare multisig (vs. alternatives)**: Bare multisig is used (for expressions and non-taproot modules) so that the full data resides directly in the output of a _single_ transaction. In contrast, taproot and similar standard output types store only a hash in the output; the data is provided later in the spending input of a second transaction (commit/reveal pattern). The single-transaction direct-data property improves reliability and reduces latency in high-throughput settings (e.g. exchanges), where two-transaction patterns can lead to price movement risk, stuck mempool entries, or inconsistent object state.

OP_RETURN is not suitable for achieving equivalent single-transaction UX: there can be only one OP_RETURN output per transaction and its size is strictly limited. We cannot achieve the required single-transaction direct data storage (including support for multiple metadata outputs and sufficient data sizes for expressions or modules) using OP_RETURN.

(See [Fees](./fees.md) for the full hygiene dust framing, precise scope of when these outputs appear, the "User Choices to Control On-Chain Data and Hygiene Dust Costs" guidance, absolute minimum dust, and technical necessity of the chosen direct on-chain storage method.)

To allow the company developing the Bitcoin Computer (BCDB Inc.) to later spend and consolidate these outputs (preventing permanent bloat of the UTXO set via the hygiene service), each such output includes a public key controlled by BCDB Inc. among its signers.

## Other Outputs

After the prefix of outputs as described above, a Bitcoin Computer transaction can have an arbitrary number of additional outputs. These outputs typically include a change output.
