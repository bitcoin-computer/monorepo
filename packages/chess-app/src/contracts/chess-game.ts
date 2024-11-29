import { Computer } from "@bitcoin-computer/lib"
import { readFile } from "fs/promises"
import { Payment } from "./payment"

export class ChessGame extends Contract {
  amount!: number
  nameW!: string
  nameB!: string
  publicKeyW!: string
  publicKeyB!: string
  secretHashW!: string
  secretHashB!: string
  sans!: string[]
  fen!: string

  constructor(
    amount: number,
    nameW: string,
    nameB: string,
    publicKeyW: string,
    publicKeyB: string,
    secretHashW: string,
    secretHashB: string
  ) {
    super({
      amount,
      nameW,
      nameB,
      publicKeyW,
      publicKeyB,
      secretHashW,
      secretHashB,
      sans: [],
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
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

export class ChessGameHelper {
  computer: Computer
  mod?: string
  amount: number
  publicKeyW: string
  secretHashW: string
  publicKeyB: string
  secretHashB: string
  
  constructor(
    computer: Computer,
    amount: number,
    publicKeyW: string,
    secretHashW: string,
    publicKeyB: string,
    secretHashB: string,
    mod?: string
  ) {
    this.computer = computer
    this.mod = mod
    this.amount = amount
    this.publicKeyW = publicKeyW
    this.secretHashW = secretHashW
    this.publicKeyB = publicKeyB
    this.secretHashB = secretHashB
  }

  async deploy(): Promise<string> {
    const chessFile = await readFile("./src/contracts/chess.mjs", "utf-8")
    this.mod = await this.computer.deploy(`
      ${chessFile}
      ${Payment}
      export ${ChessGame}
    `)
    return this.mod
  }
}
