import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import { useParams } from 'react-router-dom'
import { ChessContract, ChessContractHelper } from '../../../chess-contracts/'
import { VITE_CHESS_GAME_MOD_SPEC } from '../constants/modSpecs'

const startGameModal = 'start-game-modal'

function ErrorContent(msg: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        Something went wrong.
        <br />
        {msg}
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => {
            Modal.hideModal('error-modal')
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  )
}

function StartForm(props: {
  computer: Computer
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>
}) {
  const { computer, setErrorMsg } = props
  const { serialized } = useParams()
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  const { showLoader } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      if (!serialized) throw new Error('Invalid link')

      const tx = Transaction.deserialize(serialized)
      const { effect } = await computer.encode(tx.onChainMetaData as never)
      const { res } = effect
      const game = res as unknown as ChessContract
      const chessContractHelper = ChessContractHelper.fromContract(
        computer,
        game,
        VITE_CHESS_GAME_MOD_SPEC,
      )
      const txId = await chessContractHelper.completeTx(tx)
      setLink(`http://localhost:1032/game/${txId}:0`)
      showLoader(false)
    } catch (err) {
      console.log('Err', err)
      showLoader(false)
      if (err instanceof Error) {
        if (err.message.startsWith('Failed to load module'))
          setErrorMsg("Run 'npm run deploy' to deploy the smart contracts.")
        else setErrorMsg(err.message)
        Modal.showModal('error-modal')
      }
    }
  }

  const handleCopy = (e: React.SyntheticEvent) => {
    e.preventDefault()
    navigator.clipboard
      .writeText(link)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <form onSubmit={onSubmit} className="w-full lg:w-1/2">
        <button
          type="submit"
          className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Start Game
        </button>

        <div className="flex flex-col items-start p-4 mt-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          <p
            className="break-all text-sm text-blue-600 underline cursor-pointer hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 border-0 focus:ring-0"
            onClick={handleCopy}
          >
            {link}
          </p>
          <button
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </form>
    </>
  )
}

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
  copied: any
  setCopied: any
  link: any
  setLink: any
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
      )
      const txId = await chessContractHelper.completeTx(tx)
      setLink(`http://localhost:1032/game/${txId}:0`)
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
      {!!link ? (
        <div className="flex flex-col items-start border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-700">
          <div className="relative group w-full p-6 border-b border-gray-200 dark:border-gray-600">
            <p
              className="text-sm text-blue-600 underline cursor-pointer truncate hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 focus:ring-0"
              onClick={handleCopy}
              title="Click to copy the link"
            >
              {/* Dynamically show truncated content */}
              {`${link.slice(0, 50)}...`}
            </p>
            {/* Show full link on hover */}
            <span className="absolute z-10 hidden group-hover:block bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 max-w-xs break-words">
              {link}
            </span>
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
                    <span className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-200">
                      {game.amount / 1e8} {computer.getChain()}
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
                        className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-200 truncate max-w-[200px] overflow-hidden block"
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
        if (serialized) {
          showLoader(true)
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
  }, [serialized])

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

export default function StartGame() {
  const computer = useContext(ComputerContext)
  const [errorMsg, setErrorMsg] = useState('')

  return (
    <>
      <StartForm computer={computer} setErrorMsg={setErrorMsg} />
      <Modal.Component
        title={'Error'}
        content={ErrorContent}
        contentData={errorMsg}
        id={'error-modal'}
      />
      <StartGameModal />
    </>
  )
}
