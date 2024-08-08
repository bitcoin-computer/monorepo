import { initFlowbite } from "flowbite"
import { useEffect, useState } from "react"
import { Auth, BalanceContext, UtilsContext } from "@bitcoin-computer/components"
import { Computer } from "@bitcoin-computer/lib"

export function FaucetForm({ computer }: { computer: Computer }) {
  const [amount, setAmount] = useState<string>("")
  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()
  const { setBalance } = BalanceContext.useBalance()

  useEffect(() => {
    initFlowbite()
  }, [])

  const fundWallet = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    try {
      showLoader(true)
      await computer.faucet(Number(amount) * 1e8)
      setBalance(await computer.getBalance())
      showLoader(false)
      showSnackBar(`${amount} ${computer.getChain()} funded to your wallet`, true)
    } catch (err) {
      showLoader(false)
      showSnackBar(`Something went wrong ${err instanceof Error ? err.message : ""}`, false)
    }
  }

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <h2 className="mb-8 text-4xl font-bold dark:text-white">{`Fund Your Wallet`}</h2>

      <form className="max-w-lg">
        <div className="mb-5">
          <label
            htmlFor="amount"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            {`Amount (in ${computer.getChain()})`}
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            id="amount"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          onClick={fundWallet}
          className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Fund
        </button>
      </form>
    </>
  )
}

export const Faucet = () => {
  const [computer] = useState<Computer>(Auth.getComputer())

  return (
    <>
      <FaucetForm computer={computer} />
    </>
  )
}
