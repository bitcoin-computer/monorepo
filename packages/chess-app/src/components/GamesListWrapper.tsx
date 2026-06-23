import { ChessContract, User } from '@bitcoin-computer/chess-contracts'
import { ComputerContext } from '@bitcoin-computer/components'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC } from '../constants/modSpecs'

import { GameType, InfiniteScroll } from './GamesList'
import { CHESS_GAMES_UPDATED } from './utils/gamesRefresh'
import { isFullyFunded, isMyActiveTurn } from './utils'

type GameListsContextValue = {
  activeTurns: GameType[]
  myGames: GameType[]
  refreshGames: () => Promise<void>
}

const GameListsContext = createContext<GameListsContextValue | null>(null)

function useGameListsContext() {
  const value = useContext(GameListsContext)
  if (!value) {
    throw new Error('Game list components must be used within GameListsProvider')
  }
  return value
}

export function GameListsProvider({
  children,
  setUser,
}: {
  children: ReactNode
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}) {
  const computer = useContext(ComputerContext)
  const [activeTurns, setActiveTurns] = useState<GameType[]>([])
  const [myGames, setMyGames] = useState<GameType[]>([])

  const getLatestGames = async () => {
    const activeTurnGames: GameType[] = []
    const userGames: GameType[] = []

    const gameRevs = await computer.getOUTXOs({
      mod: VITE_CHESS_GAME_MOD_SPEC,
      publicKey: computer.getPublicKey(),
    })

    const gamesList = await Promise.all(
      gameRevs.map((rev) => computer.sync<typeof ChessContract>(rev)),
    )

    const myPubKey = computer.getPublicKey()

    gamesList.forEach((game) => {
      if (isMyActiveTurn(game, myPubKey)) {
        const isPending = !isFullyFunded(game)
        activeTurnGames.push({
          gameId: game._id,
          new: isPending && !game.canceledSeen,
        })
      }
    })

    const [userRev] = await computer.getOUTXOs({
      mod: VITE_CHESS_USER_MOD_SPEC,
      publicKey: computer.getPublicKey(),
    })

    if (userRev) {
      const userObj = await computer.sync<typeof User>(userRev)
      const latestUserRev = await computer.latest(userObj._id)
      const latestUser = await computer.sync<typeof User>(latestUserRev)
      latestUser.games.forEach((gameObjId) => {
        userGames.push({ gameId: gameObjId, new: false })
      })
      setUser(latestUser)
    }

    return { activeTurnGames, userGames }
  }

  const refreshGames = async () => {
    const { activeTurnGames, userGames } = await getLatestGames()
    setActiveTurns(activeTurnGames)
    setMyGames(userGames)
  }

  useEffect(() => {
    refreshGames()
  }, [])

  useEffect(() => {
    const onGamesUpdated = () => {
      refreshGames()
    }
    window.addEventListener(CHESS_GAMES_UPDATED, onGamesUpdated)
    return () => window.removeEventListener(CHESS_GAMES_UPDATED, onGamesUpdated)
  }, [])

  useEffect(() => {
    let unsubscribeGame: (() => void) | undefined
    let unsubscribeUser: (() => void) | undefined

    const subscribe = async () => {
      unsubscribeGame = await computer.streamTXOs(
        { mod: VITE_CHESS_GAME_MOD_SPEC, publicKey: computer.getPublicKey() },
        () => {
          refreshGames()
        },
        (err) => console.error('Game stream error:', err),
      )
      unsubscribeUser = await computer.streamTXOs(
        { mod: VITE_CHESS_USER_MOD_SPEC, publicKey: computer.getPublicKey() },
        () => {
          refreshGames()
        },
        (err) => console.error('User stream error:', err),
      )
    }
    subscribe()

    return () => {
      if (unsubscribeGame) unsubscribeGame()
      if (unsubscribeUser) unsubscribeUser()
    }
  }, [computer])

  return (
    <GameListsContext.Provider value={{ activeTurns, myGames, refreshGames }}>
      {children}
    </GameListsContext.Provider>
  )
}

export function ActiveTurnsList({
  setGameId,
}: {
  setGameId: React.Dispatch<React.SetStateAction<string>>
}) {
  const { activeTurns, refreshGames } = useGameListsContext()

  return (
    <InfiniteScroll
      title="My Active Turns"
      games={activeTurns}
      refreshGames={refreshGames}
      setGameId={setGameId}
      showNewBadge
    />
  )
}

export function MyGamesList({
  setGameId,
}: {
  setGameId: React.Dispatch<React.SetStateAction<string>>
}) {
  const { myGames, refreshGames } = useGameListsContext()

  return (
    <InfiniteScroll
      title="My Games"
      games={myGames}
      refreshGames={refreshGames}
      setGameId={setGameId}
      showNewBadge={false}
    />
  )
}
