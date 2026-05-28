import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import {
  ChessChallengeTxWrapperHelper,
  ChessContractHelper,
} from '@bitcoin-computer/chess-contracts'
import { useContext, useState } from 'react'
import {
  VITE_CHESS_CHALLENGE_MOD_SPEC,
  VITE_CHESS_GAME_MOD_SPEC,
  VITE_CHESS_USER_MOD_SPEC,
  VITE_TBC20_MOD_SPEC,
} from '../constants/modSpecs'

export const newGameModal = 'new-game-modal'

function NewGameModalContent({
  nameW,
  publicKeyB,
  setSecondPlayerPublicKey,
  wagerAmount,
  setWagerAmount,
  handleClear,
}: {
  nameW: string
  publicKeyB: string
  setSecondPlayerPublicKey: React.Dispatch<React.SetStateAction<string>>
  wagerAmount: string
  setWagerAmount: React.Dispatch<React.SetStateAction<string>>
  handleClear: () => void
}) {
  const computer = useContext(ComputerContext)
  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)

      const wager = BigInt(wagerAmount)
      if (wager <= 0n) throw new Error('Wager amount must be positive')
      if (!publicKeyB) throw new Error('Opponent public key is required')

      const helper = ChessContractHelper.fromModSpecs(
        computer,
        VITE_CHESS_GAME_MOD_SPEC,
        VITE_CHESS_USER_MOD_SPEC,
        VITE_TBC20_MOD_SPEC,
      )

      // Find a token with enough balance to wager
      const token = await helper.findAnyToken(wager)
      if (!token) {
        throw new Error(
          `No token with sufficient balance found. You need at least ${wagerAmount} tokens.`,
        )
      }

      // Create the chess game on-chain
      const chess = await helper.createGame(token._root, wager)

      // White deposits their wager atomically with the game creation step
      await helper.depositTokens(chess._rev, token._rev, wager, nameW, publicKeyB)

      // Create a challenge so Black can find and accept the game
      const chessChallengeTxWrapperHelper = new ChessChallengeTxWrapperHelper({
        computer,
        mod: VITE_CHESS_CHALLENGE_MOD_SPEC,
      })
      await chessChallengeTxWrapperHelper.createChessChallengeTxWrapper(
        chess._rev,
        wager,
        token._root,
        computer.getPublicKey(),
        publicKeyB,
      )

      showSnackBar('Challenge sent! Waiting for opponent to accept.', true)
      Modal.hideModal(newGameModal)
      handleClear()
    } catch (err) {
      showSnackBar(err instanceof Error ? err.message : 'Error occurred!', false)
    } finally {
      showLoader(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full mx-auto bg-white shadow-md rounded-lg dark:bg-gray-700"
    >
      <div className="grid gap-6 p-6 border-b border-gray-200 dark:border-gray-600">
        <div>
          <label
            htmlFor="wagerAmount"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            Wager Amount (tokens)
          </label>
          <input
            type="number"
            id="wagerAmount"
            min="1"
            step="1"
            value={wagerAmount}
            onChange={(e) => setWagerAmount(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Each player wagers this many tokens. Winner takes the full pot.
          </p>
        </div>
        <div>
          <label
            htmlFor="publicKeyB"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            Opponent Public Key
          </label>
          <input
            type="text"
            id="publicKeyB"
            value={publicKeyB}
            onChange={(e) => setSecondPlayerPublicKey(e.target.value)}
            placeholder="Paste opponent's public key"
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
  )
}

export function NewGameModal() {
  const [nameW, setNameW] = useState('White')
  const [publicKeyB, setSecondPlayerPublicKey] = useState('')
  const [wagerAmount, setWagerAmount] = useState('5')

  const handleClear = () => {
    setNameW('White')
    setSecondPlayerPublicKey('')
    setWagerAmount('5')
  }

  return (
    <Modal.Component
      title={'New Game'}
      content={NewGameModalContent}
      contentData={{
        nameW,
        setNameW,
        publicKeyB,
        setSecondPlayerPublicKey,
        wagerAmount,
        setWagerAmount,
        handleClear,
      }}
      id={newGameModal}
      onClickClose={handleClear}
    />
  )
}
