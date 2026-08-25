import { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ComputerContext, InlineAlert, limitConcurrency } from '@bitcoin-computer/components'
import { formatTime, truncateHex, unwrapRpcResult } from '../utils/rpc'
import { PageHeader } from './ui/PageHeader'
import { DataTable, Pager, TableRow, TableSkeleton, tdClass } from './ui/Table'

type BlockRow = {
  height: number
  hash: string
  time?: number
  nTx?: number
  size?: number
  error?: string
}

const PAGE_SIZE = 15
const FETCH_CONCURRENCY = 3

export default function Blocks() {
  const computer = useContext(ComputerContext)
  const [pageNum, setPageNum] = useState(0)
  const [tipHeight, setTipHeight] = useState(0)
  const [rows, setRows] = useState<BlockRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTip = useCallback(async () => {
    const res = await computer.rpc('getblockchaininfo', '')
    const info = unwrapRpcResult<{ blocks: number }>(res)
    return Number(info?.blocks) || 0
  }, [computer])

  const loadPage = useCallback(
    async (tip: number, page: number) => {
      if (tip <= 0) return [] as BlockRow[]

      const start = tip - page * PAGE_SIZE
      const heights: number[] = []
      for (let h = start; h > start - PAGE_SIZE && h >= 0; h--) {
        heights.push(h)
      }

      return Promise.all(
        heights.map((height) =>
          limitConcurrency(async () => {
            try {
              const hashRes = await computer.rpc('getblockhash', `${height}`)
              const hash = String(unwrapRpcResult(hashRes) ?? '')
              if (!hash || hash.length !== 64) {
                return { height, hash: '', error: 'Missing hash' }
              }
              // verbosity 1: txids only — enough for count + size + time
              const blockRes = await computer.rpc('getblock', `${hash} 1`)
              const block = unwrapRpcResult<{
                hash: string
                height: number
                time: number
                size: number
                tx?: string[]
              }>(blockRes)
              return {
                height: block?.height ?? height,
                hash: block?.hash || hash,
                time: block?.time,
                size: block?.size,
                nTx: Array.isArray(block?.tx) ? block.tx.length : undefined,
              }
            } catch {
              return { height, hash: '', error: 'Failed to load' }
            }
          }, FETCH_CONCURRENCY),
        ),
      )
    },
    [computer],
  )

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const tip = await loadTip()
        if (cancelled) return
        setTipHeight(tip)
        const pageRows = await loadPage(tip, pageNum)
        if (cancelled) return
        setRows(pageRows)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error loading blocks')
          setRows([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [loadTip, loadPage, pageNum])

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
            <TableRow
              key={row.height}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className={`${tdClass} tabular-nums font-medium text-gray-900 dark:text-white`}>
                {row.hash ? (
                  <Link
                    to={`/block/${row.hash}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {row.height}
                  </Link>
                ) : (
                  row.height
                )}
              </td>
              <td className={`${tdClass} font-mono text-xs`}>
                {row.hash ? (
                  <Link
                    to={`/block/${row.hash}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    title={row.hash}
                  >
                    {truncateHex(row.hash)}
                  </Link>
                ) : (
                  <span className="text-red-500">{row.error || '—'}</span>
                )}
              </td>
              <td className={`${tdClass} text-xs whitespace-nowrap`}>{formatTime(row.time)}</td>
              <td className={`${tdClass} text-right tabular-nums`}>
                {row.nTx != null ? row.nTx : '—'}
              </td>
              <td className={`${tdClass} text-right tabular-nums text-xs`}>
                {row.size != null ? row.size.toLocaleString() : '—'}
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
