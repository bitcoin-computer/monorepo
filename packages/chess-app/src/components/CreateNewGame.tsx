import { useContext, useState } from "react"
import { ComputerContext, Modal, UtilsContext } from "@bitcoin-computer/components"
import { Link } from "react-router-dom"
import { Computer } from "@bitcoin-computer/lib"
import { VITE_CHESS_GAME_MOD_SPEC } from "../constants/modSpecs"
import { getSecret as getHash } from "../services/secret.service"
import { ChessGameHelper } from "../contracts/chess-game"

function SuccessContent(id: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div>
          Congratiolations! You have created a new game. Click{" "}
          <Link
            to={`/game/${id}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal("success-modal")
            }}
          >
            here
          </Link>{" "}
          to start playing it.
        </div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => Modal.hideModal("success-modal")}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  )
}

function ErrorContent(msg: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div>
          Something went wrong.
          <br />
          <br />
          {msg}
        </div>
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

function MintForm(props: {
  computer: Computer
  setSuccessRev: React.Dispatch<React.SetStateAction<string>>
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>
}) {
  const { computer: computerW, setSuccessRev, setErrorMsg } = props
  const [nameW, setName] = useState("W")
  const [publicKeyB, setSecondPlayerPublicKey] = useState("0272ccb97e82d62703bae213d3da4d3b2878ee302b0c1760c50d089c4bf383a041")
  const [nameB, setNameB] = useState("B")
  const [amount, setAmount] = useState(`0.1`)
  const [serializedTx, setSerializedTx] = useState('')
  const { showLoader } = UtilsContext.useUtilsComponents()

  // const secretHashW = ''
  // const secretHashB = ''

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const secretHashW = await getHash()
      const secretHashB = await getHash()

      if (!secretHashW || !secretHashB) throw new Error('Could not obtain hash from server')

      const publicKeyW = computerW.getPublicKey()
      const chessGameHelper = new ChessGameHelper(computerW,
        nameW,
        nameB,
        parseFloat(amount) * 1e8,
        publicKeyW,
        publicKeyB,
        secretHashW,
        secretHashB,
        VITE_CHESS_GAME_MOD_SPEC
      )
      const tx = await chessGameHelper.makeTx()

      console.log('transaction', tx.serialize())



      // setSuccessRev(effect.res?._id)
      // await createGame({
      //   gameId: effect.res?._id,
      //   publicKeyW: computerW.getPublicKey(),
      //   publicKeyB: publicKeyB
      // })

      showLoader(false)
      Modal.showModal("success-modal")
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
    </>
  )
}

export default function CreateNewGame() {
  const computer = useContext(ComputerContext)
  const [successRev, setSuccessRev] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  return (
    <>
      <MintForm computer={computer} setSuccessRev={setSuccessRev} setErrorMsg={setErrorMsg} />
      <Modal.Component
        title={"Success"}
        content={SuccessContent}
        contentData={successRev}
        id={"success-modal"}
      />
      <Modal.Component
        title={"Error"}
        content={ErrorContent}
        contentData={errorMsg}
        id={"error-modal"}
      />
    </>
  )
}
