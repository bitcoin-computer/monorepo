import { initFlowbite } from "flowbite"
import { useEffect, useState } from "react"
import { getComputer } from "./Login"
import { Computer } from "@bitcoin-computer/lib"
import { HiRefresh } from "react-icons/hi"
import TransactionTable from "./TransactionTable"


export const Send = () => {
  const [to, setTo] = useState<string>("")
  const [amount, setAmount] = useState<number>()
  const [computer] = useState<Computer>(getComputer())

  const transfer = async () => {
    // @ts-ignore
    if (amount && to) await computer.send(amount, to)
  }

  useEffect(() => {
    initFlowbite()
  }, [])

  const updateTxs = () => {}

  const txId = "abbacb462370d15af5ca4407b31ba7f043ff25d70aea19e255936848c00c2a5d"
  const sentTxs = [
    { txId, satoshis: 10000 },
    { txId, satoshis: 20000 },
    { txId, satoshis: 30000 },
  ]

  return (<>
    <h2 className="mb-8 text-4xl font-bold dark:text-white">{`Send ${computer.getChain()}`}</h2>

    <form className="max-w-lg">
      <div className="mb-5">
        <label htmlFor="to" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">To Address</label>
        <input value={to} onChange={(e) => setTo(e.target.value)} type="text" id="to" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
      </div>
      <div className="mb-5">
        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{`Amount (in ${computer.getChain()})`}</label>
        <input value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) * 1e8)} type="number" id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
      </div>
      <button type="submit" onClick={() => transfer()} className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Send
      </button>
    </form>

    <hr className="h-px my-12 bg-gray-200 border-0 dark:bg-gray-700" />

    <h4 className="mb-4 text-2xl font-bold dark:text-white">
      Recently Sent
      <HiRefresh onClick={updateTxs} className="w-4 h-4 ml-2 inline cursor-pointer dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-100" />
    </h4>
    <TransactionTable txs={sentTxs} />
  </>)
}
