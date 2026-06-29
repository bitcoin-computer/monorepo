import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { useNavigate } from 'react-router-dom'
import {
  ChessContract,
  ChessContractHelper,
  ChessChallengeTxWrapper,
} from '@bitcoin-computer/chess-contracts'
import {
  VITE_CHESS_GAME_MOD_SPEC,
  VITE_CHESS_USER_MOD_SPEC,
  VITE_TBC20_MOD_SPEC,
} from '../constants/modSpecs'
import { SmartContract, Computer } from '@bitcoin-computer/lib'
import { isPendingChallengeCanceled } from './utils'
import { notifyGamesUpdated } from './utils/gamesRefresh'

export const startGameModal = 'start-game-modal'

const CHALLENGE_CANCELED_MESSAGE =
  'This challenge was canceled by the opponent. Your wager was not deposited.'

async function markCanceledChallengeSeen(
  computer: Computer,
  challenge: ChessChallengeTxWrapper,
  chess: SmartContract<typeof ChessContract>,
) {
  const helper = ChessContractHelper.fromModSpecs(
    computer,
    VITE_CHESS_GAME_MOD_SPEC,
    VITE_CHESS_USER_MOD_SPEC,
    VITE_TBC20_MOD_SPEC,
  )
  try {
    if (!challenge.canceledSeen) {
      await challenge.setCanceledSeen()
    }
  } catch {
    // Non-fatal: badge may clear on next open
  }
  try {
    if (!chess.canceledSeen && chess.publicKeyB === computer.getPublicKey()) {
      await helper.markCanceledSeen(chess._id)
    }
  } catch {
    // Non-fatal: badge may clear on next open
  }
}

export function StartGameModalContent({
  challenge,
  chess,
  accepted,
  canceled,
  loading,
}: {
  challenge: ChessChallengeTxWrapper | null
  chess: SmartContract<typeof ChessContract> | null
  accepted: boolean
  canceled: boolean
  loading: boolean
}) {
  const computer = useContext(ComputerContext)
  const navigate = useNavigate()
  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!challenge || !chess) return
    try {
      showLoader(true)

      const helper = ChessContractHelper.fromModSpecs(
        computer,
        VITE_CHESS_GAME_MOD_SPEC,
        VITE_CHESS_USER_MOD_SPEC,
        VITE_TBC20_MOD_SPEC,
      )

      const latestChessRev = await computer.latest(chess._id)
      const latestChess = await computer.sync<typeof ChessContract>(latestChessRev)

      if (latestChess.publicKeyW) {
        throw new Error('This challenge has already been accepted.')
      }
      if (await isPendingChallengeCanceled(computer, latestChess)) {
        throw new Error(CHALLENGE_CANCELED_MESSAGE)
      }

      const token = await helper.findToken(challenge.tokenRoot, challenge.wagerAmount)
      if (!token) {
        throw new Error(
          `No token with root ${challenge.tokenRoot} and at least ${challenge.wagerAmount} balance found.`,
        )
      }

      await helper.depositTokens(
        latestChessRev,
        token._rev,
        challenge.wagerAmount,
        'Black',
        challenge.publicKeyW,
      )
      await helper.addGameToUserIfNeeded(chess._id)

      try {
        await challenge.setAccepted()
      } catch {
        // Non-fatal: the game is funded even if this fails
      }

      Modal.hideModal(startGameModal)
      notifyGamesUpdated()
      navigate(`/game/${chess._id}`)
    } catch (err) {
      showSnackBar(err instanceof Error ? err.message : 'Error occurred!', false)
    } finally {
      showLoader(false)
    }
  }

  if (loading || !challenge || !chess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Loading challenge details...
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full mx-auto bg-white shadow-md rounded-lg dark:bg-gray-700"
    >
      <div className="grid gap-6 p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Wager Amount</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {challenge.wagerAmount.toString()} tokens
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Token Root</span>
          <span
            title={challenge.tokenRoot}
            className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]"
          >
            {challenge.tokenRoot}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Opponent</span>
          <span
            title={challenge.publicKeyW}
            className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]"
          >
            {challenge.publicKeyW}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You need a token from the same root with at least {challenge.wagerAmount.toString()}{' '}
          balance. Winner takes both wagers.
        </p>
      </div>
      <div className="p-6">
        {canceled && (
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-200 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
            The opponent canceled this challenge before you deposited. This game will not start.
          </div>
        )}
        {accepted && !canceled && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg p-3 text-center">
            This challenge has already been accepted.
          </div>
        )}
        <button
          disabled={accepted || canceled}
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
        >
          Accept & Deposit
        </button>
      </div>
    </form>
  )
}

