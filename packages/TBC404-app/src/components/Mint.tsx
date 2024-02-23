import { useState } from "react"
import { Auth, Modal } from "@bitcoin-computer/components"
import { Token } from "../contracts/token"
import { Link } from "react-router-dom"

function SuccessContent(rev: string) {
  return <>
    <div className="p-4 md:p-5">
      <div>
        You created a <Link
          to={`/objects/${rev}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          onClick={() => {
            Modal.hideModal("success-modal")
          }}
        >404 token</Link>.
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
}

function ErrorContent(msg: string) {
  return <>
    <div className="p-4 md:p-5">
      <div>
        Something went wrong.<br /><br />
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
}

export default function Mint() {
  const [computer] = useState(Auth.getComputer())
  const [successRev, setSuccessRev] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    const target = e.target as typeof e.target & {
      supply: { value: string }
      img: { value: string }
      name: { value: string }
      symbol: { value: string }
    }
    const img = target.img.value
    const supply = parseInt(target.supply.value, 10)
    const name = target.name.value
    const symbol = target.symbol.value

    try {
      const counter = await computer.new(Token, [computer.getPublicKey(), img, supply, supply, name, symbol])
      setSuccessRev(counter._id)
      Modal.showModal('success-modal')
    } catch(err) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
        Modal.showModal('error-modal')
      }
    }
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="mb-5">
          <label htmlFor="supply" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Supply</label>
          <input defaultValue="100" type="text" id="supply" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        <div className="mb-5">
          <label htmlFor="img" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image Link</label>
          <input defaultValue="abc" type="text" id="img" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
          <input defaultValue="abc" type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        <div className="mb-5">
          <label htmlFor="symbol" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Symbol</label>
          <input defaultValue="abc" type="text" id="symbol" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        <button type="submit" className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Mint Token</button>
      </form>
      <Modal.Component title={"Success"} content={SuccessContent} contentData={successRev} id={"success-modal"} />
      <Modal.Component title={"Error"} content={ErrorContent} contentData={errorMsg} id={"error-modal"} />
    </>
  )
}