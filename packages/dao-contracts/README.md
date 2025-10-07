# Bitcoin Computer DAO Contracts

## Overview

Implements a basic Decentralized Autonomous Organization (DAO) using the Bitcoin Computer platform. The DAO enables token-based voting on proposals through smart objects. Tokens represent voting power, and votes are cast in elections. The system ensures decentralized, secure execution on the Bitcoin blockchain, leveraging UTXOs for object state.

## Purpose of the DAO

The DAO allows token holders to participate in governance by voting on proposals (e.g., accept or reject). Each election is an instance of the `Election` class, identified by a unique ID and description. Votes are submitted as `Vote` objects, referencing tokens for weighted voting. The system computes valid accept votes to determine outcomes, supporting multiple elections categorized by module specifiers.

## Classes and Objects

- **Token (from @bitcoin-computer/TBC20)**: Represents fungible tokens with properties like owner public key, amount, and symbol. Supports transfer, which spends the UTXO and creates new ones for sender (remaining) and recipient.

* **Election**: Manages a voting process. Constructor parameters: `voteMod` (module specifier for votes), `description`. Methods:
  - `validVotes()`: Queries votes by `voteMod` using `getTXOs`, filters valid ones based on transaction ancestry to prevent duplicates.
  - `acceptingVotes()`: Computes total token amounts from valid accept votes for the election.

* **Vote**: Represents a vote submission. Computes tokensAmount as sum of token amounts. It is important to note that token revisions are not stored, only counted. Since tokens are input parameters of the function call that executes the vote, the token ownership is verified at that time against the computer object that executes the vote (see test cases for details).

Objects are created via `computer.new(Class, [params], mod)`. Modules are deployed via `computer.deploy(source)`, returning a specifier (e.g., txid:vout). Passing `mod` in object creation embeds it, enabling queries like `getTXOs({ mod })` to retrieve all objects of a category (e.g., votes for an election).

Relations:
_ An `Election` references a `voteMod` to group its `Vote` objects.
_ A `Vote` references an `electionId` and computes amount from tokens. \* Tokens are independent but used in votes for weighting.

## Voting Restrictions

The system enforces the following rules to maintain integrity:

- **No Double-Voting with Same Token in Same Election**: A token cannot be used in multiple votes for the same election. If attempted sequentially, only the first vote is valid (via ancestry filtering on vote transactions).

- **No Voting with Transferred Tokens in Same Election**: If a token is used to vote, neither the remaining amount nor transferred portions can be used again in the same election, even by new owners. This is enforced by checking transaction ancestry of votes.

- **Tokens Usable in Different Elections**: A token (or its descendants) used in one election can be used in another, as different `voteMod` separates queries.

- **Post-Vote Transfers Allowed**: Tokens remain transferable after voting, without affecting prior votes.

- **Category-Based Querying**: Using `mod} in `Vote`creation allows`Election`to query all related votes via  `getTXOs({ mod })`, enabling categorized elections.

## Test Suite

The test suite (in `test/dao-contract.test.ts`) covers all restrictions:

- Single/multiple votes.
- Double-voting detection.
- Transfers and post-transfer voting.
- Different elections via mods.
- Valid vote counting.

## Usage

Start a Bitcoin Computer Node in the package `monorepo/packages/node`. See the [README](../node/README.md) for instructions.

### Run the test

```
npm test
```

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
