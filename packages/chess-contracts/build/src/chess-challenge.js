export class ChessChallengeTxWrapper extends Contract {
    constructor(chessRev, wagerAmount, tokenRoot, publicKeyW, publicKeyB) {
        super({
            _owners: [publicKeyB],
            chessRev,
            wagerAmount,
            tokenRoot,
            publicKeyW,
            accepted: false,
        });
    }
    setAccepted() {
        this.accepted = true;
    }
}
export class ChessChallengeTxWrapperHelper {
    constructor({ computer, mod }) {
        this.computer = computer;
        this.mod = mod;
    }
    async createChessChallengeTxWrapper(chessRev, wagerAmount, tokenRoot, publicKeyW, publicKeyB) {
        const { tx } = await this.computer.encode({
            exp: `new ChessChallengeTxWrapper("${chessRev}", ${wagerAmount}n, "${tokenRoot}", "${publicKeyW}", "${publicKeyB}")`,
            mod: this.mod,
        });
        if (!tx)
            throw new Error('Could not create ChessChallengeTxWrapper');
        return this.computer.broadcast(tx);
    }
}
//# sourceMappingURL=chess-challenge.js.map