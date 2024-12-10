import { ChessGame, Payment } from "../src/contracts/chess-game.js"
import { readFile } from "fs/promises"

export const deploy = async (computer: { deploy: (module: string) => string }) => {
  const chessFile = await readFile("./src/contracts/chess.mjs", "utf-8")
  const mod = await computer.deploy(`
    ${chessFile}
    export ${Payment}
    export ${ChessGame}
  `)
  return mod
}