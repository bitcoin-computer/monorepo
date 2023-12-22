import { initFlowbite } from "flowbite"
import { useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import TransactionTable from "./TransactionTable"
import { getComputer } from "./Login"
import { TableTxs } from "../types/common"

export default function Transactions() {
  const [computer] = useState(getComputer())
  const [txs, setTxs] = useState<TableTxs>({ sentTxs: [], receivedTxs: [] })

  const updateTxs = async () => {
    // @ts-ignore
    setTxs(await computer.listTxs())
  }

  useEffect(() => {
    initFlowbite()
    updateTxs()
  }, [])

  return (
    <>
      <div className="flex justify-between">
        <h2 className="mb-8 text-4xl font-bold dark:text-white">
          Transactions
          <HiRefresh onClick={updateTxs} className="w-6 h-6 ml-4 inline cursor-pointer dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-100" />
        </h2>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">
          <li className="me-2" role="presentation">
            <button className="inline-block p-4 border-b-2 rounded-t-lg" id="sent-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
              Sent
            </button>
          </li>
          <li className="me-2" role="presentation">
            <button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="received-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">
              Received
            </button>
          </li>
        </ul>
      </div>

      <div id="default-tab-content">
          <div id="profile" role="tabpanel" aria-labelledby="sent-tab">
            <TransactionTable txs={txs.sentTxs} />
          </div>
          <div id="dashboard" role="tabpanel" aria-labelledby="received-tab">
            <TransactionTable txs={txs.receivedTxs} />
          </div>
      </div>
    </>
  )
}
