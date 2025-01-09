import { VITE_CHESS_GAME_MOD_SPEC } from '../constants/modSpecs'
import { Gallery } from './Gallery'

export function MyGames() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All Games</h2>
      <Gallery.WithPagination mod={VITE_CHESS_GAME_MOD_SPEC} />
    </>
  )
}
