import { Chess } from "../../contracts/chess"
import { ChessGame } from "../../contracts/chess-contract"

export function currentPlayer(fen: string) {
  const parts = fen.split(" ")
  const activeColor = parts[1]

  if (activeColor === "w") {
    return "White"
  }
  if (activeColor === "b") {
    return "Black"
  }
  throw new Error("Invalid FEN: Unknown active color")
}

export function getWinnerPubKey(chessInstance: Chess, cc: ChessGame) {
  if (!chessInstance || !cc) {
    return null
  }
  if (chessInstance.isCheckmate()) {
    return chessInstance.turn() === 'w' ? cc.publicKeyW : cc.publicKeyB
  }
  return null
}

export function getGameState(chessInstance: Chess): string {
  if (chessInstance.isCheckmate()) {
    return `${chessInstance.turn() === "w" ? "Black" : "White"} wins by checkmate!`
  }
  if (
    chessInstance.isDraw() ||
    chessInstance.isStalemate() ||
    chessInstance.isThreefoldRepetition()
  ) {
    return "Game is Draw!"
  }
  if (chessInstance.isCheck()) {
    return `${chessInstance.turn() === "w" ? "White" : "Black"} is in check!`
  }
  if (chessInstance.isInsufficientMaterial()) {
    return "Insufficient material for checkmate."
  }
  if (chessInstance.isGameOver()) {
    return "Game over!"
  }
  return "In Progress"
}

export const truncateName = (name: string, maxLength: number = 15) =>
  name.length > maxLength ? name.slice(0, maxLength) + "..." : name
