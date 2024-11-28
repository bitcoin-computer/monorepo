import { Computer } from '@bitcoin-computer/lib'
import { ChessGame } from '../src/contracts/chess-game'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

describe("ChessGame", () => {
  const white = new Computer()
  const black = new Computer()
  const computer = new Computer()
  let mod

  beforeAll(async () => {
    await white.faucet(1e8)
    await computer.faucet(1e8)
    fs.readFile("./src/contracts/chess.mjs", "utf-8", async (err, chessFile) => {
      if (err) {
        console.error("Error reading file:", err)
        return
      }
      mod = await computer.deploy(`${chessFile}\nexport ${ChessGame}`)
    })
  })

  describe("constructor", () => {
    it('Should create a smart object', async () => {
      const chessGame = await white.new(ChessGame, [white.getPublicKey(), black.getPublicKey(), 'w', 'b'])
      expect(chessGame).toBeDefined()
      expect(chessGame.fen).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    }, 30000)
  })

  describe('move', () => {
    test('Should perform a move', async () => {
      const chessGame = await white.new(ChessGame, [white.getPublicKey(), black.getPublicKey(), 'w', 'b'], mod)
      const fenBefore = chessGame.fen
      await chessGame.move('e4')
      expect(chessGame.fen).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')
      expect(chessGame.fen).not.toEqual(fenBefore)
    }, 30000)
  })
})
