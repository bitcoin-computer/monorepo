import {
  Auth,
  ComputerContext,
  bigIntToStr,
  Modal,
  UtilsContext,
} from '@bitcoin-computer/components'
import {
  ChessContract,
  ChessContractHelper,
  Chess as ChessLib,
  Square,
} from '@bitcoin-computer/chess-contracts'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { VITE_CHESS_GAME_MOD_SPEC } from '../constants/modSpecs'
import { StartGameModal } from './StartGame'
import { signInModal } from './Navbar'
import { getGameState } from './utils'
import { NewGameModal, newGameModal } from './NewGame'
import { InfiniteScroll } from './GamesList'

const winnerModal = 'winner-modal'

function currentPlayer(fen: string) {
  const parts = fen.split(' ')
  const activeColor = parts[1]

  if (activeColor === 'w') return 'White'
  if (activeColor === 'b') return 'Black'
  throw new Error('Invalid FEN: Unknown active color')
}

function getWinnerPubKey(chessLibrary: ChessLib, { publicKeyW, publicKeyB }: ChessContract) {
  if (chessLibrary.isCheckmate()) return chessLibrary.turn() === 'b' ? publicKeyW : publicKeyB
  return null
}

function ListLayout(props: { listOfMoves: string[] }) {
  const { listOfMoves } = props

  const rows = []

  for (let i = 0; i < listOfMoves.length; i += 2) {
    const item1 = listOfMoves[i]
    const item2 = listOfMoves[i + 1]

    if (item1 && item2) {
      rows.push(
        <div key={i} className="flex space-x-4 text-gray-900 dark:text-gray-200 font-semibold">
          <div className="w-4">{i / 2 + 1}.</div>
          <div className="w-1/2">{item1}</div>
          <div className="w-1/2">{item2}</div>
        </div>,
      )
    } else if (item1) {
      rows.push(
        <div key={i} className="flex space-x-4 text-gray-900 dark:text-gray-200 font-semibold">
          <div className="w-4">{i / 2 + 1}.</div>
          <div className="w-full">{item1}</div>
        </div>,
      )
    }
  }

  return <div className="space-y-2">{rows}</div>
}

