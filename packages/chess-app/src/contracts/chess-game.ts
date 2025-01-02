export class ChessGame extends Contract {
  firstPlayerColor!: string
  sans!: string[]
  firstUserPubKey!: string
  secondUserPubKey!: string
  firstPlayerName!: string
  secondPlayerName!: string
  fen!: string
  constructor(
    color: string,
    firstUserPubKey: string,
    secondUserPubKey: string,
    firstPlayerName: string,
    secondPlayerName: string,
  ) {
    super({
      firstPlayerColor: color.toLocaleLowerCase() === 'black' ? 'b' : 'w',
      sans: [],
      firstUserPubKey: firstUserPubKey,
      secondUserPubKey: secondUserPubKey,
      fen:
        color.toLocaleLowerCase() === 'black'
          ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'
          : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      firstPlayerName: firstPlayerName,
      secondPlayerName: secondPlayerName,
    })
  }

  addFirstPlayer(pubKey: string) {
    this.firstUserPubKey = pubKey
  }

  addSecondPlayer(pubKey: string) {
    this.secondUserPubKey = pubKey
  }

  move(san: string) {
    this.sans.push(san)
    // @ts-expect-error type error
    const game = new Chess(this.fen)
    game.move(san)
    this.fen = game.fen()
    if (this._owners[0] === this.firstUserPubKey) {
      this._owners = [this.secondUserPubKey]
    } else {
      this._owners = [this.firstUserPubKey]
    }
  }

  changeOwner() {
    if (this._owners[0] === this.firstUserPubKey) {
      this._owners = [this.secondUserPubKey]
    } else {
      this._owners = [this.firstUserPubKey]
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
