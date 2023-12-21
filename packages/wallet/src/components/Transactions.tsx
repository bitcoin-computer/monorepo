import { initFlowbite } from "flowbite"
import { useEffect } from "react"
import { HiRefresh } from "react-icons/hi"
import TransactionTable from "./TransactionTable"

export default function Transactions() {
  useEffect(() => {
    initFlowbite()
  }, [])

  const txId = "abbacb462370d15af5ca4407b31ba7f043ff25d70aea19e255936848c00c2a5d"
  const sentTxs = [
    { txId, satoshis: 10000 },
    { txId, satoshis: 20000 },
    { txId, satoshis: 30000 },
  ]

  const receivedTxs = [
    { txId, satoshis: 10000 },
  ]

  const updateTxs = () => {}

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
            <TransactionTable txs={sentTxs} />
          </div>
          <div id="dashboard" role="tabpanel" aria-labelledby="received-tab">
            <TransactionTable txs={receivedTxs} />
          </div>
      </div>
    </>
  )
}
