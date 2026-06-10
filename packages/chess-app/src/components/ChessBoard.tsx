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
} from '@bitcoin-computer/chess-contracts'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import {
  VITE_CHESS_GAME_MOD_SPEC,
  VITE_CHESS_USER_MOD_SPEC,
  VITE_TBC20_MOD_SPEC,
} from '../constants/modSpecs'
import { signInModal } from './Navbar'
import { getGameState, isCreatorRefunded } from './utils'
import { NewGameModal, newGameModal } from './NewGame'
import { Piece } from 'react-chessboard/dist/chessboard/types'
import { CreateUserModal, creaetUserModal } from './CreateUser'
import { ChallengeListWrapper } from './ChallengesListWrapper'
import { Computer, SmartContract } from '@bitcoin-computer/lib'
import { GamesListWrapper } from './GamesListWrapper'

const winnerModal = 'winner-modal'

function currentPlayer(fen: string) {
  const parts = fen.split(' ')
  const activeColor = parts[1]
  if (activeColor === 'w') return 'White'
  if (activeColor === 'b') return 'Black'
  throw new Error('Invalid FEN: Unknown active color')
}

/** Returns the winner's public key when the game is over, or null if still in progress. */
function getWinnerPubKey(chessContract: SmartContract<typeof ChessContract>): string | null {
  const chessLibrary = new ChessLib(chessContract.fen)
  const { publicKeyW, publicKeyB } = chessContract
  if (chessLibrary.isCheckmate()) return chessLibrary.turn() === 'b' ? publicKeyW : publicKeyB
  // Draw or resign: check if withdraws have been set
  if (chessLibrary.isGameOver()) {
    // After a draw, current owner is whoever made the last move — not a traditional "winner"
    return chessContract._owners[0] || null
  }
  // resign: withdraws set but fen-game not over — winner determined by withdraws
  if (chessContract.withdraws.length > 0) {
    // Figure out who has the withdraw entry
    const winnerTokenId = chessContract.withdraws[0][1]
    if (winnerTokenId === chessContract.tokenIdW) return publicKeyW
    if (winnerTokenId === chessContract.tokenIdB) return publicKeyB
  }
  return null
}

/** Returns true when the game is functionally over (checkmate, draw, or resign). */
function isGameOver(
  chessContract: SmartContract<typeof ChessContract>,
  creatorRefunded = false,
): boolean {
  if (creatorRefunded) return false
  if (!isFullyFunded(chessContract)) return false
  return new ChessLib(chessContract.fen).isGameOver() || chessContract.withdraws.length > 0
}

function isFullyFunded(chessContract: SmartContract<typeof ChessContract>): boolean {
  return !!chessContract.publicKeyW && !!chessContract.publicKeyB
}

function CanceledChallengePanel() {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 p-8 text-center">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Challenge canceled</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This game was canceled before it started. The creator&apos;s wager has been refunded.
      </p>
    </div>
  )
}