export function StartGameModal({ challengeId }: { challengeId: string }) {
  const computer = useContext(ComputerContext)
  const [challenge, setChallenge] = useState<ChessChallengeTxWrapper | null>(null)
  const [chess, setChess] = useState<SmartContract<typeof ChessContract> | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [canceled, setCanceled] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const showSnackBarRef = useRef(showSnackBar)
  showSnackBarRef.current = showSnackBar
  const computerRef = useRef(computer)
  computerRef.current = computer

  const applyChessState = useCallback(
    async (
      chessObj: SmartContract<typeof ChessContract>,
      challengeObj: ChessChallengeTxWrapper | null,
    ) => {
      setChess(chessObj)
      setAccepted((prev) => prev || !!chessObj.publicKeyW)
      const isCanceled = await isPendingChallengeCanceled(computer, chessObj)
      setCanceled(isCanceled)
      if (isCanceled && challengeObj) {
        void markCanceledChallengeSeen(computer, challengeObj, chessObj)
      }
    },
    [computer],
  )

  useEffect(() => {
    if (!challengeId) return

    let cancelled = false

    setChallenge(null)
    setChess(null)
    setAccepted(false)
    setCanceled(false)
    setLoading(true)

    const fetchChallenge = async () => {
      const comp = computerRef.current
      try {
        const latestRev = await comp.latest(challengeId)
        if (!latestRev) throw new Error('Challenge not found')

        const challengeObj = await comp.sync<typeof ChessChallengeTxWrapper>(latestRev)
        if (cancelled) return

        setChallenge(challengeObj)
        setAccepted(challengeObj.accepted)

        const latestChessRev = await comp.latest(challengeObj.chessRev)
        const chessObj = await comp.sync<typeof ChessContract>(latestChessRev)
        if (cancelled) return

        setChess(chessObj)
        setAccepted((prev) => prev || challengeObj.accepted || !!chessObj.publicKeyW)
        const isCanceled = await isPendingChallengeCanceled(comp, chessObj)
        setCanceled(isCanceled)
        if (isCanceled) {
          void markCanceledChallengeSeen(comp, challengeObj, chessObj)
        }
        if (cancelled) return

        Modal.showModal(startGameModal)
      } catch (error) {
        if (!cancelled) {
          showSnackBarRef.current(
            error instanceof Error ? error.message : 'Error occurred',
            false,
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchChallenge()

    return () => {
      cancelled = true
    }
  }, [challengeId])

  useEffect(() => {
    if (!chess?._id || !challenge || loading) return

    const chessId = chess._id
    let close: (() => void) | undefined
    const subscribeToChess = async () => {
      const comp = computerRef.current
      close = await comp.subscribe(chessId, async () => {
        const latestChessRev = await comp.latest(chessId)
        const chessObj = await comp.sync<typeof ChessContract>(latestChessRev)
        await applyChessState(chessObj, challenge)
      })
    }
    void subscribeToChess()

    return () => {
      if (close) close()
    }
  }, [chess?._id, challenge, applyChessState, loading])

  const modalTitle = canceled
    ? 'Challenge canceled'
    : accepted
      ? 'Challenge accepted'
      : 'You have been challenged!'

  return (
    <Modal.Component
      title={modalTitle}
      content={StartGameModalContent}
      contentData={{ challenge, chess, accepted, canceled, loading }}
      id={startGameModal}
    />
  )
}
