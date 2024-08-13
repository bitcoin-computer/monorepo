import { useContext, useState } from "react"
import { ComputerContext, Modal, UtilsContext } from "@bitcoin-computer/components"
import { TBC20 } from "@bitcoin-computer/TBC20"
import { Link } from "react-router-dom"
import { REACT_APP_TOKEN_MOD_SPEC } from '../constants/modSpecs'

function SuccessContent(rev: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div>
          You created a{" "}
          <Link
            to={`/objects/${rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal("success-modal")
            }}
          >
            counter
          </Link>
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

export default function Mint() {
  const computer = useContext(ComputerContext)
  const [successRev, setSuccessRev] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [amount, setAmount] = useState("")
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const { showLoader } = UtilsContext.useUtilsComponents()


  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const tbc20 = new TBC20(computer, REACT_APP_TOKEN_MOD_SPEC)
      const mintId = await tbc20.mint(computer.getPublicKey(), parseInt(amount, 10), name, symbol)
      setSuccessRev(mintId || '')
      showLoader(false)
      Modal.showModal("success-modal")
    } catch (err) { 
      showLoader(false)
      if (err instanceof Error) {
        setErrorMsg(err.message)
        Modal.showModal("error-modal")
      }
    }
  }

  return (
    <>
    <form onSubmit={onSubmit} className="w-full lg:w-1/2">
      <div className="grid gap-6 mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Mint NFT</h2>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Symbol
          </label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Supply
          </label>
          <input
            type="text"
            id="imageUrl"
            value={amount}
            onChange={(e) => { setAmount(e.target.value) }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Mint NFT
      </button>
    </form>
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
