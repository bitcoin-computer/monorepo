import { initFlowbite } from "flowbite"
import { useCallback, useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import { chunk } from "../../utils"

export const CustomDrawer = ({ id, computer }: any) => {
  const [balance, setBalance] = useState<number>(0)
  const [showMnemonic, setShowMnemonic] = useState(false)

  function Card({ content }: { content: string }) {
    return (
      <div className="mt-2 mb-2 block max-w-sm p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <pre className="font-normal text-gray-500 dark:text-gray-400 text-xm">{content}</pre>
      </div>
    )
  }

  const logout = () => {
    localStorage.removeItem("BIP_39_KEY")
    localStorage.removeItem("CHAIN")
    window.location.href = "/"
  }

  const mnemonicWell = () => {
    const mnemonicChunks = chunk(computer.getMnemonic().split(" "))
    const mnemonicChunksString = mnemonicChunks.map((chunk) => chunk.join(" ") + "\n").join(" ")
    return (
      <>
        <Card content={" " + mnemonicChunksString} />
        <button
          onClick={() => setShowMnemonic(false)}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Hide Mnemonic
        </button>
      </>
    )
  }

  const showMnemonicLink = () => (
    <>
      <button
        onClick={() => setShowMnemonic(true)}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        Show Mnemonic
      </button>
      <br />
    </>
  )

  useEffect(() => {
    initFlowbite()
  }, [])

  const refreshBalance = useCallback(async () => {
    try {
      if (computer) setBalance(await computer.getBalance())
    } catch (err) {
      console.log("Error fetching wallet details", err)
    }
  }, [computer])

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
          Wallet
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
          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Balance
          </span>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {balance / 1e8} LTC
            <HiRefresh
              onClick={refreshBalance}
              className="w-4 h-4 mb-1 ml-2 inline hover:text-slate-500 cursor-pointer"
            ></HiRefresh>
          </p>
        </div>
        <div className="mb-6">
          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Address
          </span>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{computer.getAddress()}</p>
        </div>
        <div className="mb-6">
          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Public Key
          </span>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 break-words">
            {computer.getPublicKey()}
          </p>
        </div>
        <div className="mb-6">
          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Mnenonic
          </span>
          {showMnemonic ? mnemonicWell() : showMnemonicLink()}
        </div>
        <div className="mb-6">
          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Log out
          </span>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Logging out will delete your mnemonic, make sure to write it down before logging out.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={logout}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  )
}
