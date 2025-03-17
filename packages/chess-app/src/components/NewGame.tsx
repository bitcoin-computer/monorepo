import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { ChessContractHelper, NotEnoughFundError } from '@bitcoin-computer/chess-contracts'
import { useContext, useState } from 'react'
import { getHash } from '../services/secret.service'
import { VITE_CHESS_GAME_MOD_SPEC } from '../constants/modSpecs'
import { Transaction } from '@bitcoin-computer/lib'

export const newGameModal = 'new-game-modal'

function NewGameModalContent({
  nameW,
  nameB,
  publicKeyB,
  setSecondPlayerPublicKey,
  amount,
  setAmount,
  copied,
  setCopied,
  serializedTx,
  setSerializedTx,
}: {
  nameW: string
  setName: React.Dispatch<React.SetStateAction<string>>
  nameB: string
  setNameB: React.Dispatch<React.SetStateAction<string>>
  publicKeyB: string
  setSecondPlayerPublicKey: React.Dispatch<React.SetStateAction<string>>
  amount: string
  setAmount: React.Dispatch<React.SetStateAction<string>>
  copied: boolean
  setCopied: React.Dispatch<React.SetStateAction<boolean>>
  serializedTx: string
  setSerializedTx: React.Dispatch<React.SetStateAction<string>>
}) {
  const computerW = useContext(ComputerContext)

  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()

  const handleCopy = () => {
    navigator.clipboard
      .writeText(serializedTx)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))

    setTimeout(() => setCopied(false), 2000)
  }

  const createNewGame = async () => {
    const secretHashW = await getHash()
    const secretHashB = await getHash()

    if (!secretHashW || !secretHashB) throw new Error('Could not obtain hash from server')

    const publicKeyW = computerW.getPublicKey()
    const chessContractHelper = new ChessContractHelper({
      computer: computerW,
      amount: BigInt(parseFloat(amount) * 1e8),
      nameW,
      nameB,
      publicKeyW,
      publicKeyB,
      secretHashW,
      secretHashB,
      mod: VITE_CHESS_GAME_MOD_SPEC,
    })
    return await chessContractHelper.makeTx()
  }

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      let tx: Transaction | undefined
      const { balance } = await computerW.getBalance()
      try {
        // Try to create transactoin
        tx = await createNewGame()
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === NotEnoughFundError &&
          balance > parseFloat(amount) * 1e8
        ) {
          // Try to combine the UTXOs in a single UTXO
          await computerW.send(BigInt(parseFloat(amount) * 1e8), computerW.getAddress())
          tx = await createNewGame()
        } else {
          if (error instanceof Error) {
            throw new Error(error.message)
          } else {
            throw new Error('Error occurred!')
          }
        }
      }
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
      {serializedTx ? (
        <div className="flex flex-col items-start border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-700">
          <div className="relative group w-full p-6 border-b border-gray-200 dark:border-gray-600">
            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
              Share this link with your opponent to start the game.
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
