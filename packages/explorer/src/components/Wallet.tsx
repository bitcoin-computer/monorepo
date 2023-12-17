import { initFlowbite } from "flowbite"
import { useCallback, useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"

const Balance = ({ refreshBalance, balance }: any) => (<div className="mb-6">
  <span className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
    Balance
    <HiRefresh
      onClick={refreshBalance}
      className="w-4 h-4 ml-1 inline cursor-pointer text-gray-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-100"
    ></HiRefresh>
  </span>
  <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
    {balance / 1e8} LTC
  </p>
  </div>)

const Address = ({ computer }: any) => (<div className="mb-6">
    <span className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
      Address
    </span>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
      {computer.getAddress()}
    </p>
  </div>)

const PublicKey = ({ computer }: any) => (<div className="mb-6">
    <span className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
      Public Key
    </span>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getPublicKey()}
    </p>
  </div>)

const Mnemonic = ({ computer, showMnemonic, setShowMnemonic }: any) => {
  const Heading = () => (<span className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
    Mnemonic
  </span>)

  if (showMnemonic) return (<div className="mb-6">
    <Heading />
    <p className="mb-1 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getMnemonic()}
    </p>

    <button
      onClick={() => setShowMnemonic(false)}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
    >
      Hide
    </button>
  </div>)
  else return (<div className="mb-6">
    <Heading />
    <button
      onClick={() => setShowMnemonic(true)}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
    >
      Show
    </button>
    <br />
  </div>)
}

const LogOut = ({ logout }: any) => (<>
  <div className="mb-6">
    <span className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
      Log out
    </span>
    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
      Logging out will delete your mnemonic, make sure to write it down before logging out.
    </p>
  </div><div className="grid grid-cols-2 gap-4">
    <button
      onClick={logout}
      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
    >
      Log out
    </button>
  </div>
</>)

export default function Wallet({ id, computer }: any) {
  const [balance, setBalance] = useState<number>(0)
  const [showMnemonic, setShowMnemonic] = useState(false)

  const logout = () => {
    localStorage.removeItem("BIP_39_KEY")
    localStorage.removeItem("CHAIN")
    window.location.href = "/"
  }

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
          className="mb-8 text-lg font-bold dark:text-white"
        >
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

        <Balance refreshBalance={refreshBalance} balance={balance} />
        <Address computer={computer} />
        <PublicKey computer={computer} />
        <Mnemonic computer={computer} showMnemonic={showMnemonic} setShowMnemonic={setShowMnemonic} />
        <LogOut logout={logout} />
      </div>
    </>
  )
}
