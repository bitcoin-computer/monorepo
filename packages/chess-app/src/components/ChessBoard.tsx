import { Auth, ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import {
  ChessContract,
  ChessContractHelper,
  Chess as ChessLib,
  Square,
} from '@bitcoin-computer/chess-contracts'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'

import { getHash } from '../services/secret.service'
import { VITE_CHESS_GAME_MOD_SPEC } from '../constants/modSpecs'
import { StartGameModal } from './StartGame'
import { signInModal } from './Navbar'

const newGameModal = 'new-game-modal'

export type Class = new (...args: unknown[]) => unknown

export type UserQuery<T extends Class> = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: 'ASC' | 'DESC'
  ids: string[]
  contract: {
    class: T
    args?: ConstructorParameters<T>
  }
}>

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

export function NewGameModalContent({
  nameW,
  setName,
  nameB,
  setNameB,
  publicKeyB,
  setSecondPlayerPublicKey,
  amount,
  setAmount,
  copied,
  setCopied,
  serializedTx,
  setSerializedTx,
}: any) {
  const computerW = useContext(ComputerContext)

  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()

  const handleCopy = () => {
    navigator.clipboard
      .writeText(serializedTx)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))

    setTimeout(() => setCopied(false), 2000)
  }

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const secretHashW = await getHash()
      const secretHashB = await getHash()

      if (!secretHashW || !secretHashB) throw new Error('Could not obtain hash from server')

      const publicKeyW = computerW.getPublicKey()
      const chessContractHelper = new ChessContractHelper({
        computer: computerW,
        amount: parseFloat(amount) * 1e8,
        nameW,
        nameB,
        publicKeyW,
        publicKeyB,
        secretHashW,
        secretHashB,
        mod: VITE_CHESS_GAME_MOD_SPEC,
      })
      const tx = await chessContractHelper.makeTx()
      setSerializedTx(`http://localhost:1032?start-game=${tx.serialize()}`)

      showLoader(false)
    } catch (err) {
      if (err instanceof Error) {
        showSnackBar(err.message, false)
      } else {
        showSnackBar('Error occurred!', false)
      }
      showLoader(false)
    }
  }

  return (
    <>
      {!!serializedTx ? (
        <div className="flex flex-col items-start border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-700">
          <div className="relative group w-full p-6 border-b border-gray-200 dark:border-gray-600">
            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
              Share this link to your friend to start playing
            </p>
            <p
              className="text-sm text-blue-600 underline cursor-pointer truncate hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 focus:ring-0"
              onClick={handleCopy}
              title="Click to copy the link"
            >
              {`${serializedTx.slice(0, 50)}...`}
            </p>
          </div>
          <div className="p-6">
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <form
            onSubmit={onSubmit}
            className="w-full mx-auto bg-white shadow-md rounded-lg dark:bg-gray-700"
          >
            <div className="grid gap-6 p-6 border-b border-gray-200 dark:border-gray-600">
              <div>
                <label
                  htmlFor="amount"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="publicKeyB"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Second Player Public Key
                </label>
                <input
                  type="text"
                  id="publicKeyB"
                  value={publicKeyB}
                  onChange={(e) => setSecondPlayerPublicKey(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-6">
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Create Game
              </button>
            </div>
          </form>
        </>
      )}
    </>
  )
}

export function NewGameModal() {
  const [nameW, setName] = useState('White')
  const [nameB, setNameB] = useState('Black')
  const [publicKeyB, setSecondPlayerPublicKey] = useState('')
  const [amount, setAmount] = useState(`0.1`)
  const [copied, setCopied] = useState(false)
  const [serializedTx, setSerializedTx] = useState('')

  const handleClear = () => {
    setName('White')
    setNameB('Black')
    setSecondPlayerPublicKey('')
    setAmount(`0.1`)
    setCopied(false)
    setSerializedTx('')
  }
  return (
    <Modal.Component
      title={'New Game'}
      content={NewGameModalContent}
      contentData={{
        nameW,
        setName,
        nameB,
        setNameB,
        publicKeyB,
        setSecondPlayerPublicKey,
        amount,
        setAmount,
        copied,
        setCopied,
        serializedTx,
        setSerializedTx,
      }}
      id={newGameModal}
      onClickClose={handleClear}
    />
  )
}

const InfiniteScroll = ({
  setGameId,
}: {
  setGameId: React.Dispatch<React.SetStateAction<string>>
}) => {
  const [items, setItems] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const computer = useContext(ComputerContext)
  const contractsPerPage = 12
  const navigate = useNavigate()

  const fetchMoreItems = async <T extends Class>(q: UserQuery<T>): Promise<string[]> => {
    const query = { ...q }
    query.limit = contractsPerPage * 2 // For a chess game we have two contracts Payment and ChessContract
    query.order = 'DESC'
    const result = (await computer.query(query)) as string[]

    const filteredRevs = (result || []).filter((rev) => rev.split(':')[1] === '0')
    return filteredRevs
  }

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const newItems = await fetchMoreItems({ mod: VITE_CHESS_GAME_MOD_SPEC, offset: items.length })

    setItems((prev) => [...prev, ...newItems])
    if (newItems.length < contractsPerPage) setHasMore(false) // Stop fetching when no more items are available
    setLoading(false)
  }, [loading, hasMore, items])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      const bottomReached = container.scrollTop + container.clientHeight >= container.scrollHeight
      if (bottomReached) {
        loadMoreItems()
      }
    }
  }

  useEffect(() => {
    // Initial fetch without relying on scroll
    const initialFetch = async () => {
      setLoading(true)
      const initialItems = await fetchMoreItems({ mod: VITE_CHESS_GAME_MOD_SPEC, offset: 0 })
      setItems(initialItems)
      if (initialItems.length < contractsPerPage) setHasMore(false)
      setLoading(false)
    }

    initialFetch()
  }, [])

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-gray-800 border border-gray-300  dark:border-gray-700 rounded-lg">
      <div className="flex justify-center mt-2 mb-2">
        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">All Games</h3>
      </div>
      <div
        ref={scrollContainerRef}
        className="overflow-auto flex-1   max-h-[calc(100vh-9rem)]"
        // style={{ maxHeight: '500px' }}
        onScroll={handleScroll}
      >
        <ul className="space-y-2 p-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              title={item}
              onClick={() => {
                navigate(`/game/${item}`)
                setGameId(item)
              }}
            >
              {item}
            </li>
          ))}
        </ul>
        {loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">Loading...</div>
        )}
      </div>
    </div>
  )
}

