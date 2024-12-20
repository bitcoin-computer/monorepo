import type { Chess as ChessLib } from "../../../../chess-contracts/"

export function getGameState(chessLib: ChessLib): string {
  if (chessLib.isCheckmate())
    return `${chessLib.turn() === "w" ? "Black" : "White"} wins by checkmate!`

  if (
    chessLib.isDraw() ||
    chessLib.isStalemate() ||
    chessLib.isThreefoldRepetition()
  )
    return "Game is Draw!"

  if (chessLib.isCheck())
    return `${chessLib.turn() === "w" ? "White" : "Black"} is in check!`

  if (chessLib.isInsufficientMaterial())
    return "Insufficient material for checkmate."

  if (chessLib.isGameOver())
    return "Game over!"

  return "In Progress"
}