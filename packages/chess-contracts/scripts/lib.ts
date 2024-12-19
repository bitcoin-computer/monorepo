import { ChessContract, Payment } from "../src/chess-contract.js"
import { readFile } from "fs/promises"
import { Computer } from "@bitcoin-computer/lib"
import pkg from 'typescript'

const { transpileModule, ScriptTarget, ModuleKind }  = pkg

export const deploy = async (computer: Computer) => {
  const chessTS = await readFile("./src/chess.ts", "utf-8")
  const compilerOptions = { module: ModuleKind.ESNext, target: ScriptTarget.ES2020 }
  const { outputText: chessJS } = transpileModule(chessTS, { compilerOptions })

  return computer.deploy(`
    ${chessJS}
    export ${Payment}
    export ${ChessContract}
  `)
}