export function ChessBoard() {
  const params = useParams()
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const [gameId, setGameId] = useState<string>(params.id || '')
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [skipSync, setSkipSync] = useState(false)
  const [winnerData, setWinnerData] = useState({})
  const [game, setGame] = useState<ChessLib | null>(null)
  const [chessContract, setChessContract] = useState<ChessContract | null>(null)

  const computer = useContext(ComputerContext)
  const fetchChessContract = async (): Promise<ChessContract> => {
    const [latestRev] = await computer.query({ ids: [gameId] })
    return computer.sync(latestRev) as Promise<ChessContract>
  }

  const setWinner = useCallback(async () => {
    if (!game || !chessContract) return
    const winnerPubKey = getWinnerPubKey(game, chessContract)
    if (!winnerPubKey) {
      return
    }
    setWinnerData({ winnerPubKey: winnerPubKey, userPubKey: computer.getPublicKey() })
    Modal.showModal('winner-modal')
  }, [game, chessContract, computer])

  const syncChessContract = useCallback(async () => {
    try {
      if (gameId) {
        const chessContract = await fetchChessContract()
        // setSans(chessContract.sans)
        if (skipSync) {
          setSkipSync(false)
          return
        }
        setChessContract(chessContract)
        setGame(new ChessLib(chessContract.fen))
        await setWinner()
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
    }
  }, [setWinner, skipSync])

  useEffect(() => {
    const fetch = async () => {
      if (gameId) {
        const cc = await fetchChessContract()
        setChessContract(cc)
        setGame(new ChessLib(cc.fen))
        setOrientation(cc.publicKeyW === computer.getPublicKey() ? 'white' : 'black')
        await setWinner()
      }
    }
    fetch()
  }, [computer, gameId])

  // Update the chess state by polling
  useEffect(() => {
    let close: any // Declare a variable to hold the subscription
    if (gameId) {
      const subscribeToComputer = async () => {
        // @ts-ignore
        close = await computer.subscribe(gameId, (rev) => {
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
  }, [gameId])

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
      setSkipSync(false)
      syncChessContract()
    }
  }

  // OnDrop action for chess game
  const onDropSync = (from: Square, to: Square) => {
    try {
      const chessGameInstance = new ChessLib(chessContract?.fen)
      setSkipSync(true)
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
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-center">
                <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">Move History</h3>
              </div>

              <ListLayout listOfMoves={chessContract.sans} />
            </div>
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
        id={'winner-modal'}
      />

      <NewGameModal />
      <StartGameModal />
    </div>
  )
}
