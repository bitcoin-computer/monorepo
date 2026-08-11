import { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ComputerContext, InlineAlert } from '@bitcoin-computer/components'
import { formatUnixTime, truncateHex, unwrapRpcResult } from '../utils/rpc'

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

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

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

      return mapPool(heights, FETCH_CONCURRENCY, async (height) => {
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
      })
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
  const isPrevAvailable = pageNum > 0
  const isNextAvailable = pageNum < maxPage

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Blocks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recent blocks
            {tipHeight > 0 ? ` · tip #${tipHeight}` : ''}
          </p>
        </div>
      </header>

      {error ? <InlineAlert variant="error">{error}</InlineAlert> : null}

      {loading ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse space-y-0">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-10 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40" />
          ))}
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Height
                </th>
                <th scope="col" className="px-3 py-2">
                  Hash
                </th>
                <th scope="col" className="px-3 py-2">
                  Time
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Txs
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.height}
                  className="bg-white border-b last:border-0 dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-3 py-2 tabular-nums font-medium text-gray-900 dark:text-white">
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
                  <td className="px-3 py-2 font-mono text-xs">
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
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {formatUnixTime(row.time)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.nTx != null ? row.nTx : '—'}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-xs">
                    {row.size != null ? row.size.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !error ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">
                    No blocks found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {tipHeight > 0 && !loading ? (
        <nav className="flex items-center justify-between" aria-label="Blocks pagination">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {pageNum + 1} of {maxPage + 1}
          </p>
          <div className="inline-flex -space-x-px">
            <button
              type="button"
              disabled={!isPrevAvailable}
              onClick={() => setPageNum((p) => Math.max(0, p - 1))}
              className="px-3 h-8 text-sm border border-gray-300 rounded-l-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Newer
            </button>
            <button
              type="button"
              disabled={!isNextAvailable}
              onClick={() => setPageNum((p) => p + 1)}
              className="px-3 h-8 text-sm border border-gray-300 rounded-r-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Older
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
