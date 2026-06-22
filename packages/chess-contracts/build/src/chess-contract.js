import { Contract } from '@bitcoin-computer/lib';
export class ChessContract extends Contract {
    constructor(root, wagerAmount, timeLimit) {
        super({
            wagerAmount,
            timeLimit,
            nameW: '',
            nameB: '',
            publicKeyW: '',
            publicKeyB: '',
            sans: [],
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            deposits: [],
            withdraws: [],
            finalWithdraws: [],
            root,
            tokenIdW: '',
            tokenIdB: '',
            creatorPublicKey: '',
            canceledSeen: false,
        });
    }
    setCanceledSeen() {
        this.canceledSeen = true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async acceptDeposit(token, amount, name, nextOwner) {
        if (amount !== this.wagerAmount)
            throw new Error('Deposit amount must match wager');
        const tokenRoot = token.root ?? token._root;
        if (tokenRoot !== this.root)
            throw new Error('Token root does not match wager');
        token.deposit(this._id, amount);
        this.deposits.push(token.depositTuple);
        const tokenOwner = Array.isArray(token._owners) ? token._owners[0] : token._owners;
        if (!this.publicKeyB) {
            const gameOwner = Array.isArray(this._owners) ? this._owners[0] : this._owners;
            if (tokenOwner !== gameOwner) {
                throw new Error('Deposit token must belong to the game creator');
            }
            this.creatorPublicKey = gameOwner;
            this.tokenIdW = token._id;
            this.nameW = name;
            this.publicKeyB = nextOwner;
            // Both players can sign while the game is pending: black accepts alone,
            // white can cancel alone. Do not set withdraws here — TBC777 sums every
            // historical withdraw entry, so a pending refund must be authorized in cancel().
            this._owners = [gameOwner, nextOwner];
        }
        else if (!this.publicKeyW) {
            if (this.withdraws.length > 0) {
                throw new Error('Game was canceled');
            }
            if (tokenOwner !== this.publicKeyB) {
                throw new Error('Only the invited opponent can accept the game');
            }
            if (nextOwner !== this.creatorPublicKey) {
                throw new Error('Opponent must set the creator as the white player');
            }
            this.withdraws = [];
            this.finalWithdraws = [];
            this.tokenIdB = token._id;
            this.nameB = name;
            this.publicKeyW = nextOwner;
            this._owners = [nextOwner];
        }
        else {
            throw new Error('Game is already fully funded');
        }
    }
    /**
     * Cancel a pending game before the opponent deposits. Refunds are authorized
     * via `withdraws` set in this method; the creator then claims with `withdrawTokens`.
     */
    cancel() {
        if (this.publicKeyW)
            throw new Error('Game started use resign to forfeit');
        if (this.deposits.length !== 1)
            throw new Error('Cannot cancel: invalid deposit state');
        if (!this.tokenIdW)
            throw new Error('Cannot cancel: no deposit to refund');
        if (!this.creatorPublicKey)
            throw new Error('Cannot cancel: creator not set');
        if (this.withdraws.length === 0) {
            this.withdraws = [[this.root, this.tokenIdW, this.wagerAmount]];
        }
        this.canceledSeen = true;
    }
    move(from, to, promotion) {
        if (!this.publicKeyB || !this.publicKeyW)
            throw new Error('Game not yet fully funded');
        // @ts-expect-error Chess is available in the deployed module scope
        const chessLib = new Chess(this.fen);
        const moveArg = { from, to };
        if (promotion)
            moveArg.promotion = promotion;
        const { san } = chessLib.move(moveArg);
        this.sans.push(san);
        this.fen = chessLib.fen();
        if (chessLib.isGameOver()) {
            // Settle the pot atomically with the winning move so the winner does not
            // need a separate "claim" transaction before they can withdraw.
            if (chessLib.isCheckmate()) {
                // The player who just moved is the winner.
                const winnerId = this._owners[0] === this.publicKeyW ? this.tokenIdW : this.tokenIdB;
                this.withdraws = [[this.root, winnerId, 2n * this.wagerAmount]];
            }
            else {
                // Draw / stalemate / threefold / 50-move rule: each side gets its wager back.
                this.withdraws = [
                    [this.root, this.tokenIdW, this.wagerAmount],
                    [this.root, this.tokenIdB, this.wagerAmount],
                ];
            }
        }
        else {
            this._owners = [this._owners[0] === this.publicKeyW ? this.publicKeyB : this.publicKeyW];
        }
        return chessLib.isGameOver();
    }
    resign() {
        if (!this.publicKeyW || !this.publicKeyB) {
            throw new Error('Game not yet started');
        }
        const winnerId = this._owners[0] === this.publicKeyW ? this.tokenIdB : this.tokenIdW;
        this.withdraws = [[this.root, winnerId, 2n * this.wagerAmount]];
    }
    isGameOver() {
        // @ts-expect-error Chess is available in the deployed module scope
        return new Chess(this.fen).isGameOver();
    }
    async hasTimedOutW() {
        const { timeW } = await this.calculateTimes();
        return timeW > this.timeLimit;
    }
    async hasTimedOutB() {
        const { timeB } = await this.calculateTimes();
        return timeB > this.timeLimit;
    }
    /**
     * Calculates white time (timeW) and black time (timeB) from a list of timestamps.
     * timeW = (t2 - t1) + (t4 - t3) + (t6 - t5) + ...
     * timeB = (t3 - t2) + (t5 - t4) + (t7 - t6) + ...
     *
     * Note: timeW + timeB will equal (tn - t1).
     */
    async calculateTimes() {
        let current = this._rev;
        const timestamps = [];
        // Collect every historical state. Deposits and withdrawals accumulate
        // across the entire lifetime of the escrow, so the audit must see them all.
        while (true) {
            const txId = current.split(':')[0];
            timestamps.push(await computer.txIdToBlockTime(txId));
            const previous = await computer.prev(current);
            if (!previous)
                break;
            current = previous;
        }
        if (timestamps.length < 2)
            return { timeW: 0n, timeB: 0n };
        let timeW = 0n;
        let timeB = 0n;
        // Start from the first move (index 0)
        for (let i = 1; i < timestamps.length; i++) {
            const diff = timestamps[i] - timestamps[i - 1];
            if (i % 2 === 1) {
                // Odd indices (1, 3, 5, ...): White's moves
                timeW += diff;
            }
            else {
                // Even indices (2, 4, 6, ...): Black's moves
                timeB += diff;
            }
        }
        return { timeW, timeB };
    }
}
export class ChessContractHelper {
    constructor({ computer, mod, userMod, tokenMod, }) {
        this.computer = computer;
        this.mod = mod;
        this.userMod = userMod;
        this.tokenMod = tokenMod;
    }
    static fromModSpecs(computer, mod, userMod, tokenMod) {
        return new this({ computer, mod, userMod, tokenMod });
    }
    async validateUser() {
        const [userRev] = await this.computer.getOUTXOs({
            mod: this.userMod,
            publicKey: this.computer.getPublicKey(),
        });
        if (!userRev) {
            throw new Error('Please create your account to start playing');
        }
    }
    async addGameToUserIfNeeded(gameId) {
        if (!this.userMod || !gameId)
            return;
        const [userRev] = await this.computer.getOUTXOs({
            mod: this.userMod,
            publicKey: this.computer.getPublicKey(),
        });
        if (!userRev)
            return;
        const userObj = await this.computer.sync(userRev);
        if (userObj.games.includes(gameId))
            return;
        const latestUserRev = await this.computer.latest(userObj._id);
        const latestUser = await this.computer.sync(latestUserRev);
        if (latestUser.games.includes(gameId))
            return;
        const { tx } = await this.computer.encodeCall({
            target: latestUser,
            property: 'addGame',
            args: [gameId],
            mod: this.userMod,
        });
        if (!tx)
            throw new Error('Failed to record game on user profile');
        await this.computer.broadcast(tx);
    }
    async createGame(tokenRoot, wagerAmount, timeLimit = 600n) {
        await this.validateUser();
        const { tx, effect } = await this.computer.encode({
            exp: `new ChessContract('${tokenRoot}', ${wagerAmount}n, ${timeLimit}n)`,
            mod: this.mod,
        });
        await this.computer.broadcast(tx);
        return effect.res;
    }
    /**
     * Deposits wager tokens into a chess game. After the creator's first deposit
     * the invited opponent owns the contract and can accept without a co-sign.
     */
    async depositTokens(chessRev, tokenRev, wagerAmount, name, nextOwner, coSignComputer) {
        const { tx, effect } = await this.computer.encode({
            exp: `chess.acceptDeposit(token, ${wagerAmount}n, '${name}', '${nextOwner}')`,
            env: { chess: chessRev, token: tokenRev },
            mod: this.mod,
        });
        if (coSignComputer) {
            await coSignComputer.sign(tx);
        }
        await this.computer.broadcast(tx);
        const chess = effect.env.chess;
        const gameId = chess._id ?? chess._root;
        await this.addGameToUserIfNeeded(gameId);
        return chess;
    }
    async findToken(tokenRoot, minAmount) {
        const tokenRevs = await this.computer.getOUTXOs({
            mod: this.tokenMod,
            publicKey: this.computer.getPublicKey(),
        });
        for (const rev of tokenRevs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const token = (await this.computer.sync(rev));
            if (token._root === tokenRoot && token.amount >= minAmount) {
                return token;
            }
        }
        return null;
    }
    async move(chessContract, from, to, promotion) {
        if (chessContract && chessContract.sans.length < 2) {
            await this.addGameToUserIfNeeded(chessContract._id);
        }
        const { tx, effect } = (await this.computer.encodeCall({
            target: chessContract,
            property: 'move',
            args: [from, to, promotion],
            mod: this.mod,
        }));
        await this.computer.broadcast(tx);
        const { res: isGameOver, env } = effect;
        const { __bc__: newChessContract } = env;
        return { newChessContract, isGameOver };
    }
    async withdrawTokens(tokenId, chessId) {
        const latestTokenRev = await this.computer.latest(tokenId);
        const latestChessRev = await this.computer.latest(chessId);
        if (!this.tokenMod) {
            throw new Error('tokenMod is required for TBC777 withdraw');
        }
        const { tx } = await this.computer.encode({
            exp: `token.withdraw('${latestChessRev}')`,
            env: { token: latestTokenRev },
            mod: this.tokenMod,
        });
        await this.computer.broadcast(tx);
    }
    /**
     * Finds any token owned by the current user with at least minAmount balance.
     * Used when creating a new game to auto-detect which token to wager.
     */
    async findAnyToken(minAmount) {
        const tokenRevs = await this.computer.getOUTXOs({
            mod: this.tokenMod,
            publicKey: this.computer.getPublicKey(),
        });
        for (const rev of tokenRevs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const token = (await this.computer.sync(rev));
            if (token.amount >= minAmount) {
                return token;
            }
        }
        return null;
    }
    /** True when both players have deposited and the game is playable. */
    isGameStarted(chess) {
        return !!chess.publicKeyW && !!chess.publicKeyB;
    }
    /** True when the creator canceled before the opponent deposited (refund claimed). */
    async isPendingGameCanceled(chess) {
        if (chess.publicKeyW || !chess.tokenIdW || chess.deposits.length !== 1)
            return false;
        try {
            const latestChessRev = await this.computer.latest(chess._id);
            const latestTokenRev = await this.computer.latest(chess.tokenIdW);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const token = (await this.computer.sync(latestTokenRev));
            const withdrawn = token.withdrawn ?? [];
            return withdrawn.includes(latestChessRev);
        }
        catch {
            return false;
        }
    }
    /** True when waiting for the opponent's deposit (creator may cancel). */
    canCancel(chess) {
        return (!!chess.creatorPublicKey &&
            !!chess.publicKeyB &&
            !chess.publicKeyW &&
            chess.deposits.length === 1 &&
            chess.withdraws.length === 0 &&
            chess.finalWithdraws.length === 0);
    }
    isCreator(chess) {
        return chess.creatorPublicKey === this.computer.getPublicKey();
    }
    /**
     * Cancel a pending game before the opponent deposits. Sets `withdraws` on-chain
     * so the creator can claim their deposit with `withdrawTokens`.
     */
    async cancelGame(chessId) {
        const latestRev = await this.computer.latest(chessId);
        const chess = await this.computer.sync(latestRev);
        if (!this.canCancel(chess)) {
            throw new Error('Cannot cancel: game is not in a cancelable state');
        }
        if (!this.isCreator(chess)) {
            throw new Error('Cannot cancel: only the game creator can cancel');
        }
        if (await this.isPendingGameCanceled(chess)) {
            throw new Error('Cannot cancel: wager already refunded');
        }
        const { tx, effect } = await this.computer.encodeCall({
            target: chess,
            property: 'cancel',
            args: [],
            mod: this.mod,
        });
        await this.computer.broadcast(tx);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return effect.env.__bc__;
    }
    /** Cancel a pending game and withdraw the creator's wager in one flow. */
    async cancelGameAndWithdraw(chessId) {
        const chess = await this.cancelGame(chessId);
        await this.withdrawTokens(chess.tokenIdW, chessId);
    }
    /** Mark a canceled pending game as seen by the invited opponent (clears list badge). */
    async markCanceledSeen(chessId) {
        const latestRev = await this.computer.latest(chessId);
        const chess = await this.computer.sync(latestRev);
        if (chess.canceledSeen)
            return chess;
        if (chess.publicKeyB !== this.computer.getPublicKey()) {
            throw new Error('Only the invited opponent can acknowledge a canceled game');
        }
        const { tx, effect } = await this.computer.encodeCall({
            target: chess,
            property: 'setCanceledSeen',
            args: [],
            mod: this.mod,
        });
        await this.computer.broadcast(tx);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return effect.env.__bc__;
    }
    /**
     * Resigns from the current game. Sets the withdraws array so the opponent
     * (winner) can call withdrawTokens. Can only be called by the current
     * contract owner (the player whose turn it is).
     */
    async resign(chessId) {
        const latestRev = await this.computer.latest(chessId);
        const chess = await this.computer.sync(latestRev);
        const { tx, effect } = await this.computer.encodeCall({
            target: chess,
            property: 'resign',
            args: [],
            mod: this.mod,
        });
        await this.computer.broadcast(tx);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return effect.env.__bc__;
    }
}
//# sourceMappingURL=chess-contract.js.map