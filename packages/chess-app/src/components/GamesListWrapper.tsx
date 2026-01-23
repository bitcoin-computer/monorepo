import { ChessContract, User } from '@bitcoin-computer/chess-contracts'
import { ComputerContext } from '@bitcoin-computer/components'
import { useContext, useEffect, useState } from 'react'
import { VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC } from '../constants/modSpecs'

import { GameType, InfiniteScroll } from './GamesList'

export const GamesListWrapper = ({
  setGameId,
  setUser,
}: {
  setGameId: React.Dispatch<React.SetStateAction<string>>
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}) => {
  const computer = useContext(ComputerContext)
  const [games, setGames] = useState<GameType[]>([])

  const getLatestGames = async () => {
    const availableGames: GameType[] = []
    const gameRevs = await computer.getOUTXOs({
      mod: VITE_CHESS_GAME_MOD_SPEC,
      publicKey: computer.getPublicKey(),
    })

    const gameSyncPromises: Promise<ChessContract>[] = []

    gameRevs.forEach((rev) => {
      gameSyncPromises.push(computer.sync(rev) as Promise<ChessContract>)
    })

    const gamesList = await Promise.all(gameSyncPromises)

    gamesList.forEach((game) => {
      if (game.sans && game.sans.length === 0) {
        availableGames.push({ gameId: game._id, new: true })
      }
    })

    const [userRev] = await computer.getOUTXOs({
      mod: VITE_CHESS_USER_MOD_SPEC,
      publicKey: computer.getPublicKey(),
    })

    if (userRev) {
      const userObj = (await computer.sync(userRev)) as User
      userObj.games.forEach((gameObjId) => {
        availableGames.push({ gameId: gameObjId, new: false })
      })
      setUser(userObj)
    }

    return availableGames
  }
  const refreshGames = async () => {
    const availableGames: GameType[] = await getLatestGames()
    console.log('iavailableGames: ', availableGames)
    setGames(availableGames)
  }

  useEffect(() => {
    // Initial fetch without relying on scroll
    const fetch = async () => {
      const availableGames: GameType[] = await getLatestGames()
      setGames(availableGames)
    }
    fetch()
  }, [])

  return (
    <>
      <InfiniteScroll games={games} refreshGames={refreshGames} setGameId={setGameId} />
    </>
  )
}
