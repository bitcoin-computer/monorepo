import { initFlowbite } from "flowbite"
import { useEffect, useState } from "react"

import { chunk } from "../../utils"

export const Transfer = ({ id, computer }: any) => {
  const [to, setTo] = useState<string | undefined>()
  const [amount, setAmount] = useState<string | undefined>()

  function Card({ content }: { content: string }) {
    return (
      <div className="mt-2 mb-2 block max-w-sm p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <pre className="font-normal text-gray-500 dark:text-gray-400 text-xm">{content}</pre>
      </div>
    )
  }

  const transferFund = async () => {
    if (amount && to) {
      console.log(parseFloat(amount) * 1e8, to)
      const txId = await computer.send(parseFloat(amount) * 1e8, to)
      const message = `Sent\n${amount}\n\nTo\n${to}\n\nTransaction id\n${txId}`
      console.log(message)
      alert(message)
    }
  }

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <span className="bg-gray-900/50 dark:bg-gray-900/80 sr-only"></span>
      <div
        id={`drawer-${id}`}
        className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-white w-96 dark:bg-gray-800"
        tabIndex={-1}
        aria-labelledby={`drawer-${id}-label`}
        aria-hidden="true"
      >
        <h5
          id={`drawer-label-${id}`}
          className="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          <svg
            className="me-2 h-5 w-5"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            ></path>
          </svg>
          Transfer
        </h5>
        <button
          type="button"
          data-drawer-hide={`drawer-${id}`}
          aria-controls={`drawer-${id}`}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="mb-6">
          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">To</span>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Public Key of Receiver"
            required
          />
          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Amount
          </span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Amount"
            required
          />
          <button
            type="button"
            onClick={() => transferFund()}
            className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}