function WaitingForOpponent({
  chessContract,
  helper,
  onCancel,
  isCancelling,
}: {
  chessContract: SmartContract<typeof ChessContract>
  helper: ChessContractHelper
  onCancel: () => Promise<void>
  isCancelling: boolean
}) {
  const canCancel = helper.canCancel(chessContract) && helper.isCreator(chessContract)
  const isInvitedBlack = helper.computer.getPublicKey() === chessContract.publicKeyB

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Game not started yet</h2>
      {isInvitedBlack ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Accept the challenge from the <strong>Challenges</strong> list and deposit your wager to
          start the game.
        </p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Waiting for your opponent to accept the challenge and deposit their wager.
        </p>
      )}
      <dl className="text-left text-sm space-y-2 text-gray-700 dark:text-gray-300 max-w-md mx-auto">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500 dark:text-gray-400">Wager</dt>
          <dd className="font-semibold">{chessContract.wagerAmount.toString()} tokens each</dd>
        </div>
        {chessContract.nameW && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-gray-400">White</dt>
            <dd className="font-semibold">{chessContract.nameW}</dd>
          </div>
        )}
        {chessContract.publicKeyB && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-gray-400">Black</dt>
            <dd
              className="font-mono text-xs truncate max-w-[200px]"
              title={chessContract.publicKeyB}
            >
              {chessContract.publicKeyB}
            </dd>
          </div>
        )}
      </dl>
      {canCancel && (
        <button
          type="button"
          onClick={() => onCancel()}
          disabled={isCancelling}
          className="mt-6 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isCancelling ? 'Cancelling…' : 'Cancel Challenge & Refund Wager'}
        </button>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
        The board will appear automatically once both players have deposited.
      </p>
    </div>
  )
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

function WinnerModal(data: {
  winnerPubKey: string
  userPubKey: string
  wagerAmount: string
  isDraw: boolean
}) {
  const isWinner = data.winnerPubKey === data.userPubKey
  return (
    <>
      <div className="p-4">
        {data.isDraw ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-500 dark:text-blue-400 mb-2">Draw!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Each player can withdraw their {data.wagerAmount} tokens back.
            </p>
          </div>
        ) : isWinner ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 mb-4">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              You won the game!
            </p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              Prize: {data.wagerAmount} tokens
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Click &quot;Withdraw Tokens&quot; on the board to collect your prize.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sorry, you lost.
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Better luck next time!</p>
          </div>
        )}
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

const buttonStyles = `
  mt-1 text-white bg-blue-700 hover:bg-blue-800 
  focus:ring-4 focus:outline-none focus:ring-blue-300 
  font-medium rounded-lg text-sm w-full sm:w-auto 
  px-5 py-2.5 text-center dark:bg-blue-600 
  dark:hover:bg-blue-700 dark:focus:ring-blue-800 
  disabled:bg-gray-400 disabled:text-gray-100 
  disabled:cursor-not-allowed disabled:hover:bg-gray-400
`

function ActionButtons({
  chessContract,
  computer,
  hasWithdrawn,
  onWithdraw,
  onResign,
}: {
  chessContract: SmartContract<typeof ChessContract>
  computer: Computer
  hasWithdrawn: boolean
  onWithdraw: () => Promise<void>
  onResign: () => Promise<void>
}) {
  const myPubKey = computer.getPublicKey()
  const gameOver = isGameOver(chessContract)
  const isMyTurn = chessContract._owners[0] === myPubKey
  const fullyFunded = !!chessContract.publicKeyW && !!chessContract.publicKeyB

  // Determine my token ID (based on which side I'm playing)
  const myTokenId =
    myPubKey === chessContract.publicKeyW ? chessContract.tokenIdW : chessContract.tokenIdB

  // Does the chess contract declare a payout for my token id?
  const isPayoutEligible =
    chessContract.withdraws.length > 0 && chessContract.withdraws.some(([, id]) => id === myTokenId)

  if (!fullyFunded) return null

  return (
    <div className="flex flex-col gap-2">
      {/* Resign: only for current player during an active game */}
      {!gameOver && isMyTurn && (
        <button onClick={onResign} className={buttonStyles + ' bg-red-600 hover:bg-red-700'}>
          Resign
        </button>
      )}

      {/* Withdraw Tokens: shown only when the chess contract declares a payout
          for my token AND my token has not already claimed against the current
          chess revision. On checkmate the winning move sets withdraws
          atomically, so the winner can withdraw immediately — no separate
          "Claim Win" round trip. */}
      {isPayoutEligible && !hasWithdrawn && (
        <button onClick={onWithdraw} className={buttonStyles}>
          Withdraw Tokens
        </button>
      )}

      {isPayoutEligible && hasWithdrawn && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
          Tokens withdrawn to your wallet.
        </p>
      )}
    </div>
  )
}

