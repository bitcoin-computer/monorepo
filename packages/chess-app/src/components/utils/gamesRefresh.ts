export const CHESS_GAMES_UPDATED = 'chess-games-updated'

export function notifyGamesUpdated() {
  window.dispatchEvent(new Event(CHESS_GAMES_UPDATED))
}