function WinnerModal(data: { winnerPubKey: string; userPubKey: string }) {
  return (
    <>
      <div className="p-4">
        <p className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
          {data.winnerPubKey === data.userPubKey
            ? `Congratiolations! You have won the game. `
            : `Sorry! You have lost the game. `}
        </p>
      </div>
      <div className="flex items-center p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => Modal.hideModal(winnerModal)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  )
}

export function ChessBoard() {
  const params = useParams()
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const [gameId, setGameId] = useState<string>(params.id || '')
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [winnerData, setWinnerData] = useState({})
  const [game, setGame] = useState<ChessLib | null>(null)
  const [chessContract, setChessContract] = useState<ChessContract | null>(null)
  const [chessContractId, setChessContractId] = useState<string>('')
  const [balance, setBalance] = useState<bigint>(0n)

  const computer = useContext(ComputerContext)
  const fetchChessContract = async (): Promise<ChessContract> => {
    const [latestRev] = await computer.query({ ids: [gameId] })
    return computer.sync(latestRev) as Promise<ChessContract>
  }

  useEffect(() => {
    if (!game || !chessContract) return
    const winnerPubKey = getWinnerPubKey(game, chessContract)
    if (!winnerPubKey) {
      return
    }
    setWinnerData({ winnerPubKey: winnerPubKey, userPubKey: computer.getPublicKey() })
    Modal.showModal(winnerModal)
  }, [chessContract, computer, game])

  const syncChessContract = useCallback(async () => {
    try {
      if (gameId) {
        const chessContract = await fetchChessContract()
        setChessContract(chessContract)
        setGame(new ChessLib(chessContract.fen))
        const walletBalance = await computer.getBalance()
        setBalance(walletBalance.balance)
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
    }
  }, [gameId, computer, fetchChessContract])

  useEffect(() => {
    const fetch = async () => {
      showLoader(true)
      try {
        if (gameId) {
          const cc = await fetchChessContract()
          setChessContract(cc)
          setChessContractId(cc._id)
          setGame(new ChessLib(cc.fen))
          setOrientation(cc.publicKeyW === computer.getPublicKey() ? 'white' : 'black')
          const walletBalance = await computer.getBalance()
          setBalance(walletBalance.balance)
        }
      } catch (error) {
        console.log(error)
      } finally {
        showLoader(false)
      }
    }
    fetch()
  }, [computer, gameId])

  // Update the chess state by polling
  useEffect(() => {
    let close: () => void // Declare a variable to hold the subscription
    if (chessContractId) {
      const subscribeToComputer = async () => {
        close = await computer.subscribe(chessContractId, (rev) => {
          if (rev) syncChessContract()
        })
      }

      subscribeToComputer()
    }

    return () => {
      if (close) {
        close()
      }
    }
  }, [chessContractId])

  const publishMove = async (from: Square, to: Square) => {
    if (!chessContract) throw new Error('Chess contract is not defined.')
    const chessHelper = ChessContractHelper.fromContract(
      computer,
      chessContract,
      VITE_CHESS_GAME_MOD_SPEC,
    )
    await chessHelper.move(chessContract, from, to)
  }
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      showSnackBar(error.message, false)
      syncChessContract()
    }
  }

  // OnDrop action for chess game
  const onDropSync = (from: Square, to: Square) => {
    try {
      const chessGameInstance = new ChessLib(chessContract?.fen)
      chessGameInstance.move({
        from,
        to,
      })

      setGame(new ChessLib(chessGameInstance.fen()))
      publishMove(from, to).catch((error) => {
        handleError(error)
      })
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }
  const playNewGame = () => {
    if (Auth.isLoggedIn()) {
      Modal.showModal(newGameModal)
    } else {
      Modal.showModal(signInModal)
    }
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 dark:bg-gray-900">
        {/* Left Column */}
        <div className="space-y-4 text-gray-900 dark:text-gray-200 order-3 md:order-3 lg:order-1 md:col-span-1">
          <button
            onClick={playNewGame}
            type="button"
            className="w-full py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            New Game
          </button>
          <div>
            <InfiniteScroll setGameId={setGameId} />
          </div>
        </div>

        {/* Chessboard Column */}
        <div className="flex flex-col items-center space-y-2 px-4 order-1 md:order-1 lg:order-2 md:col-span-2 lg:col-span-2">
          {game ? (
            <>
              <div className="bg-white dark:bg-gray-900 w-full">
                <dl className="text-gray-900 dark:text-gray-200">
                  <div className="flex justify-between">
                    <dt className="text-lg font-bold text-gray-500 dark:text-gray-400">
                      {orientation === 'white' ? chessContract!.nameB : chessContract!.nameW}
                    </dt>
                  </div>
                </dl>
              </div>

              <div className="bg-white dark:bg-gray-800 w-full">
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onDropSync}
                  boardOrientation={orientation}
                />
              </div>

              <div className="bg-white dark:bg-gray-900 w-full">
                <dl className="text-gray-900 dark:text-gray-200">
                  <div className="flex justify-between">
                    <dt className="text-lg font-bold text-gray-500 dark:text-gray-400">
                      {orientation === 'white' ? chessContract!.nameW : chessContract!.nameB}
                    </dt>
                  </div>
                </dl>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 w-full">
              <Chessboard />
            </div>
          )}
        </div>

        {/* Moves List Column */}
        <div className="pt-4 order-2 md:order-2 lg:order-3 md:col-span-1">
          {chessContract ? (
            <>
              {game && (
                <div className="col-span-1 space-y-4 text-gray-900 dark:text-gray-200 mb-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                      <div className="flex flex-col pb-3">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Current Player
                        </dt>
                        <dd className="text-lg font-semibold">{currentPlayer(game.fen())}</dd>
                      </div>
                      <div className="flex flex-col pt-3 pb-3">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          State
                        </dt>
                        <dd className="text-lg font-semibold">{getGameState(game)}</dd>
                      </div>
                      <div className="flex flex-col pt-3">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Balance
                        </dt>
                        <dd className="text-lg font-semibold">
                          {bigIntToStr(balance)} {computer.getChain()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex justify-center">
                  <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
                    Move History
                  </h3>
                </div>

                <ListLayout listOfMoves={chessContract.sans} />
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-center">
                <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
                  Play Chess on {computer.getChain()}
                </h3>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={playNewGame}
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Start play
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal.Component
        title={'Game Over'}
        content={WinnerModal}
        contentData={winnerData}
        id={winnerModal}
      />

      <NewGameModal />
      <StartGameModal />
    </div>
  )
}
