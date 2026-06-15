import { ChessContract, Chess as ChessLib } from '@bitcoin-computer/chess-contracts'
import { Computer, SmartContract } from '@bitcoin-computer/lib'

export async function isCreatorRefunded(
  computer: Computer,
  chess: SmartContract<typeof ChessContract>,
): Promise<boolean> {
  if (chess.publicKeyW || !chess.tokenIdW || chess.deposits.length !== 1) return false
  try {
    const latestChessRev = await computer.latest(chess._id)
    const latestTokenRev = await computer.latest(chess.tokenIdW)
    const token = (await computer.sync(latestTokenRev)) as { withdrawn?: string[] }
    return (token.withdrawn ?? []).includes(latestChessRev)
  } catch {
    return false
  }
}

export function isFullyFunded(chessContract: SmartContract<typeof ChessContract>): boolean {
  return !!chessContract.publicKeyW && !!chessContract.publicKeyB
}

export function isGamePlayable(chessContract: SmartContract<typeof ChessContract>): boolean {
  if (chessContract.withdraws.length > 0) return false
  if (!isFullyFunded(chessContract)) return true
  return !new ChessLib(chessContract.fen).isGameOver()
}

export function isMyActiveTurn(
  chessContract: SmartContract<typeof ChessContract>,
  pubKey: string,
): boolean {
  if (!isGamePlayable(chessContract)) return false
  return chessContract._owners[0] === pubKey
}

export function getGameState(chessContract: SmartContract<typeof ChessContract>): string {
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
