import { useCallback, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import { Drawer } from "./Drawer"
import { getComputer, logout } from "./Login"

const Balance = ({ computer }: any) => {
  const [balance, setBalance] = useState<number>(0)

  const refreshBalance = useCallback(async () => {
    try {
      if (computer) setBalance(await computer.getBalance())
    } catch (err) {
      console.log("Error fetching wallet details", err)
    }
  }, [computer])

  return <div className="mb-6">
      <span className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
        Balance
        <HiRefresh
          onClick={refreshBalance}
          className="w-4 h-4 ml-1 inline cursor-pointer text-gray-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-100"
        />
      </span>
      <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
        {balance / 1e8} LTC
      </p>
    </div>
  }

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

const Mnemonic = ({ computer }: any) => {
  const [showMnemonic, setShowMnemonic] = useState(false)

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

const LogOut = () => {
  return <>
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
  </>
}

export default function Wallet() {
  const [computer] = useState(getComputer())

  const Content = () => <>
    <h4 className="mb-8 text-2xl font-bold dark:text-white">Wallet</h4>
    <Balance computer={computer} />
    <Address computer={computer} />
    <PublicKey computer={computer} />
    <Mnemonic computer={computer} />
    <LogOut />
  </>

  return <Drawer Content={Content} id="wallet-drawer" />
}
