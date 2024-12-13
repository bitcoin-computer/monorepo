import { ChessContract, Payment } from "../src/contracts/chess-contract.js"
import { readFile } from "fs/promises"
import { Computer } from "@bitcoin-computer/lib"
import { transpileModule, ScriptTarget, ModuleKind } from 'typescript'

export const deploy = async (computer: Computer) => {
  const chessTS = await readFile("./src/contracts/chess.ts", "utf-8")

  const compilerOptions = { module: ModuleKind.ESNext, target: ScriptTarget.ES2020 }
  const { outputText: chessJS } = transpileModule(chessTS, { compilerOptions })

  const mod = await computer.deploy(`
    ${chessJS}
    export ${Payment}
    export ${ChessContract}
  `)
  return mod
}
