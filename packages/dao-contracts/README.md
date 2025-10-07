# Bitcoin Computer DAO Contracts

## Overview

Implements a basic Decentralized Autonomous Organization (DAO) using the Bitcoin Computer platform. The DAO enables token-based voting on proposals through smart objects. Tokens represent voting power, and votes are cast in elections. The system ensures decentralized, secure execution on the Bitcoin blockchain, leveraging UTXOs for object state.

## Purpose of the DAO

The DAO allows token holders to participate in governance by voting on proposals (e.g., accept or reject). Each election is an instance of the `Election` class, identified by a unique ID, an associated token root and description. Votes are submitted as `Vote` objects, referencing tokens for weighted voting. The system computes totals for accepted and rejected votes based on valid submissions, filtering out duplicates and invalid uses via transaction ancestry. Multiple elections can be categorized by different module specifiers, and voting is restricted to tokens descending from the specified root token.

## Classes and Objects

- **Token (from @bitcoin-computer/TBC20)**: Represents fungible tokens with properties like owner public key, amount, and symbol. Supports transfer, which spends the UTXO and creates new ones for sender (remaining) and recipient. Descendant tokens share the same \_root property, which is the original creation revision (txid:vout) of the token lineage.

* **Election**: Manages a voting process. Constructor parameters: `proposalMod` (module specifier for the code being voted in the DAO), `description`. Methods:
  - `proposalVotes()`: Retrieves transaction IDs of valid votes by querying TXOs with `getTXOs({ mod: this.proposalMod })`, then filters for uniqueness using ancestry to eliminate duplicates or conflicting votes.
  - `validVotes()`: Resolves valid vote objects from `proposalVotes()`, filtering those matching the election's `_id` and `tokenRoot`.
  - `accepted()`: Computes the total token amount from valid accept votes.
  - `rejected()`: Computes the total token amount from valid reject votes.

* **Vote**: Represents a vote submission. Computes `tokensAmount` as sum, stores `tokenRoot` from the first token, and verifies all tokens share the same `_root` (throws error if not).

Objects are created via `computer.new(Class, [params], mod)`. Modules are deployed via `computer.deploy(source)`, returning a specifier (e.g., `txid:vout`). Passing `mod` in object creation embeds it, enabling queries like `getTXOs({ mod })` to retrieve all objects of a category (e.g., votes for an election).

Relations:
\_ An `Election` references a `proposalMod` to group its `Vote` objects and a `tokenRoot` to specify eligible token lineages.

\_ A `Vote` references an `electionId` and computes amount from `tokens`.
\_ Tokens are independent but used in votes for weighting, with eligibility checked via `_root`.

## Voting Restrictions

The system enforces the following rules to maintain integrity:

- **No Double-Voting with Same Token in Same Election**: A token cannot be used in multiple votes for the same election. If attempted sequentially, only the first vote is valid (via ancestry filtering on vote transactions).

- **No Voting with Transferred Tokens in Same Election**: If a token is used to vote, neither the remaining amount nor transferred portions can be used again in the same election, even by new owners. This is enforced by checking transaction ancestry of votes.

- **Tokens Usable in Different Elections**: A token (or its descendants) used in one election can be used in another, as different `proposalMod` separates queries.

- **Post-Vote Transfers Allowed**: Tokens remain transferable after voting, without affecting prior votes.

- **Category-Based Querying**: Using `mod in `Vote`creation allows`Election`to query all related votes via  `getTXOs({ mod })`, enabling categorized elections.

- **Token Lineage Restriction**: Votes must use tokens sharing the same `_root` as specified in the `Election`. Multiple tokens per vote are allowed if they share the same `_root`.

## Test Suite

The test suite (in `test/dao-contract.test.ts`) covers all restrictions:

- Single/multiple votes.
- Double-voting detection.
- Transfers and post-transfer voting.
- Different elections via mods.
- Valid vote counting.
- Multiple tokens from same root.
- Non-owned token attempts.

## Usage

Start a Bitcoin Computer Node in the package `monorepo/packages/node`. See the [README](../node/README.md) for instructions.

### Run the test

```
npm test
```

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
