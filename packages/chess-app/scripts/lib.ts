import { ChessGame, Payment } from "../src/contracts/chess-game.js"
import { readFile } from "fs/promises"
import { Computer } from "@bitcoin-computer/lib"

export const deploy = async (computer: Computer) => {
  const chessFile = await readFile("./src/contracts/chess.mjs", "utf-8")
  const mod = await computer.deploy(`
    ${chessFile}
    export ${Payment}
    export ${ChessGame}
  `)
  return mod
}
