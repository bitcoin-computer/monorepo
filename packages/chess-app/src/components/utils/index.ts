import { Chess as ChessLib } from "../../contracts/chess"
import { ChessContract } from "../../contracts/chess-contract"

export function currentPlayer(fen: string) {
  const parts = fen.split(" ")
  const activeColor = parts[1]

  if (activeColor === "w") return "White"
  if (activeColor === "b") return "Black"
  throw new Error("Invalid FEN: Unknown active color")
}

export function getWinnerPubKey(chessLibrary: ChessLib, { publicKeyW, publicKeyB }: ChessContract) {
  if (chessLibrary.isCheckmate())
    return chessLibrary.turn() === 'w' ? publicKeyW : publicKeyB
  return null
}

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

export const truncateName = (name: string, maxLength: number = 15) =>
  name.length > maxLength ? name.slice(0, maxLength) + "..." : name
