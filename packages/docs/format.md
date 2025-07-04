---
order: -36
icon: note
---

# Tx Format

The outputs of a Bitcoin Computer transaction are partitioned as follows:

## Outputs Containing Objects

The first number of outputs represent on-chain objects. Their amounts and scripts are determined by the `_satoshis` and `_owners` property of the corresponding on-chain objects. These outputs can only be spent by their owners and they are spent when the corresponding on-chain object is updated.

## Outputs Containing Metadata

Next is a sequence of outputs encoding the metadata - for example a JavaScript expressions or the code of a module. These outputs use bare multisig scripts so that the data (not just their hash) and their signature is stored on chain. These outputs contain a minimal non-dust amount of satoshi that is owned by the company developing the Bitcoin Computer protocol.

## Other Outputs

After the prefix of outputs as described above, a Bitcoin Computer transaction can have an arbitrary number of additional outputs. These outputs typically include a change output.
