import { initFlowbite } from "flowbite"
import { Dispatch, useCallback, useContext, useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import { Auth } from "./Auth"
import { Drawer } from "./Drawer"
import { useUtilsComponents, UtilsContext } from "./UtilsContext"
import { ComputerContext } from "./ComputerContext"
import { Computer } from "@bitcoin-computer/lib"

const Balance = ({
  computer,
  paymentModSpec
}: {
  computer: Computer
  paymentModSpec: string | undefined
}) => {
  const [balance, setBalance] = useState<number>(0)
  const [chain, setChain] = useState<string>(localStorage.getItem("CHAIN") || "LTC")
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  const refreshBalance = useCallback(async () => {
    try {
      showLoader(true)
      if (computer) {
        const paymentRevs = paymentModSpec
          ? await computer.query({
              publicKey: computer.getPublicKey(),
              mod: paymentModSpec
            })
          : []
        const payments = (await Promise.all(paymentRevs.map((rev) => computer.sync(rev)))) as any[]
        let amountsInPaymentToken = 0

        if (payments && payments.length) {
          payments.forEach((pay) => {
            amountsInPaymentToken += pay._amount - computer.getMinimumFees()
          })
        }
        let availableWalletBalance = await computer.getBalance()
        setBalance(availableWalletBalance + amountsInPaymentToken)
        setChain(computer.getChain())
      }
      showLoader(false)
    } catch (err) {
      showLoader(false)
      showSnackBar("Error fetching wallet details", false)
    }
  }, [computer])

  useEffect(() => {
    refreshBalance()
  }, [])

  return (
    <div className="mb-4">
      <h6 className="text-lg font-bold dark:text-white">
        Balance
        <HiRefresh
          onClick={refreshBalance}
          className="w-4 h-4 ml-1 inline cursor-pointer text-gray-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-100"
        />
      </h6>

      <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
        {balance / 1e8} {chain}{" "}
      </p>
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
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getPublicKey()}
    </p>
  </div>
)

const Mnemonic = ({ computer }: any) => {
  const [showMnemonic, setShowMnemonic] = useState(false)

  const Heading = () => <h6 className="text-lg font-bold dark:text-white">Mnemonic</h6>

  if (showMnemonic)
    return (
      <div className="mb-4">
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
      </div>
    )
  return (
    <div className="mb-4">
      <Heading />
      <button
        onClick={() => setShowMnemonic(true)}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
      >
        Show
      </button>
      <br />
    </div>
  )
}

const Path = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Path</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getPath()}
    </p>
  </div>
)

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

function AmountInput({
  chain,
  amount,
  setAmount
}: {
  chain: string
  amount: string
  setAmount: Dispatch<string>
}) {
  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Amount ({chain})
        </label>
      </div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={`1 ${chain}`}
        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
    </>
  )
}

function AddressInput({ address, setAddress }: { address: string; setAddress: Dispatch<string> }) {
  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          User Address
        </label>
      </div>
      <input
        value={address}
        placeholder={"Address"}
        onChange={(e) => setAddress(e.target.value)}
        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
    </>
  )
}

