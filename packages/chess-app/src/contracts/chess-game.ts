export class ChessGame extends Contract {
  sans!: string[]
  publicKeyW!: string
  publicKeyB!: string
  nameW!: string
  nameB!: string
  fen!: string

  constructor(
    publicKeyW: string,
    publicKeyB: string,
    nameW: string,
    nameB: string
  ) {
    super({
      sans: [],
      publicKeyW,
      publicKeyB,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      nameW,
      nameB
    })
  }

  addFirstPlayer(pubKey: string) {
    this.publicKeyW = pubKey
  }

  addSecondPlayer(pubKey: string) {
    this.publicKeyB = pubKey
  }

  move(san: string) {
    this.sans.push(san)
    // @ts-expect-error type error
    const game = new Chess(this.fen)
    game.move(san)
    this.fen = game.fen()
    if (this._owners[0] === this.publicKeyW) {
      this._owners = [this.publicKeyB]
    } else {
      this._owners = [this.publicKeyW]
    }
  }

  changeOwner() {
    if (this._owners[0] === this.publicKeyW) {
      this._owners = [this.publicKeyB]
    } else {
      this._owners = [this.publicKeyW]
    }
  }

  isGameOver() {
    // @ts-expect-error type error
    return new Chess(this.fen).isGameOver()
  }

  getSans() {
    return this.sans
  }

  getFen() {
    return this.fen
  }
}
