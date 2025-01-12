import { ComputerContext, Modal, UtilsContext } from "@bitcoin-computer/components"
import { ChessContract, ChessContractHelper, Chess as ChessLib, Square } from "@bitcoin-computer/chess-contracts"
import { useCallback, useContext, useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Chessboard } from "react-chessboard"
import { getGameState } from "./utils"
import { VITE_CHESS_GAME_MOD_SPEC } from "../constants/modSpecs"

function currentPlayer(fen: string) {
  const parts = fen.split(" ")
  const activeColor = parts[1]

  if (activeColor === "w") return "White"
  if (activeColor === "b") return "Black"
  throw new Error("Invalid FEN: Unknown active color")
}

function getWinnerPubKey(chessLibrary: ChessLib, { publicKeyW, publicKeyB }: ChessContract) {
  if (chessLibrary.isCheckmate())
    return chessLibrary.turn() === 'b' ? publicKeyW : publicKeyB
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

function WinnerModal(data: { winnerPubKey: string, userPubKey: string }) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div>
          {data.winnerPubKey === data.userPubKey
            ? `Congratiolations! You have won the game. `
            : `Sorry! You have lost the game. `}
          Click{' '}
          <Link
            to={`/new`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal('winner-modal')
            }}
          >
            here
          </Link>{' '}
          to start a new game.
        </div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => Modal.hideModal('winner-modal')}
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
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const [gameId] = useState<string>(params.id || "")
  const [orientation, setOrientation] = useState<"white" | "black">("white")
  const [skipSync, setSkipSync] = useState(false)
  const [winnerData, setWinnerData] = useState({})
  const [game, setGame] = useState<ChessLib | null>(null)
  const [chessContract, setChessContract] = useState<ChessContract | null>(null)

  const computer = useContext(ComputerContext)
  const fetchChessContract = useCallback(async (): Promise<ChessContract> => {
    const [latestRev] = await computer.query({ ids: [gameId] })
    return computer.sync(latestRev) as Promise<ChessContract>
  }, [computer, gameId])

  const setWinner = useCallback(async () => {
    if (!game || !chessContract) return
    const winnerPubKey = getWinnerPubKey(game, chessContract)
    if (!winnerPubKey) {
      return
    }
    setWinnerData({ winnerPubKey: winnerPubKey, userPubKey: computer.getPublicKey() })
    Modal.showModal("winner-modal")
  }, [game, chessContract, computer])

  const syncChessContract = useCallback(async () => {
    try {
      const chessContract = await fetchChessContract()
      // setSans(chessContract.sans)
      if (skipSync) {
        setSkipSync(false)
        return
      }
      setChessContract(chessContract)
      setGame(new ChessLib(chessContract.fen))
      await setWinner()
    } catch (error) {
      console.error('Error fetching contract:', error)
    }
  }, [fetchChessContract, setWinner, skipSync])

  useEffect(() => {
    const fetch = async () => {
      const cc = await fetchChessContract()
      setChessContract(cc)
      setGame(new ChessLib(cc.fen))
      setOrientation(cc.publicKeyW === computer.getPublicKey() ? 'white' : 'black')
      await setWinner()
    }
    fetch()
  }, [computer, fetchChessContract])

  // Update the chess state by polling
  useEffect(() => {
    const intervalId = setInterval(() => {
      syncChessContract()
    }, 3000)

    return () => clearInterval(intervalId)
  }, [syncChessContract])

  // OnDrop action for chess game
  const onDropSync = (from: Square, to: Square) => {
    let dropResult = false;
    (async () => {
      if (!chessContract) throw new Error('Chess contract is not defined.')
      const chessHelper = ChessContractHelper.fromContract(computer, chessContract, VITE_CHESS_GAME_MOD_SPEC)
      const { newChessContract } = await chessHelper.move(chessContract, from, to)

      setSkipSync(true)
      setGame(new ChessLib(newChessContract.fen))
      dropResult = true

    })()
    .catch((error) => {
      if (error instanceof Error) {
        showSnackBar(error.message, false)
        setSkipSync(false)
        syncChessContract()
      }
    })
    return dropResult
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-12 dark:bg-gray-900">
        {/* Game Info Column */}
        {game && (
          <div className="col-span-1 space-y-4 text-gray-900 dark:text-gray-200">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex flex-col pb-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current Player
                  </dt>
                  <dd className="text-lg font-semibold">{currentPlayer(game.fen())}</dd>
                </div>
                <div className="flex flex-col pt-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">State</dt>
                  <dd className="text-lg font-semibold">{getGameState(game)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Chessboard Column */}
        <div className="col-span-2 flex flex-col items-center space-y-2 px-4">
          {game && (
            <>
              <div className="bg-white dark:bg-gray-900 w-full">
                <dl className="text-gray-900 dark:text-gray-200">
                  <div className="flex justify-between">
                    <dt className="text-lg font-bold text-gray-500 dark:text-gray-400">
                      { orientation === 'white' ? chessContract!.nameB : chessContract!.nameW }
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
                    { orientation === 'white' ? chessContract!.nameW : chessContract!.nameB }
                    </dt>
                  </div>
                </dl>
              </div>
            </>
          )}
        </div>

        {/* Moves List Column */}
        {chessContract && (
          <div className="col-span-1 pt-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">Move History</h3>
              <ListLayout listOfMoves={chessContract.sans} />
            </div>
          </div>
        )}
      </div>
      <Modal.Component
        title={'Game Over'}
        content={WinnerModal}
        contentData={winnerData}
        id={'winner-modal'}
      />
    </div>
  )
}
