import { useState } from "react"
import { Auth, Modal } from "@bitcoin-computer/components"
import { TBC721 } from "@bitcoin-computer/TBC721"
import { Link } from "react-router-dom"
import { nftModSpec } from "../constants/modSpecs"

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
            nft
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
  const [computer] = useState(Auth.getComputer())
  const [successRev, setSuccessRev] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const tbc721 = new TBC721(computer, nftModSpec)
      const nft = await tbc721.mint("vivek", "TBC")
      setSuccessRev(nft._id)
      Modal.showModal("success-modal")
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
        Modal.showModal("error-modal")
      }
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="w-full">
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Bitcoin Computer"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Symbol
            </label>
            <input
              type="text"
              id="symbol"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="TBC"
              required
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
