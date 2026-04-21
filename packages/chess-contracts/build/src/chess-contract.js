export class ChessContract extends Contract {
    constructor(root, wagerAmount) {
        super({
            wagerAmount,
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
        token.deposit(this._id, amount);
        this.deposits.push([token._root, token._rev]);
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
        if (!chessLib.isGameOver()) {
            if (this._owners[0] === this.publicKeyW) {
                this._owners = [this.publicKeyB];
            }
            else {
                this._owners = [this.publicKeyW];
            }
        }
        else if (chessLib.isCheckmate()) {
            const totalWager = this.wagerAmount * 2n;
            const winnerId = this._owners[0] === this.publicKeyW ? this.tokenIdW : this.tokenIdB;
            this.withdraws = [[this.root, winnerId, totalWager]];
        }
        return chessLib.isGameOver();
    }
    isGameOver() {
        // @ts-expect-error Chess is available in the deployed module scope
        return new Chess(this.fen).isGameOver();
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
    async createGame(tokenRoot, wagerAmount) {
        await this.validateUser();
        const { tx, effect } = await this.computer.encode({
            exp: `new ChessContract('${tokenRoot}', ${wagerAmount}n)`,
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
        const token = await this.computer.sync(latestTokenRev);
        const latestChessRev = await this.computer.latest(chessId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await token.withdraw(latestChessRev);
    }
}
//# sourceMappingURL=chess-contract.js.map