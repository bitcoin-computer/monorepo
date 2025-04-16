import { useContext, useState } from 'react'
import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { Computer } from '@bitcoin-computer/lib'
import { VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC } from '../constants/modSpecs'
import { ChessContractHelper } from '../../../chess-contracts/'
import { operatorPublicKey } from '../constants/consts'

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

function MintForm(props: {
  computer: Computer
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>
}) {
  const { computer: computerW, setErrorMsg } = props
  const [nameW, setName] = useState('White')
  const [nameB, setNameB] = useState('Black')
  const [publicKeyB, setSecondPlayerPublicKey] = useState(
    '03fce46d776c3e2b606aae73fcffdc8fd3a0f0c6bf1088a321f7f3c4e824623a57',
  )
  const [amount, setAmount] = useState(`0.1`)
  const [serializedTx, setSerializedTx] = useState('')
  const [copied, setCopied] = useState(false)
  const { showLoader } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)

      const publicKeyW = computerW.getPublicKey()
      const chessContractHelper = new ChessContractHelper({
        computer: computerW,
        amount: parseFloat(amount) * 1e8,
        nameW,
        nameB,
        publicKeyW,
        publicKeyB,
        operatorPublicKey,
        mod: VITE_CHESS_GAME_MOD_SPEC,
        userMod: VITE_CHESS_USER_MOD_SPEC,
      })
      const tx = await chessContractHelper.makeTx()
      setSerializedTx(`http://localhost:1032/start/${tx.serialize()}`)

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

  const handleCopy = () => {
    navigator.clipboard
      .writeText(serializedTx)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <form onSubmit={onSubmit} className="w-full lg:w-1/2">
        <div className="grid gap-6 mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Let's Play</h2>
          <p className="text-lg text-gray-500">Start a new game and invite your friend.</p>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Amount
            </label>
            <input
              type="number"
              id="name"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Your User Name
            </label>
            <input
              type="text"
              id="name"
              value={nameW}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Second Player User Name
            </label>
            <input
              type="text"
              id="name"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Second Player Public Key
            </label>
            <input
              type="text"
              id="name"
              value={publicKeyB}
              onChange={(e) => setSecondPlayerPublicKey(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Game
        </button>
      </form>

      <div className="flex flex-col items-start p-4 mt-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
        <p
          className="break-all text-sm text-blue-600 underline cursor-pointer hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 border-0 focus:ring-0"
          onClick={handleCopy}
        >
          {serializedTx}
        </p>
        <button
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </>
  )
}

export default function CreateGame() {
  const computer = useContext(ComputerContext)
  const [errorMsg, setErrorMsg] = useState('')

  return (
    <>
      <MintForm computer={computer} setErrorMsg={setErrorMsg} />
      <Modal.Component
        title={'Error'}
        content={ErrorContent}
        contentData={errorMsg}
        id={'error-modal'}
      />
    </>
  )
}