function SendMoneyButton({
  computer,
  amount,
  address,
  setAmount,
  setAddress,
  paymentModSpec
}: any) {
  const { showSnackBar, showLoader } = useUtilsComponents()

  const send = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const TRANSACTION_FEE = computer.getMinimumFees()
    try {
      if (!Auth.isLoggedIn()) throw new Error("Please log in first.")
      if (!address) {
        showSnackBar("Please enter a valid address", false)
        return
      }
      const floatAmount = Math.round(Number(amount))
      if (!floatAmount) {
        showSnackBar("Please enter a valid amount", false)
        return
      }

      let availableWalletBalance = await computer.getBalance()
      const requiredAmountToBeTransferred = floatAmount * 1e8
      if (requiredAmountToBeTransferred + TRANSACTION_FEE < availableWalletBalance) {
        await computer.send(requiredAmountToBeTransferred, address)
      } else {
        const paymentRevs = paymentModSpec
          ? await computer.query({
              publicKey: computer.getPublicKey(),
              mod: paymentModSpec
            })
          : []
        const payments = (await Promise.all(
          paymentRevs.map((rev: string) => computer.sync(rev))
        )) as any[] // should import payment class

        let amountsInPaymentToken = 0

        if (payments && payments.length) {
          payments.forEach((pay) => {
            amountsInPaymentToken += pay._amount - TRANSACTION_FEE
          })
        }

        if (
          requiredAmountToBeTransferred + TRANSACTION_FEE >
          availableWalletBalance + amountsInPaymentToken
        ) {
          showSnackBar(`Insufficient Balance.`, false)
          setAmount("")
          setAddress("")
          return
        }

        const sortedPayments = payments.slice().sort((a, b) => b._amount - a._amount)
        const paymentsToBeWithdraw = []
        let newAvailableAmount = 0
        for (let i = 0; i < sortedPayments.length; i++) {
          const pay = sortedPayments[i]
          newAvailableAmount += pay._amount - TRANSACTION_FEE
          paymentsToBeWithdraw.push(pay.setAmount(TRANSACTION_FEE))
          if (
            requiredAmountToBeTransferred + TRANSACTION_FEE <
            availableWalletBalance + newAvailableAmount
          ) {
            break
          }
        }

        await Promise.all(paymentsToBeWithdraw)
        await computer.send(requiredAmountToBeTransferred, address)
      }

      showSnackBar(`${amount} ${computer.getChain()} trasferred successfully.`, true)
      setAmount("")
      setAddress("")
    } catch (error) {
      if (error instanceof Error) {
        showSnackBar(error.message, false)
      }
      return
    }
  }

  return (
    <>
      <button
        onClick={async (e) => {
          try {
            showLoader(true)
            await send(e)
            showLoader(false)
          } catch (error) {
            showLoader(false)
          }
        }}
        type="submit"
        className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Send (To Address)
      </button>
    </>
  )
}

function SendMoneyForm({
  computer,
  paymentModSpec
}: {
  computer: any
  paymentModSpec: string | undefined
}) {
  const [address, setAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("")

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <h6 className="text-lg font-bold dark:text-white">Transfer</h6>
      <div className="space-y-4">
        <form className="space-y-6">
          <div>
            <AddressInput address={address} setAddress={setAddress} />
            <AmountInput chain={computer.getChain()} amount={amount} setAmount={setAmount} />
          </div>
        </form>
      </div>
      <div className="flex items-center pt-4 rounded-b dark:border-gray-600">
        <SendMoneyButton
          address={address}
          amount={amount}
          computer={computer}
          paymentModSpec={paymentModSpec}
          setAddress={setAddress}
          setAmount={setAmount}
        />
      </div>
    </>
  )
}

function FaucetForm({ computer }: { computer: Computer }) {
  const [amount, setAmount] = useState<string>("")

  useEffect(() => {
    initFlowbite()
  }, [])

  const { showLoader } = useUtilsComponents()

  return (
    <>
      <h6 className="text-lg font-bold dark:text-white">Fund Your Wallet</h6>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        Click below to get 1 free regtest coin (Click the balance reload button after funding).
      </p>
      <div className="flex items-center pt-4 rounded-b dark:border-gray-600">
        <button
          onClick={async (e) => {
            try {
              showLoader(true)
              await computer.faucet(1e8)
              showLoader(false)
            } catch (error) {
              showLoader(false)
            }
          }}
          type="submit"
          className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Fund
        </button>
      </div>
    </>
  )
}

export function Wallet({ paymentModSpec }: { paymentModSpec?: string }) {
  const computer = useContext(ComputerContext)

  const Content = () => (
    <>
      <h4 className="mb-8 text-2xl font-bold dark:text-white">Wallet</h4>
      <Balance computer={computer} paymentModSpec={paymentModSpec} />
      <Address computer={computer} />
      <PublicKey computer={computer} />
      <Path computer={computer} />
      <Mnemonic computer={computer} />
      <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
      <Chain computer={computer} />
      <Network computer={computer} />
      <Url computer={computer} />
      {computer.getNetwork() === "regtest" && (
        <>
          <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
          <FaucetForm computer={computer} />
        </>
      )}
      <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
      <SendMoneyForm computer={computer} paymentModSpec={paymentModSpec} />
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
  Path,
  Mnemonic,
  Chain,
  Network,
  Url,
  SendMoneyForm,
  LogOut
}
