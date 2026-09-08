import { useContext, useState } from 'react'
import { ComputerContext, InlineAlert, limitConcurrency } from '@bitcoin-computer/components'
import { formatTime, fetchBlockByHeight, getTipHeight } from '../utils/rpc'
import { useAsync } from '../hooks/useAsync'
import { HexLink } from './ui/HexLink'
import { PageHeader } from './ui/PageHeader'
import { DataTable, Pager, TableRow, TableSkeleton, tdClass } from './ui/Table'

type BlockRow = {
  height: number
  hash: string
  time?: number | string
  nTx?: number
  size?: number | string
  error?: string
}

const PAGE_SIZE = 15
const FETCH_CONCURRENCY = 3

export default function Blocks() {
  const computer = useContext(ComputerContext)
  const [pageNum, setPageNum] = useState(0)

  const { data, loading, error } = useAsync(async () => {
    const tip = await getTipHeight(computer)
    if (tip <= 0) return { tip, rows: [] as BlockRow[] }

    const start = tip - pageNum * PAGE_SIZE
    const heights: number[] = []
    for (let h = start; h > start - PAGE_SIZE && h >= 0; h--) {
      heights.push(h)
    }

    const rows = await Promise.all(
      heights.map((height) =>
        limitConcurrency(async () => {
          try {
            const block = await fetchBlockByHeight(computer, height)
            if (!block) {
              return { height, hash: '', error: 'Missing hash' }
            }
            return {
              height: block.height ?? height,
              hash: block.hash,
              time: block.time,
              size: block.size,
              nTx: Array.isArray(block.tx) ? block.tx.length : undefined,
            }
          } catch {
            return { height, hash: '', error: 'Failed to load' }
          }
        }, FETCH_CONCURRENCY),
      ),
    )

    return { tip, rows }
  }, [computer, pageNum])

  const tipHeight = data?.tip ?? 0
  const rows = data?.rows ?? []
  const maxPage = tipHeight > 0 ? Math.floor(tipHeight / PAGE_SIZE) : 0

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="Blocks"
        subtitle={`Recent blocks${tipHeight > 0 ? ` · tip #${tipHeight}` : ''}`}
      />

      {error ? <InlineAlert variant="error">{error}</InlineAlert> : null}

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <DataTable
          columns={[
            { key: 'height', label: 'Height' },
            { key: 'hash', label: 'Hash' },
            { key: 'time', label: 'Time' },
            { key: 'txs', label: 'Txs', className: 'text-right' },
            { key: 'size', label: 'Size', className: 'text-right' },
          ]}
          empty={rows.length === 0 && !error ? 'No blocks found' : undefined}
        >
          {rows.map((row) => (
            <TableRow key={row.height} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className={`${tdClass} tabular-nums font-medium text-gray-900 dark:text-white`}>
                {row.hash ? (
                  <HexLink to={`/block/${row.hash}`} value={row.hash}>
                    {row.height}
                  </HexLink>
                ) : (
                  row.height
                )}
              </td>
              <td className={`${tdClass} font-mono text-xs`}>
                {row.hash ? (
                  <HexLink to={`/block/${row.hash}`} value={row.hash} />
                ) : (
                  <span className="text-red-500">{row.error || '—'}</span>
                )}
              </td>
              <td className={`${tdClass} text-xs whitespace-nowrap`}>{formatTime(row.time)}</td>
              <td className={`${tdClass} text-right tabular-nums`}>
                {row.nTx != null ? row.nTx : '—'}
              </td>
              <td className={`${tdClass} text-right tabular-nums text-xs`}>
                {row.size != null ? Number(row.size).toLocaleString() : '—'}
              </td>
            </TableRow>
          ))}
        </DataTable>
      )}

      {tipHeight > 0 && !loading ? (
        <Pager
          prevLabel="Newer"
          nextLabel="Older"
          prevDisabled={pageNum <= 0}
          nextDisabled={pageNum >= maxPage}
          onPrev={() => setPageNum((p) => Math.max(0, p - 1))}
          onNext={() => setPageNum((p) => p + 1)}
          info={`Page ${pageNum + 1} of ${maxPage + 1}`}
        />
      ) : null}
    </div>
  )
}
