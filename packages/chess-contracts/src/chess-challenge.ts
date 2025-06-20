import { Computer } from '@bitcoin-computer/lib'

export class ChessChallengeTxWrapper extends Contract {
  chessGameTxHex!: string
  accepted!: boolean
  constructor(chessGameTxHex: string, publicKeyB: string) {
    super({
      _owners: [publicKeyB],
      chessGameTxHex: chessGameTxHex,
      accepted: false,
    })
  }

  setAccepted() {
    this.accepted = true
  }
}

export class ChessChallengeTxWrapperHelper {
  computer: Computer
  mod?: string

  constructor({ computer, mod }: { computer: Computer; mod?: string }) {
    this.computer = computer
    this.mod = mod
  }

  async createChessChallengeTxWrapper(chessGameTxHex: string, publicKeyB: string): Promise<string> {
    const { tx } = await this.computer.encode({
      exp: `new ChessChallengeTxWrapper(
        "${chessGameTxHex}", "${publicKeyB}"
      )`,
      mod: this.mod,
    })
    return this.computer.broadcast(tx)
  }
}
