# Chess Contracts

On-chain chess games with token wagers for Bitcoin Computer.

Players lock equal amounts of a TBC777 token into a `ChessContract` escrow. The
board state (FEN + SAN move list) lives on-chain and is validated by an embedded
copy of chess.js. When the game ends—by checkmate, draw, or resignation—the
contract authorizes the correct payouts. The winner (or both players on a draw)
can then claim their tokens without any further cooperation from the opponent.

The package also provides helper classes for the common flows (create game,
deposit, move, resign, cancel, withdraw), a lightweight user profile contract,
and a challenge wrapper used by the companion chess app.

## Settlement Model

`ChessContract` implements the TBC777 escrow interface. Settlement is written
into the `withdraws` array at the exact moment the game becomes terminal:

- Checkmate or resignation → full pot (2 × wager) authorized to the winner
- Draw / stalemate / threefold / 50-move → each player is authorized their own
  wager

Because TBC777’s `EscrowAuditor` walks the complete revision history of the
escrow, a later claim does not require the losing player to sign or even be
online. The winning move itself is the authorization.

## Important Legal & Risk Notice

This package provides open-source smart-contract tooling that enables two
parties to lock equal amounts of a TBC777 token into a non-custodial escrow and
settle the outcome of an on-chain chess game. BCDB Inc. does not operate, host,
match, or facilitate any games, contests, or wagers. All activity occurs
peer-to-peer on public UTXO blockchains through self-executing contracts.

**Use at your own risk.** Digital-asset smart contracts are experimental. You
can lose the entire wagered amount through user error, contract bugs, network
conditions, or regulatory action.

You are solely responsible for compliance with every law that applies to you,
including:

- state and federal skill-contest / gaming / money-transmission rules,
- U.S. sanctions and OFAC restrictions,
- anti-money-laundering requirements,
- securities laws (including Howey analysis of any token you use as a wager),
  and
- the California Digital Financial Asset Law (DFAL) and any other applicable
  regime.

The contracts are spot-only and skill-based. They are not derivatives, leverage
products, or custodial services. BCDB Inc. provides no custody, no matching
engine, no guarantees of outcome, and no investment advice.

Full patent notice, licensing terms, disclaimers, and liability allocation
appear in [LEGAL.md](./LEGAL.md). Review that file before any mainnet or
production use. This software is provided “AS IS.”

## How It Works

1. **Create** – A player creates a `ChessContract` with a token root, wager
   amount and optional time limit.
2. **Deposit (white)** – The creator deposits their wager. Ownership becomes
   shared so the invited opponent can accept alone (and the creator can still
   cancel alone).
3. **Deposit (black)** – The opponent deposits. Ownership transfers to white
   (first mover) and the game is live.
4. **Play** – Each `move(from, to, promotion)` updates the FEN and SAN list. On
   a terminal position the contract immediately writes the appropriate
   `withdraws` entries.
5. **Resign** – The player to move may call `resign()`, which awards the pot to
   the opponent.
6. **Claim** – The entitled player(s) call `token.withdraw(chessRev)` on their
   TBC777 token. No co-signature from the loser is required.

Pending games that have only one deposit can be cancelled by the creator; the
single deposit is refunded via the same `withdraws` mechanism.

Clocks are computed from the revision history of the contract (block times of
successive states) using the Inner Computer’s `prev` and `txIdToBlockTime` APIs.
Timeouts are currently informational only—they are not enforced by the contract
itself.

## Key Features

- Fully on-chain rules and state (chess.js runs inside the deployed module)
- Atomic settlement: the winning move itself authorizes the payout
- Independent claims – loser cooperation is never required
- Creator can cancel a one-sided (pending) challenge and reclaim the deposit
- Optional per-player time limits derived from on-chain timestamps
- Compatible with any TBC777 token lineage
- Helper classes that hide the low-level `encode` / `encodeCall` boilerplate
- User profile contract that records a player’s game list
- Challenge transaction wrapper for the off-chain invitation UX

## Public Surface

```typescript
class ChessContract extends Contract {
  // Configuration
  wagerAmount: bigint
  timeLimit: bigint
  root: string                    // TBC777 token root

  // Players
  nameW / nameB: string
  publicKeyW / publicKeyB: string
  creatorPublicKey: string
  tokenIdW / tokenIdB: string

  // Board
  fen: string
  sans: string[]

  // Escrow (TBC777 interface)
  deposits: [string, string][]
  withdraws: [string, string, bigint][]
  finalWithdraws: [string, string, bigint][]   // present for interface compliance; currently unused

  // Lifecycle
  acceptDeposit(token, amount, name, nextOwner): Promise<void>
  cancel(): void
  move(from, to, promotion): boolean   // returns true when game over
  resign(): void
  isGameOver(): boolean
  hasTimedOutW / hasTimedOutB(): Promise<boolean>
  calculateTimes(): Promise<{ timeW: bigint; timeB: bigint }>
  setCanceledSeen(): void
}

class ChessContractHelper {
  createGame(tokenRoot, wagerAmount, timeLimit?): Promise<SmartContract>
  depositTokens(chessRev, tokenRev, wagerAmount, name, nextOwner, coSign?): Promise<SmartContract>
  move(chessId, from, to, promotion?): Promise<{ newChessContract; isGameOver }>
  resign(chessId): Promise<SmartContract>
  withdrawTokens(tokenId, chessId): Promise<void>
  cancelGame(chessId): Promise<SmartContract>
  cancelGameAndWithdraw(chessId): Promise<void>
  markCanceledSeen(chessId): Promise<SmartContract>
  // plus query helpers (isGameStarted, canCancel, isCreator, …)
}

class User extends Contract {
  name: string
  games: string[]
  addGame(gameId): void
}

class ChessChallengeTxWrapper extends Contract {
  // Lightweight invitation object owned by the challenged player
  chessRev: string
  wagerAmount: bigint
  tokenRoot: string
  publicKeyW: string
  accepted: boolean
  canceledSeen: boolean
}
```

