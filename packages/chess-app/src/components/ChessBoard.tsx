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
  User,
  WinnerTxWrapper,
  signRedeemTx,
} from '@bitcoin-computer/chess-contracts'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC } from '../constants/modSpecs'
import { signInModal } from './Navbar'
import { getGameState } from './utils'
import { NewGameModal, newGameModal } from './NewGame'
import { Piece } from 'react-chessboard/dist/chessboard/types'
import { CreateUserModal, creaetUserModal } from './CreateUser'
import { ChallengeListWrapper } from './ChallengesListWrapper'
import { Computer } from '@bitcoin-computer/lib'
import { GamesListWrapper } from './GamesListWrapper'

const winnerModal = 'winner-modal'

function currentPlayer(fen: string) {
  const parts = fen.split(' ')
  const activeColor = parts[1]

  if (activeColor === 'w') return 'White'
  if (activeColor === 'b') return 'Black'
  throw new Error('Invalid FEN: Unknown active color')
}

function getWinnerPubKey(chessContract: ChessContract) {
  const chessLibrary = new ChessLib(chessContract.fen)
  const { publicKeyW, publicKeyB } = chessContract
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

function WinnerModal(data: { winnerPubKey: string; userPubKey: string; amount: string }) {
  const isWinner = data.winnerPubKey === data.userPubKey
  return (
    <>
      <div className="p-4">
        <p className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
          {isWinner ? (
            <>
              {/* Winning State */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 mb-4">
                  🎉 Congratulations! 🎉
                </h2>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  You won the game!
                </p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  Prize: {data.amount}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Losing State */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sorry, you lost.
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Better luck next time!</p>
              </div>
            </>
          )}
          {/* {data.winnerPubKey === data.userPubKey
            ? `Congratulations! You have won the game. `
            : `Sorry! You have lost the game. `} */}
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

const renderButtonContent = (
  game: ChessLib | undefined,
  paymentReleased: boolean,
  chessContract: ChessContract | null,
  computer: Computer,
  requestRelease: () => Promise<void>,
  releaseFund: () => Promise<void>,
) => {
  if (!game || !game.isGameOver()) {
    return null
  }

  if (paymentReleased) {
    return <span>Funds Released</span>
  }

  const isOwner = chessContract?._owners[0] === computer.getPublicKey()
  const buttonStyles = `
    mt-1 text-white bg-blue-700 hover:bg-blue-800 
    focus:ring-4 focus:outline-none focus:ring-blue-300 
    font-medium rounded-lg text-sm w-full sm:w-auto 
    px-5 py-2.5 text-center dark:bg-blue-600 
    dark:hover:bg-blue-700 dark:focus:ring-blue-800 
    disabled:bg-gray-400 disabled:text-gray-100 
    disabled:cursor-not-allowed disabled:hover:bg-gray-400
  `

  if (isOwner) {
    return (
      <button
        onClick={() => requestRelease()}
        disabled={!chessContract || !!chessContract.winnerTxWrapper.redeemTxHex}
        className={buttonStyles}
      >
        Request Release
      </button>
    )
  }

  return (
    <button
      onClick={releaseFund}
      disabled={!chessContract || !chessContract.winnerTxWrapper.redeemTxHex}
      className={buttonStyles}
    >
      Release Fund
    </button>
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
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState<bigint>(0n)
  const [paymentReleased, setPaymentReleased] = useState(true)

  const computer = useContext(ComputerContext)
  const fetchChessContract = async (): Promise<ChessContract> => {
    const [latestRev] = await computer.query({ ids: [gameId] })
    return computer.sync(latestRev) as Promise<ChessContract>
  }

  useEffect(() => {
    if (!chessContract) return
    const winnerPubKey = getWinnerPubKey(chessContract)
    if (!winnerPubKey) {
      return
    }
    setWinnerData({
      winnerPubKey: winnerPubKey,
      userPubKey: computer.getPublicKey(),
      amount: `${bigIntToStr(chessContract.satoshis)} ${computer.getChain()}`,
    })
    Modal.showModal(winnerModal)
  }, [chessContract, computer])

  const syncChessContract = useCallback(async () => {
    try {
      if (gameId) {
        const chessContract = await fetchChessContract()
        setChessContract(chessContract)
        setGame(new ChessLib(chessContract.fen))
        const walletBalance = await computer.getBalance()
        setBalance(walletBalance.balance as unknown as bigint)
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
    }
  }, [gameId, computer, fetchChessContract])

  // check if user account is created, create one if not
  useEffect(() => {
    const fetch = async () => {
      showLoader(true)
      try {
        const [userRev] = await computer.query({
          mod: VITE_CHESS_USER_MOD_SPEC,
          publicKey: computer.getPublicKey(),
        })
        if (!userRev) {
          Modal.showModal(creaetUserModal)
        } else {
          const userObj = (await computer.sync(userRev)) as User
          setUser(userObj)
        }
      } catch (error) {
        console.log(error)
      } finally {
        showLoader(false)
      }
    }
    if (Auth.isLoggedIn()) {
      fetch()
    }
  }, [computer])

  useEffect(() => {
    const fetch = async () => {
      showLoader(true)
      try {
        if (gameId) {
          const cc = await fetchChessContract()
          const isUnspent = await computer.isUnspent(cc?.payment._rev)
          setPaymentReleased(!isUnspent)
          setChessContract(cc)
          setChessContractId(cc._id)
          setGame(new ChessLib(cc.fen))
          setOrientation(cc.publicKeyW === computer.getPublicKey() ? 'white' : 'black')
          const walletBalance = await computer.getBalance()
          setBalance(walletBalance.balance as unknown as bigint)
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
        close = await computer.subscribe(chessContractId, async (rev) => {
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

  // Polling for the winner and claiming the transaction
  useEffect(() => {
    let close: () => void // Declare a variable to hold the subscription
    const fetch = async () => {
      try {
        if (chessContractId) {
          const cc = await fetchChessContract()
          const subscribeToWinnerTx = async () => {
            close = await computer.subscribe(cc.winnerTxWrapper._id, async (rev) => {
              if (rev) {
                const txWrapper = (await computer.sync(rev.rev)) as WinnerTxWrapper
                if (txWrapper.redeemTxHex) {
                  // Explicitly fetching chess contract again to get the latest state
                  const chessContract = await fetchChessContract()
                  const game = new ChessLib(chessContract.fen)
                  if (!game.isGameOver()) {
                    showSnackBar('Game is not over yet!', false)
                    return
                  }
                  const winnerPublicKey = chessContract._owners[0] as string
                  if (winnerPublicKey === computer.getPublicKey()) {
                    // No need to do anything here as this is the winner
                    showSnackBar(
                      'Congratulations you won!, your funds will be released shortly',
                      true,
                    )
                    return
                  }
                  const signedRedeemTx = await signRedeemTx(computer, chessContract, txWrapper)
                  await computer.broadcast(signedRedeemTx)
                  showSnackBar(`You lost the game! funds released. `, true)
                }
              }
            })
          }

          subscribeToWinnerTx()
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetch()

    return () => {
      if (close) {
        close()
      }
    }
  }, [chessContractId])

  const publishMove = async (from: Square, to: Square, promotion: string) => {
    if (!chessContract) throw new Error('Chess contract is not defined.')
    const chessHelper = ChessContractHelper.fromContract(
      computer,
      chessContract,
      VITE_CHESS_GAME_MOD_SPEC,
      VITE_CHESS_USER_MOD_SPEC,
    )
    await chessHelper.move(chessContract, from, to, promotion)
  }
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      showSnackBar(error.message, false)
      syncChessContract()
    }
  }

  // OnDrop action for chess game
  const onDropSync = (from: Square, to: Square, piece: Piece) => {
    try {
      const promotion = piece && piece[1] ? piece[1].toLocaleLowerCase() : 'q'
      const chessGameInstance = new ChessLib(chessContract?.fen)
      chessGameInstance.move({
        from,
        to,
        promotion,
      })
      setGame(new ChessLib(chessGameInstance.fen()))
      publishMove(from, to, promotion).catch((error) => {
        handleError(error)
      })
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }
  const playNewGame = () => {
    if (!Auth.isLoggedIn()) {
      Modal.showModal(signInModal)
    } else if (!user) {
      Modal.showModal(creaetUserModal)
    } else {
      Modal.showModal(newGameModal)
    }
  }

  const createAccount = () => {
    Modal.showModal(creaetUserModal)
  }

  const requestRelease = async () => {
    try {
      showLoader(true)
      if (!computer || !chessContract) {
        showSnackBar('Not a valid chess contract', false)
        return
      }
      const { nameB, nameW, satoshis, publicKeyB, publicKeyW } = chessContract
      const chessContractHelper = new ChessContractHelper({
        computer,
        nameB,
        nameW,
        satoshis: satoshis,
        publicKeyB,
        publicKeyW,
        mod: VITE_CHESS_GAME_MOD_SPEC,
        userMod: VITE_CHESS_USER_MOD_SPEC,
      })
      await chessContractHelper.spend(chessContract)
    } catch (error) {
      showSnackBar(
        error instanceof Error ? error.message : 'Error occurred while creating transaction',
        false,
      )
    } finally {
      showLoader(false)
    }
  }
  const releaseFund = async () => {
    try {
      showLoader(true)
      if (!computer || !chessContract) {
        showSnackBar('Not a valid chess contract', false)
        return
      }
      const signedRedeemTx = await signRedeemTx(
        computer,
        chessContract,
        chessContract?.winnerTxWrapper,
      )
      const finalTxId = await computer.broadcast(signedRedeemTx)
      setPaymentReleased(true)
      showSnackBar(`You lost the game, fund released. Transaction: ${finalTxId}`, true)
    } catch (error) {
      showSnackBar(
        error instanceof Error ? error.message : 'Error occurred while releasing fund',
        false,
      )
    } finally {
      showLoader(false)
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
            <GamesListWrapper setGameId={setGameId} setUser={setUser} />
          </div>
          <div>
            <ChallengeListWrapper user={user} />
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
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
            {user ? (
              <div className="flex justify-center">
                <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">{user.name}</h3>
              </div>
            ) : (
              <div className="flex justify-center mt-4">
                <button
                  onClick={createAccount}
                  type="button"
                  className="w-full py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
          {chessContract && (
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
                        <dd className="text-lg font-semibold">{getGameState(chessContract)}</dd>
                      </div>
                      <div className="flex flex-col pt-3">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Balance
                        </dt>
                        <dd className="text-lg font-semibold">
                          {bigIntToStr(balance)} {computer.getChain()}
                        </dd>
                      </div>
                      {getWinnerPubKey(chessContract) && (
                        <div className="flex flex-col pt-3">
                          {renderButtonContent(
                            game,
                            paymentReleased,
                            chessContract,
                            computer,
                            requestRelease,
                            releaseFund,
                          )}
                        </div>
                      )}
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
      <CreateUserModal setUser={setUser} currentBalance={balance} />
    </div>
  )
}
