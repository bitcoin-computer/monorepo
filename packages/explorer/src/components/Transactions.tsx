import { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ComputerContext, InlineAlert } from '@bitcoin-computer/components'
import { formatUnixTime, truncateHex, unwrapRpcResult } from '../utils/rpc'

type TxRow = {
  txid: string
  blockHeight: number
  blockHash: string
  time?: number
  indexInBlock: number
}

/** How many tip blocks to scan for recent txs (keep small for public RPC). */
const RECENT_BLOCKS = 3
const MAX_ROWS = 40

export default function Transactions() {
  const computer = useContext(ComputerContext)
  const [rows, setRows] = useState<TxRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tipHeight, setTipHeight] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const infoRes = await computer.rpc('getblockchaininfo', '')
      const info = unwrapRpcResult<{ blocks: number }>(infoRes)
      const tip = Number(info?.blocks) || 0
      setTipHeight(tip)
      if (tip <= 0) {
        setRows([])
        return
      }

      const collected: TxRow[] = []
      const from = tip
      const to = Math.max(0, tip - RECENT_BLOCKS + 1)

      for (let height = from; height >= to && collected.length < MAX_ROWS; height--) {
        try {
          const hashRes = await computer.rpc('getblockhash', `${height}`)
          const hash = String(unwrapRpcResult(hashRes) ?? '')
          if (!hash) continue

          const blockRes = await computer.rpc('getblock', `${hash} 1`)
          const block = unwrapRpcResult<{
            hash: string
            height: number
            time: number
            tx?: string[]
          }>(blockRes)
          const txids = Array.isArray(block?.tx) ? block.tx : []
          // Newest txs first within block: reverse index order (coinbase last visually after others)
          for (let i = txids.length - 1; i >= 0 && collected.length < MAX_ROWS; i--) {
            collected.push({
              txid: txids[i],
              blockHeight: block?.height ?? height,
              blockHash: block?.hash || hash,
              time: block?.time,
              indexInBlock: i,
            })
          }
        } catch {
          // skip failed block; keep listing others
        }
      }

      setRows(collected)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading transactions')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [computer])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recent confirmed transactions
            {tipHeight > 0 ? ` from the last ${RECENT_BLOCKS} blocks (tip #${tipHeight})` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
        >
          Refresh
        </button>
      </header>

      {error ? <InlineAlert variant="error">{error}</InlineAlert> : null}

      {loading ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse space-y-0">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-10 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40"
            />
          ))}
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Transaction
                </th>
                <th scope="col" className="px-3 py-2">
                  Block
                </th>
                <th scope="col" className="px-3 py-2">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.blockHash}:${row.txid}`}
                  className="bg-white border-b last:border-0 dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link
                      to={`/transactions/${row.txid}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      title={row.txid}
                    >
                      <span className="sm:hidden">{truncateHex(row.txid, 10, 8)}</span>
                      <span className="hidden sm:inline">{truncateHex(row.txid, 16, 12)}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    <Link
                      to={`/block/${row.blockHash}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      #{row.blockHeight}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {formatUnixTime(row.time)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !error ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-sm text-gray-500">
                    No recent transactions
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length > 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing up to {MAX_ROWS} txs from the last {RECENT_BLOCKS} blocks. Open a block for its
          full transaction list.
        </p>
      ) : null}
    </div>
  )
}
