import { useContext, useState } from "react"
import { ComputerContext, Modal, UtilsContext } from "@bitcoin-computer/components"
import { Computer, Transaction } from "@bitcoin-computer/lib"
import { useParams } from "react-router-dom"
import { ChessContract, ChessContractHelper } from "../contracts/chess-contract"
import { VITE_CHESS_GAME_MOD_SPEC } from "../constants/modSpecs"

function ErrorContent(msg: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        Something went wrong.<br />{msg}
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => {
            Modal.hideModal("error-modal")
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
      console.log('on submit')
      if (!serialized) throw new Error('Invalid link')

      const tx = Transaction.deserialize(serialized)
      const { effect } = await computer.encode(tx.onChainMetaData as never)
      const { res } = effect
      const game = res as unknown as ChessContract
      const chessContractHelper = ChessContractHelper.fromContract(game, computer, VITE_CHESS_GAME_MOD_SPEC)
      const txId = await chessContractHelper.completeTx(tx)
      setLink(`http://localhost:1032/game/${txId}:0`)
      showLoader(false)
    } catch (err) {
      console.log('Err', err)
      showLoader(false)
      if (err instanceof Error) {
        if(err.message.startsWith('Failed to load module')) setErrorMsg("Run 'npm run deploy' to deploy the smart contracts.")
        else setErrorMsg(err.message)
        Modal.showModal("error-modal")
      }
    }
  }

  const handleCopy = (e: React.SyntheticEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(link)
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
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

      </form>
    </>
  )
}

export default function StartGame() {
  const computer = useContext(ComputerContext)
  const [errorMsg, setErrorMsg] = useState("")

  return (
    <>
      <StartForm computer={computer} setErrorMsg={setErrorMsg} />
      <Modal.Component
        title={"Error"}
        content={ErrorContent}
        contentData={errorMsg}
        id={"error-modal"}
      />
    </>
  )
}
