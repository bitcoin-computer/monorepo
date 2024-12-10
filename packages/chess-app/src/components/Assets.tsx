import { VITE_CHESS_GAME_MOD_SPEC } from "../constants/modSpecs"
import { WithPagination } from "./Gallery"

export function MyGames() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All Games</h2>
      <WithPagination mod={VITE_CHESS_GAME_MOD_SPEC} />
    </>
  )
}