The chess rules engine itself is exported as `Chess` (and the `Square` type)
from the same package.

## Example

```typescript
import { Computer } from '@bitcoin-computer/lib'
import { ChessContractHelper } from '@bitcoin-computer/chess-contracts'
import { TBC777 } from '@bitcoin-computer/TBC777'

// Assume chessMod and tbc777Mod have already been deployed.
const white = new Computer({
  /* … */
})
const black = new Computer({
  /* … */
})
const helper = ChessContractHelper.fromModSpecs(white, chessMod, undefined, tbc777Mod)

// 1. Create game
const chess = await helper.createGame(tokenRoot, 10n, 600n)

// 2. White deposits
await helper.depositTokens(chess._rev, whiteToken._rev, 10n, 'Alice', black.getPublicKey())

// 3. Black deposits (game becomes live and owned by white)
const blackHelper = ChessContractHelper.fromModSpecs(black, chessMod, undefined, tbc777Mod)
await blackHelper.depositTokens(chess._id, blackToken._rev, 10n, 'Bob', white.getPublicKey())

// 4. Play
const { newChessContract, isGameOver } = await helper.move(chess._id, 'e2', 'e4')
// …

// 5. On a terminal position the contract has already written withdraws.
//    Winner claims independently:
await helper.withdrawTokens(winnerTokenId, chess._id)
```

A complete end-to-end suite (mint → dual deposit → moves → winner claim, cancel
flows, ownership checks, etc.) lives in `test/chess-contract.test.ts`.

## Installation

```sh
git clone https://github.com/bitcoin-computer/monorepo.git
cd monorepo
npm install
```

## Usage

From `packages/chess-contracts`:

```bash
# Copy environment (point at a running Bitcoin Computer node)
cp .env.example .env

# Deploy the chess module, user module, challenge wrapper and a TBC777 token
npm run deploy

# Run the test suite (requires a local node on regtest)
npm test

npm run types
npm run lint
```

`npm run deploy` also offers to write the resulting module IDs into the
companion chess-app `.env` file.

## Documentation

- [Bitcoin Computer documentation](https://docs.bitcoincomputer.io/)
- [TBC777 – programmable escrow token standard](../TBC777) (the token and escrow
  model this package builds on)
- Source: [`src/chess-contract.ts`](./src/chess-contract.ts),
  [`src/chess.ts`](./src/chess.ts)
- Tests: [`test/chess-contract.test.ts`](./test/chess-contract.test.ts)

## Design Notes

- Settlement is written into `withdraws` at the moment the game becomes
  terminal. Because TBC777 audits the full revision history of the escrow, a
  later claim does not require the losing player to sign or even be online.
- The contract never mutates token balances itself; it only authorizes claims.
  The TBC777 `EscrowAuditor` enforces that no more tokens can be withdrawn than
  were validly deposited.
- After a terminal position ownership remains with the player who made the last
  move (the winner). The loser therefore cannot call methods on the contract. A
  future improvement is to record the payout in `finalWithdraws` instead of (or
  in addition to) `withdraws`. Because final claims are taken only from the
  terminal revision, this would make the authorization immutable against any
  subsequent mutations of the contract object (“flipping the board”).
- Time control uses the Inner Computer to walk the prev-chain of the contract
  and sum block-time deltas. This keeps clock logic pure and on-chain without
  external oracles. Timeouts are currently not enforced by the contract; they
  are exposed for client-side use.
- Pending (one-deposit) games are deliberately cancellable only by the creator
  so that an unresponsive opponent cannot lock the first deposit forever.

## Getting Help

Telegram: [t.me/thebitcoincomputer](https://t.me/thebitcoincomputer)  
Twitter: [@TheBitcoinToken](https://twitter.com/TheBitcoinToken)  
Email: clemens@bitcoincomputer.io

## License

MIT License — see [LICENSE.md](./LICENSE.md).

This software includes patented technology (U.S. Patent Nos. 11,188,911 and
11,694,197 and family). The patented technology is currently available under
open terms; mainnet / production use is subject to the technical-dust +
hygiene-service model and the terms in [LEGAL.md](./LEGAL.md). Transactions
created before 2026-06-15 are grandfathered. Contact clemens@bitcoincomputer.io
for alternative licensing.
