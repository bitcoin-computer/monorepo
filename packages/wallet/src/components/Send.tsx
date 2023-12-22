import { initFlowbite } from "flowbite"
import { useEffect, useState } from "react"
import { getComputer } from "@bitcoin-computer/components"
import { Computer } from "@bitcoin-computer/lib"
import { HiRefresh } from "react-icons/hi"
import TransactionTable from "./TransactionTable"
import SnackBar from "./SnackBar"
import { TableTxs } from "../types/common"

export function SentTransactions({ computer }: { computer: Computer }) {
  const [txs, setTxs] = useState<TableTxs>({ sentTxs: [], receivedTxs: [] })

  const updateTxs = async () => {
    // @ts-ignore
    setTxs(await computer.listTxs())
  }

  useEffect(() => {
    updateTxs()
  }, [])

  return <>
    <h4 className="mb-4 text-2xl font-bold dark:text-white">
      Recently Sent
      <HiRefresh onClick={updateTxs} className="w-4 h-4 ml-2 inline cursor-pointer dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-100" />
    </h4>
    <TransactionTable txs={txs.sentTxs} />
  </>
}

export function SendForm({ computer }: { computer: Computer }) {
  const [to, setTo] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [fee, setFee] = useState<string>('2')
  const [message, setMessage] = useState<string>('')
  const [show, setShow] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    initFlowbite()
  }, [])

  const transfer = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    // @ts-ignore
    computer.setFee(Number(fee))
    try {
      // @ts-ignore
      const txId = await computer.send(Number(amount) * 1e8, to)
      setMessage(`Sent ${amount} ${computer.getChain()} to ${to} via transaction ${txId}`)
      setSuccess(true)
      setShow(true)
    } catch(err) {
      setMessage(`Something went wrong ${err instanceof Error ? err.message : ''}`)
      setSuccess(false)
      setShow(true)
    }
  }

  useEffect(() => {
    initFlowbite()
  }, [])

  return <>
    <h2 className="mb-8 text-4xl font-bold dark:text-white">{`Send ${computer.getChain()}`}</h2>

    <form className="max-w-lg">
      <div className="mb-5">
        <label htmlFor="to" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          To Address
        </label>
        <input value={to} onChange={(e) => setTo(e.target.value)} type="text" id="to" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
      </div>
      <div className="mb-5">
        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {`Amount (in ${computer.getChain()})`}
        </label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
      </div>
      <div className="mb-5">
        <label htmlFor="fee" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Fee (satoshi per byte)
        </label>
        <input value={fee} onChange={(e) => setFee(e.target.value)} id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
      </div>
      <button type="submit" onClick={transfer} className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Send
      </button>
    </form>
    {show && <SnackBar message={message} success={success} setShow={setShow} />}
  </>
}

export const Send = () => {
  const [computer] = useState<Computer>(getComputer())

  return (<>
    <SendForm computer={computer} />
    <hr className="h-px my-12 bg-gray-200 border-0 dark:bg-gray-700" />
    <SentTransactions computer={computer} />
  </>)
}
