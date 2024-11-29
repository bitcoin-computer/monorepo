import { Computer } from '@bitcoin-computer/lib'
import { ChessGame, ChessGameHelper } from '../src/contracts/chess-game'

export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

describe("ChessGame", () => {
  const computerW = new Computer()
  const computerB = new Computer()
  const computer = new Computer()
  let mod

  beforeAll(async () => {
    await computerW.faucet(1e8)
    await computer.faucet(1e8)
    const chessGameHelper = new ChessGameHelper(computer, 1e8, '', '', '', '', '')
    mod = await chessGameHelper.deploy()
  }, 20000)

  describe("constructor", () => {
    it('Should create a smart object', async () => {
      const chessGame = await computerW.new(ChessGame, [1e8, 'w', 'b', computerW.getPublicKey(), computerB.getPublicKey(), 'secretHashW', 'secretHashB'])
      expect(chessGame).toBeDefined()
      expect(chessGame.fen).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    }, 30000)
  })

  describe('move', () => {
    test('Should perform a move', async () => {
      const chessGame = await computerW.new(ChessGame, [1e8, 'w', 'b', computerW.getPublicKey(), computerB.getPublicKey(), 'secretHashW', 'secretHashB'], mod)
      const fenBefore = chessGame.fen
      await chessGame.move('e4')
      expect(chessGame.fen).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')
      expect(chessGame.fen).not.toEqual(fenBefore)
    }, 30000)
  })
})
