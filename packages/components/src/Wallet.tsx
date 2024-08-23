import { useCallback, useContext, useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import { Computer } from "@bitcoin-computer/lib"
import { Auth } from "./Auth"
import { Drawer } from "./Drawer"
import { UtilsContext } from "./UtilsContext"
import { ComputerContext } from "./ComputerContext"
import { BalanceContext } from "./BalanceContext"

const Balance = ({
  computer,
  paymentModSpec
}: {
  computer: Computer
  paymentModSpec: string | undefined
}) => {
  const { balance, setBalance } = BalanceContext.useBalance()
  const [, setChain] = useState<string>(localStorage.getItem("CHAIN") || "LTC")
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  const refreshBalance = useCallback(async () => {
    try {
      showLoader(true)
      if (computer) {
        const publicKey = computer.getPublicKey()
        const mod = paymentModSpec
        const paymentRevs = paymentModSpec ? await computer.query({ publicKey, mod }) : []
        const payments = (await Promise.all(
          paymentRevs.map((rev: string) => computer.sync(rev))
        )) as any[]
        const amountsInPaymentToken =
          payments && payments.length
            ? payments.reduce((total, pay) => total + (pay._amount - computer.getMinimumFees()), 0)
            : 0

        const availableWalletBalance = await computer.getBalance()
        setBalance(availableWalletBalance.balance + amountsInPaymentToken)
        setChain(computer.getChain())
      }
      showLoader(false)
    } catch (err) {
      showLoader(false)
      showSnackBar("Error fetching wallet details", false)
    }
  }, [computer])

  const fund = async () => {
    await computer.faucet(1e8)
    setBalance((await computer.getBalance()).balance)
  }

  useEffect(() => {
    refreshBalance()
  }, [])

  return (
    <div
      id="dropdown-cta"
      className="relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900"
      role="alert"
    >
      <div className="text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400">
        {balance / 1e8} {computer.getChain()}{" "}
        <HiRefresh
          onClick={refreshBalance}
          className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
        />
      </div>
      <div className="text-center uppercase text-xs text-blue-800 dark:text-blue-400">
        {computer.getNetwork()}
      </div>
      {computer.getNetwork() === "regtest" && (
        <button
          type="button"
          onClick={fund}
          className="absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
        >
          Fund
        </button>
      )}
    </div>
  )
}

const Address = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Address</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
      {computer.getAddress()}
    </p>
  </div>
)

const PublicKey = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Public Key</h6>
    <p className="mb-4 text-xs font-mono text-gray-500 dark:text-gray-400 break-words">
      {computer.getPublicKey()}
    </p>
  </div>
)

const Mnemonic = ({ computer }: any) => {
  const [mnemonicShown, setMnemonicShown] = useState(false)
  return (
    <div className="mb-4">
      <h6 className="text-lg font-bold dark:text-white">
        Mnemonic&nbsp;
        <button
          onClick={() => setMnemonicShown(!mnemonicShown)}
          className="text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
        >
          {mnemonicShown ? "hide" : "show"}
        </button>
      </h6>
      <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-words">
        {mnemonicShown ? computer.getMnemonic() : ""}
      </p>
    </div>
  )
}

const Url = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Node Url</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getUrl()}
    </p>
  </div>
)

const Chain = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Chain</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getChain()}
    </p>
  </div>
)

const Network = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Network</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getNetwork()}
    </p>
  </div>
)

const LogOut = () => (
  <>
    <div className="mb-6">
      <h6 className="text-lg font-bold dark:text-white">Log out</h6>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        Logging out will delete your mnemonic. Make sure to write it down.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={Auth.logout}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
      >
        Log out
      </button>
    </div>
  </>
)

export function Wallet({ paymentModSpec }: { paymentModSpec?: string }) {
  const computer = useContext(ComputerContext)

  const Content = () => (
    <>
      <h4 className="text-2xl font-bold dark:text-white">Wallet</h4>
      <Balance computer={computer} paymentModSpec={paymentModSpec} />
      <Address computer={computer} />
      <PublicKey computer={computer} />
      <Mnemonic computer={computer} />
      {!process.env["REACT_APP_CHAIN"] && <Chain computer={computer} />}
      {!process.env["REACT_APP_NETWORK"] && <Network computer={computer} />}
      {!process.env["REACT_APP_URL"] && <Url computer={computer} />}
      <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
      <LogOut />
    </>
  )

  return <Drawer.Component Content={Content} id="wallet-drawer" />
}

export const WalletComponents = {
  Balance,
  Address,
  PublicKey,
  Mnemonic,
  Chain,
  Network,
  Url,
  LogOut
}
