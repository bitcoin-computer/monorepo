import { Computer } from '@bitcoin-computer/lib'

export class ChessChallengeTxWrapper extends Contract {
  chessRev!: string
  wagerAmount!: bigint
  tokenRoot!: string
  publicKeyW!: string
  accepted!: boolean

  constructor(
    chessRev: string,
    wagerAmount: bigint,
    tokenRoot: string,
    publicKeyW: string,
    publicKeyB: string,
  ) {
    super({
      _owners: [publicKeyB],
      chessRev,
      wagerAmount,
      tokenRoot,
      publicKeyW,
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

  async createChessChallengeTxWrapper(
    chessRev: string,
    wagerAmount: bigint,
    tokenRoot: string,
    publicKeyW: string,
    publicKeyB: string,
  ): Promise<string> {
    const { tx } = await this.computer.encode({
      exp: `new ChessChallengeTxWrapper("${chessRev}", ${wagerAmount}n, "${tokenRoot}", "${publicKeyW}", "${publicKeyB}")`,
      mod: this.mod,
    })
    if (!tx) throw new Error('Could not create ChessChallengeTxWrapper')
    return this.computer.broadcast(tx)
  }
}
