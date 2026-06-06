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
        });
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
        this._owners = [nextOwner];
        if (!this.publicKeyB) {
            this.tokenIdW = token._id;
            this.nameW = name;
            this.publicKeyB = nextOwner;
        }
        else if (!this.publicKeyW) {
            this.tokenIdB = token._id;
            this.nameB = name;
            this.publicKeyW = nextOwner;
        }
        else {
            throw new Error('Game is already fully funded');
        }
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
            // @ts-expect-error Cannot find name 'computer'. Did you mean 'Computer'?
            timestamps.push(await computer.txIdToBlockTime(txId));
            // @ts-expect-error Cannot find name 'computer'. Did you mean 'Computer'?
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
    async createGame(tokenRoot, wagerAmount, timeLimit = 600n) {
        await this.validateUser();
        const { tx, effect } = await this.computer.encode({
            exp: `new ChessContract('${tokenRoot}', ${wagerAmount}n, ${timeLimit}n)`,
            mod: this.mod,
        });
        await this.computer.broadcast(tx);
        return effect.res;
    }
    async depositTokens(chessRev, tokenRev, wagerAmount, name, nextOwner) {
        const { tx, effect } = await this.computer.encode({
            exp: `chess.acceptDeposit(token, ${wagerAmount}n, '${name}', '${nextOwner}')`,
            env: { chess: chessRev, token: tokenRev },
            mod: this.mod,
        });
        await this.computer.broadcast(tx);
        return effect.env.chess;
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
            const [userRev] = await this.computer.getOUTXOs({
                mod: this.userMod,
                publicKey: this.computer.getPublicKey(),
            });
            if (userRev) {
                const userObj = await this.computer.sync(userRev);
                const gameId = chessContract._id;
                if (!userObj.games.includes(gameId)) {
                    await userObj.addGame(gameId);
                }
            }
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