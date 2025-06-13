import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ComputerContext, Modal, UtilsContext, bigIntToStr } from '@bitcoin-computer/components'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import { ChessContract, ChessContractHelper } from '../../../chess-contracts/'
import { VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC } from '../constants/modSpecs'

const startGameModal = 'start-game-modal'

export function StartGameModalContent({
  serialized,
  game,
  computer,
  copied,
  setCopied,
  link,
  setLink,
}: {
  serialized: string
  game: ChessContract
  computer: Computer
  copied: boolean
  setCopied: React.Dispatch<React.SetStateAction<boolean>>
  link: string
  setLink: React.Dispatch<React.SetStateAction<string>>
}) {
  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()

  const handleCopy = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))

    setTimeout(() => setCopied(false), 2000)
  }

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const tx = Transaction.deserialize(serialized)
      const chessContractHelper = ChessContractHelper.fromContract(
        computer,
        game,
        VITE_CHESS_GAME_MOD_SPEC,
        VITE_CHESS_USER_MOD_SPEC,
      )
      const txId = await chessContractHelper.completeTx(tx)
      setLink(`${window.location.origin}/game/${txId}:0`)
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
      {link ? (
        <div className="flex flex-col items-start border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-700">
          <div className="relative group w-full p-6 border-b border-gray-200 dark:border-gray-600">
            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
              You can find your game URL at the link below. Please share this URL with the white
              player.
            </p>
            <a
              href={link}
              className="text-sm text-blue-600 underline cursor-pointer truncate hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 focus:ring-0"
              title={link}
            >
              {`${link.slice(0, 40)}...`}
            </a>
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
          {!!game && (
            <form
              onSubmit={onSubmit}
              className="w-full mx-auto bg-white shadow-md rounded-lg dark:bg-gray-700"
            >
              <div className="grid gap-6 p-6 border-b border-gray-200 dark:border-gray-600">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Amount
                    </span>
                    <span className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-400">
                      {bigIntToStr(game.satoshis)} {computer.getChain()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Opponent
                    </span>
                    <div className="relative group">
                      <span
                        title={game.publicKeyW}
                        className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-400 truncate max-w-[200px] overflow-hidden block"
                      >
                        {game.publicKeyW}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Accept
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </>
  )
}

export function StartGameModal() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search) // Parse the query string
  const serialized = queryParams.get('start-game')
  const computer = useContext(ComputerContext)
  const [game, setGame] = useState<ChessContract | null>(null)
  const [copied, setCopied] = useState(false)
  const [link, setLink] = useState('')

  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    const fetch = async () => {
      try {
        showLoader(true)
        if (serialized) {
          const tx = Transaction.deserialize(serialized)
          const { effect } = await computer.encode(tx.onChainMetaData as never)
          const { res } = effect
          const game = res as unknown as ChessContract
          setGame(game)
          Modal.showModal(startGameModal)
          showLoader(false)
        }
      } catch (error) {
        showLoader(false)
        if (error instanceof Error) {
          showSnackBar(error.message, false)
        } else {
          showSnackBar('Error occurred', false)
        }
      } finally {
        showLoader(false)
      }
    }
    fetch()
  }, [serialized, computer, showLoader, showSnackBar])

  return (
    <Modal.Component
      title={'You have been challenged'}
      content={StartGameModalContent}
      contentData={{
        serialized,
        game,
        computer,
        copied,
        setCopied,
        link,
        setLink,
      }}
      id={startGameModal}
    />
  )
}
