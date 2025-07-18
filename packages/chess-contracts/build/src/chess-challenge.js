export class ChessChallengeTxWrapper extends Contract {
    constructor(chessGameTxHex, publicKeyB) {
        super({
            _owners: [publicKeyB],
            chessGameTxHex: chessGameTxHex,
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
    async createChessChallengeTxWrapper(chessGameTxHex, publicKeyB, ins) {
        const { tx } = await this.computer.encode({
            exp: `new ChessChallengeTxWrapper(
        "${chessGameTxHex}", "${publicKeyB}"
      )`,
            mod: this.mod,
            exclude: ins,
        });
        return this.computer.broadcast(tx);
    }
}
//# sourceMappingURL=chess-challenge.js.map