import { ChessContract, Chess as ChessLib } from '@bitcoin-computer/chess-contracts'

export function getGameState(chessContract: ChessContract): string {
  if (!chessContract) return 'In Progress'

  const chessLib = new ChessLib(chessContract.fen)
  if (chessLib.isCheckmate())
    return `${chessLib.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`

  if (chessLib.isDraw() || chessLib.isStalemate() || chessLib.isThreefoldRepetition())
    return 'Game is Draw!'

  if (chessLib.isCheck()) return `${chessLib.turn() === 'w' ? 'White' : 'Black'} is in check!`

  if (chessLib.isInsufficientMaterial()) return 'Insufficient material for checkmate.'

  if (chessLib.isGameOver()) return 'Game over!'

  return 'In Progress'
}