export function ChessBoard() {
  const params = useParams()
  const navigate = useNavigate()
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const [gameId, setGameId] = useState<string>(params.id || '')
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [winnerData, setWinnerData] = useState<{
    winnerPubKey: string
    userPubKey: string
    wagerAmount: string
    isDraw: boolean
  } | null>(null)
  const [game, setGame] = useState<ChessLib | null>(null)
  const [chessContract, setChessContract] = useState<SmartContract<typeof ChessContract> | null>(
    null,
  )
  const [chessContractId, setChessContractId] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState<bigint>(0n)
  const [hasWithdrawn, setHasWithdrawn] = useState<boolean>(false)
  const [isCancelling, setIsCancelling] = useState<boolean>(false)
  const [creatorRefunded, setCreatorRefunded] = useState<boolean>(false)

  const computer = useContext(ComputerContext)

  // Tracks which gameId we have already auto-popped the winner modal for, so
  // subsequent contract revisions (e.g. after Withdraw) do not re-open it.
  const winnerShownForGameRef = useRef<string | null>(null)
  const canceledSeenMarkedRef = useRef(false)

  const fetchChessContract = useCallback(async (): Promise<SmartContract<typeof ChessContract>> => {
    const latest = await computer.latest(gameId)
    return computer.sync<typeof ChessContract>(latest)
  }, [computer, gameId])

  // Reset per-game UI state when navigating between games.
  useEffect(() => {
    winnerShownForGameRef.current = null
    setWinnerData(null)
    setHasWithdrawn(false)
    setCreatorRefunded(false)
    canceledSeenMarkedRef.current = false
  }, [gameId])

  // Detect whether my TBC777 token has already claimed against the current
  // chess revision, so we can hide the Withdraw button after a successful
  // withdraw (and on page refresh of an already-claimed game).
  useEffect(() => {
    if (!chessContract) {
      setHasWithdrawn(false)
      return
    }

    const myPubKey = computer.getPublicKey()
    const myTokenId =
      myPubKey === chessContract.publicKeyW ? chessContract.tokenIdW : chessContract.tokenIdB

    if (!myTokenId || chessContract.withdraws.length === 0) {
      setHasWithdrawn(false)
      return
    }
    if (!chessContract.withdraws.some(([, id]) => id === myTokenId)) {
      setHasWithdrawn(false)
      return
    }

    const chessRev = chessContract._rev
    let cancelled = false
    ;(async () => {
      try {
        const latestTokenRev = await computer.latest(myTokenId)
        const token = (await computer.sync(latestTokenRev)) as { withdrawn?: string[] }
        if (cancelled) return
        const withdrawn = token.withdrawn ?? []
        setHasWithdrawn(withdrawn.includes(chessRev))
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to read token withdrawn state:', error)
          setHasWithdrawn(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [chessContract, computer])

  useEffect(() => {
    if (!chessContract) {
      setCreatorRefunded(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const refunded = await isCreatorRefunded(computer, chessContract)
      if (!cancelled) setCreatorRefunded(refunded)
    })()
    return () => {
      cancelled = true
    }
  }, [chessContract, computer])

  useEffect(() => {
    if (!chessContract || !creatorRefunded) return
    if (chessContract.publicKeyB !== computer.getPublicKey()) return
    if (chessContract.canceledSeen || canceledSeenMarkedRef.current) return
    canceledSeenMarkedRef.current = true
    const helper = ChessContractHelper.fromModSpecs(
      computer,
      VITE_CHESS_GAME_MOD_SPEC,
      VITE_CHESS_USER_MOD_SPEC,
      VITE_TBC20_MOD_SPEC,
    )
    helper.markCanceledSeen(chessContract._id).catch((err) => {
      console.error('Failed to mark canceled game as seen:', err)
      canceledSeenMarkedRef.current = false
    })
  }, [chessContract, creatorRefunded, computer])

  // Compute winner data when game ends (this also mounts <Modal.Component /> below).
  useEffect(() => {
    if (!chessContract) return
    if (!isFullyFunded(chessContract)) return
    if (!isGameOver(chessContract, creatorRefunded)) return

    const chessLib = new ChessLib(chessContract.fen)
    const isDraw = chessLib.isGameOver() && !chessLib.isCheckmate()
    const winnerPubKey = getWinnerPubKey(chessContract) || ''
    const totalPot = chessContract.wagerAmount * 2n
    const wagerAmount = isDraw ? chessContract.wagerAmount.toString() : totalPot.toString()
    const userPubKey = computer.getPublicKey()

    // Avoid creating a new state object on every contract revision (which would
    // re-trigger the show-modal effect below). Only update if something changed.
    setWinnerData((prev) => {
      if (
        prev &&
        prev.winnerPubKey === winnerPubKey &&
        prev.userPubKey === userPubKey &&
        prev.wagerAmount === wagerAmount &&
        prev.isDraw === isDraw
      ) {
        return prev
      }
      return { winnerPubKey, userPubKey, wagerAmount, isDraw }
    })
  }, [chessContract, computer, creatorRefunded])

  // Show the modal at most once per game, after winnerData is in state so the
  // modal element exists in the DOM (Modal.showModal looks it up by id).
  useEffect(() => {
    if (!winnerData) return
    if (!gameId) return
    if (winnerShownForGameRef.current === gameId) return
    winnerShownForGameRef.current = gameId
    Modal.showModal(winnerModal)
  }, [winnerData, gameId])

  const syncChessContract = useCallback(async () => {
    try {
      if (gameId) {
        const cc = await fetchChessContract()
        setChessContract(cc)
        setGame(new ChessLib(cc.fen))
        if (isFullyFunded(cc)) {
          setOrientation(cc.publicKeyW === computer.getPublicKey() ? 'white' : 'black')
        }
        const walletBalance = await computer.getBalance()
        setBalance(walletBalance.balance as bigint)
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
    }
  }, [gameId, computer, fetchChessContract])

  // Check user account on mount
  useEffect(() => {
    const fetch = async () => {
      showLoader(true)
      try {
        const [userRev] = await computer.getOUTXOs({
          mod: VITE_CHESS_USER_MOD_SPEC,
          publicKey: computer.getPublicKey(),
        })
        if (!userRev) {
          Modal.showModal(creaetUserModal)
        } else {
          const userObj = await computer.sync<typeof User>(userRev)
          setUser(userObj)
        }
      } catch (error) {
        console.log(error)
      } finally {
        showLoader(false)
      }
    }
    if (Auth.isLoggedIn()) fetch()
  }, [computer])

  // Load game on mount / gameId change
  useEffect(() => {
    const fetch = async () => {
      showLoader(true)
      try {
        if (gameId) {
          const cc = await fetchChessContract()
          setChessContract(cc)
          setChessContractId(cc._id)
          setGame(new ChessLib(cc.fen))
          if (isFullyFunded(cc)) {
            setOrientation(cc.publicKeyW === computer.getPublicKey() ? 'white' : 'black')
          }
          const walletBalance = await computer.getBalance()
          setBalance(walletBalance.balance as bigint)
        }
      } catch (error) {
        console.log(error)
      } finally {
        showLoader(false)
      }
    }
    fetch()
  }, [computer, gameId])

  // Subscribe to chess contract updates
  useEffect(() => {
    let close: () => void
    if (chessContractId) {
      const subscribeToComputer = async () => {
        close = await computer.subscribe(chessContractId, async (rev) => {
          if (rev) syncChessContract()
        })
      }
      subscribeToComputer()
    }
    return () => {
      if (close) close()
    }
  }, [chessContractId])

  const helper = ChessContractHelper.fromModSpecs(
    computer,
    VITE_CHESS_GAME_MOD_SPEC,
    VITE_CHESS_USER_MOD_SPEC,
    VITE_TBC20_MOD_SPEC,
  )

  const publishMove = async (from: Square, to: Square, promotion: string) => {
    if (!chessContract) throw new Error('Chess contract is not defined.')
    await helper.move(chessContract, from, to, promotion)
  }

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      showSnackBar(error.message, false)
      syncChessContract()
    }
  }

  const onDropSync = (from: Square, to: Square, piece: Piece) => {
    if (!chessContract) return false
    if (!isFullyFunded(chessContract)) return false
    if (isGameOver(chessContract)) return false
    if (chessContract._owners[0] !== computer.getPublicKey()) return false

    try {
      const promotion = piece && piece[1] ? piece[1].toLocaleLowerCase() : 'q'
      const chessGameInstance = new ChessLib(chessContract.fen)
      chessGameInstance.move({ from, to, promotion })
      setGame(new ChessLib(chessGameInstance.fen()))
      publishMove(from, to, promotion).catch(handleError)
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }

  const canMove =
    !!game &&
    !!chessContract &&
    isFullyFunded(chessContract) &&
    !isGameOver(chessContract) &&
    chessContract._owners[0] === computer.getPublicKey()

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

  const withdrawTokens = async () => {
    if (!chessContract) return
    try {
      showLoader(true)
      const myPubKey = computer.getPublicKey()
      const myTokenId =
        myPubKey === chessContract.publicKeyW ? chessContract.tokenIdW : chessContract.tokenIdB
      await helper.withdrawTokens(myTokenId, chessContract._id)
      await syncChessContract()
      showSnackBar('Tokens withdrawn successfully!', true)
    } catch (error) {
      showSnackBar(error instanceof Error ? error.message : 'Error withdrawing tokens', false)
    } finally {
      showLoader(false)
    }
  }

  const resign = async () => {
    if (!chessContract) return
    try {
      showLoader(true)
      await helper.resign(chessContract._id)
      await syncChessContract()
      showSnackBar('You resigned. Your opponent can now withdraw the pot.', true)
    } catch (error) {
      showSnackBar(error instanceof Error ? error.message : 'Error resigning', false)
    } finally {
      showLoader(false)
    }
  }

  const cancelChallenge = async () => {
    if (!chessContract) return
    try {
      setIsCancelling(true)
      showLoader(true)
      await helper.cancelGameAndWithdraw(chessContract._id)
      if (document.getElementById(winnerModal)) {
        Modal.hideModal(winnerModal)
      }
      winnerShownForGameRef.current = null
      setWinnerData(null)
      setChessContract(null)
      setChessContractId('')
      setGame(null)
      setGameId('')
      if (params.id) navigate('/')
      showSnackBar('Challenge cancelled. Your wager has been refunded.', true)
    } catch (error) {
      showSnackBar(error instanceof Error ? error.message : 'Error cancelling challenge', false)
      await syncChessContract()
    } finally {
      setIsCancelling(false)
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
          {creatorRefunded ? (
            <CanceledChallengePanel />
          ) : chessContract && !helper.isGameStarted(chessContract) ? (
            <WaitingForOpponent
              chessContract={chessContract}
              helper={helper}
              onCancel={cancelChallenge}
              isCancelling={isCancelling}
            />
          ) : game ? (
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
                  arePiecesDraggable={canMove}
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

        {/* Right Column: game info + actions */}
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
              {game && helper.isGameStarted(chessContract) && (
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
                      <div className="flex flex-col pt-3 pb-3">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Wager
                        </dt>
                        <dd className="text-lg font-semibold">
                          {chessContract.wagerAmount?.toString() ?? '—'} tokens each
                        </dd>
                      </div>
                      <div className="flex flex-col pt-3 pb-3">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Balance (LTC)
                        </dt>
                        <dd className="text-lg font-semibold">
                          {bigIntToStr(balance)} {computer.getChain()}
                        </dd>
                      </div>
                      <div className="flex flex-col pt-3">
                        <ActionButtons
                          chessContract={chessContract}
                          computer={computer}
                          hasWithdrawn={hasWithdrawn}
                          onWithdraw={withdrawTokens}
                          onResign={resign}
                        />
                      </div>
                    </dl>
                  </div>
                </div>
              )}
              {helper.isGameStarted(chessContract) && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-center">
                    <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
                      Move History
                    </h3>
                  </div>
                  <ListLayout listOfMoves={chessContract.sans} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {winnerData && (
        <Modal.Component
          title={'Game Over'}
          content={WinnerModal}
          contentData={winnerData}
          id={winnerModal}
        />
      )}

      <NewGameModal />
      <CreateUserModal setUser={setUser} currentBalance={balance} />
    </div>
  )
}
