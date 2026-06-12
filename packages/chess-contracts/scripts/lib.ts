import { ChessContract } from '../src/chess-contract.js'
import { readFile } from 'fs/promises'
import { Computer } from '@bitcoin-computer/lib'
import pkg from 'typescript'

const { transpileModule, ScriptTarget, ModuleKind } = pkg

/** Keeps deployed module size down when inlining ChessContract. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

export const deploy = async (computer: Computer, path: string) => {
  const chessTS = await readFile(`${path}/src/chess.js`, 'utf-8')
  const compilerOptions = { module: ModuleKind.ESNext, target: ScriptTarget.ES2020 }
  const { outputText: chessJS } = transpileModule(chessTS, { compilerOptions })

  return computer.deploy(`
    ${chessJS}
    export ${stripComments(ChessContract.toString())}
  `)
}
