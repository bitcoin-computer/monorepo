import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ComputerContext, InlineAlert } from '@bitcoin-computer/components'
import { formatTime, getBlock, getBlockHashAtHeight, getTipHeight, truncateHex } from '../utils/rpc'
import { useAsync } from '../hooks/useAsync'
import { PageHeader } from './ui/PageHeader'
import { DataTable, TableRow, TableSkeleton, tdClass } from './ui/Table'

type TxRow = {
  txid: string
  blockHeight: number
  blockHash: string
  time?: number | string
  indexInBlock: number
}

/** How many tip blocks to scan for recent txs (keep small for public RPC). */
const RECENT_BLOCKS = 3
const MAX_ROWS = 40

export default function Transactions() {
  const computer = useContext(ComputerContext)

  const { data, loading, error, reload } = useAsync(async () => {
    const tip = await getTipHeight(computer)
    if (tip <= 0) return { tip, rows: [] as TxRow[] }

    const collected: TxRow[] = []
    const from = tip
    const to = Math.max(0, tip - RECENT_BLOCKS + 1)

    for (let height = from; height >= to && collected.length < MAX_ROWS; height--) {
      try {
        const hash = await getBlockHashAtHeight(computer, height)
        if (!hash) continue

        const block = await getBlock(computer, hash)
        const txids = Array.isArray(block?.tx) ? block.tx.map((t) => (typeof t === 'string' ? t : t.txid)) : []
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

    return { tip, rows: collected }
  }, [computer])

  const tipHeight = data?.tip ?? 0
  const rows = data?.rows ?? []

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="Transactions"
        subtitle={`Recent confirmed transactions${
          tipHeight > 0 ? ` from the last ${RECENT_BLOCKS} blocks (tip #${tipHeight})` : ''
        }`}
        actions={
          <button
            type="button"
            onClick={() => reload()}
            disabled={loading}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        }
      />

      {error ? <InlineAlert variant="error">{error}</InlineAlert> : null}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <DataTable
          columns={[
            { key: 'tx', label: 'Transaction' },
            { key: 'block', label: 'Block' },
            { key: 'time', label: 'Time' },
          ]}
          empty={rows.length === 0 && !error ? 'No recent transactions' : undefined}
        >
          {rows.map((row) => (
            <TableRow
              key={`${row.blockHash}:${row.txid}`}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className={`${tdClass} font-mono text-xs`}>
                <Link
                  to={`/transactions/${row.txid}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  title={row.txid}
                >
                  <span className="sm:hidden">{truncateHex(row.txid, 10, 8)}</span>
                  <span className="hidden sm:inline">{truncateHex(row.txid, 16, 12)}</span>
                </Link>
              </td>
              <td className={`${tdClass} tabular-nums`}>
                <Link
                  to={`/block/${row.blockHash}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  #{row.blockHeight}
                </Link>
              </td>
              <td className={`${tdClass} text-xs whitespace-nowrap`}>{formatTime(row.time)}</td>
            </TableRow>
          ))}
        </DataTable>
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
