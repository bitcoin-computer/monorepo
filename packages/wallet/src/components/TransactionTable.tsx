import type { TableTx } from '../types/common'

function TranactionRow({ tx }: { tx: TableTx }) {
  return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        {tx.txId}
    </th>
    <td className="px-6 py-4">
        {tx.satoshis / 1e8}
    </td>
  </tr>
}

export default function TransactionTable({ txs }: { txs: TableTx[] }) {
  return <div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Transaction Id
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {txs.map((tx) => <TranactionRow tx={tx} key={tx.txId} />)}
        </tbody>
    </table>
  </div>
}