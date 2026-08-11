import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ComputerContext } from '@bitcoin-computer/components'
import {
  formatUnixTime,
  isBlockHash,
  isBlockHeight,
  truncateHex,
  unwrapRpcResult,
} from '../utils/rpc'

type BlockData = {
  hash: string
  height?: number
  time?: number | string
  size?: number | string
  weight?: number | string
  previousblockhash?: string
  nextblockhash?: string
  tx?: Array<string | { txid: string }>
}

type RpcClient = { rpc: (method: string, params: string) => Promise<unknown> }

function txIdOf(txn: string | { txid: string }): string {
  return typeof txn === 'string' ? txn : txn.txid
}

async function resolveBlockHash(computer: RpcClient, id: string): Promise<string> {
  const trimmed = id.trim()
  if (isBlockHash(trimmed)) return trimmed.toLowerCase()
  if (isBlockHeight(trimmed)) {
    const res = await computer.rpc('getblockhash', trimmed)
    const hash = String(unwrapRpcResult(res) ?? '')
    if (!isBlockHash(hash)) throw new Error(`No block at height ${trimmed}`)
    return hash.toLowerCase()
  }
  throw new Error('Invalid block id (use 64-char hash or height)')
}

/**
 * Resolve prev/next block hashes robustly.
 * Prefer fields on the block object; fall back to height ± 1 via getblockhash
 * (nextblockhash is often missing on some nodes / at the tip).
 */
async function resolveNeighbors(
  computer: RpcClient,
  block: BlockData,
): Promise<{ prevHash?: string; nextHash?: string }> {
  let prevHash =
    typeof block.previousblockhash === 'string' && isBlockHash(block.previousblockhash)
      ? block.previousblockhash
      : undefined
  let nextHash =
    typeof block.nextblockhash === 'string' && isBlockHash(block.nextblockhash)
      ? block.nextblockhash
      : undefined

  const height = block.height
  if (height == null || !Number.isFinite(Number(height))) {
    return { prevHash, nextHash }
  }

  const h = Number(height)

  if (!prevHash && h > 0) {
    try {
      const res = await computer.rpc('getblockhash', `${h - 1}`)
      const hash = String(unwrapRpcResult(res) ?? '')
      if (isBlockHash(hash)) prevHash = hash
    } catch {
      // leave undefined
    }
  }

  if (!nextHash) {
    try {
      const res = await computer.rpc('getblockhash', `${h + 1}`)
      const hash = String(unwrapRpcResult(res) ?? '')
      if (isBlockHash(hash)) nextHash = hash
    } catch {
      // tip block — no next
    }
  }

  return { prevHash, nextHash }
}

function Block() {
  const params = useParams<{ id?: string; block?: string }>()
  const rawId = params.id || params.block || ''
  const computer = useContext(ComputerContext)
  const [blockData, setBlockData] = useState<BlockData | null>(null)
  const [prevHash, setPrevHash] = useState<string | undefined>()
  const [nextHash, setNextHash] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!rawId) return
    let cancelled = false

    const fetchBlock = async () => {
      setLoading(true)
      setError(null)
      setBlockData(null)
      setPrevHash(undefined)
      setNextHash(undefined)
      try {
        const hash = await resolveBlockHash(computer, rawId)
        // verbosity 1: txids only
        const res = await computer.rpc('getblock', `${hash} 1`)
        const data = unwrapRpcResult<BlockData>(res)
        if (cancelled) return
        if (!data?.hash) throw new Error('Block not found')

        // Ensure height is set (needed for neighbor fallback)
        if (data.height == null) {
          try {
            const headerRes = await computer.rpc('getblockheader', hash)
            const header = unwrapRpcResult<{ height?: number }>(headerRes)
            if (header?.height != null) data.height = header.height
          } catch {
            // ignore
          }
        }

        const neighbors = await resolveNeighbors(computer, data)
        if (cancelled) return
        setBlockData(data)
        setPrevHash(neighbors.prevHash)
        setNextHash(neighbors.nextHash)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error loading block')
          setBlockData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBlock()
    return () => {
      cancelled = true
    }
  }, [computer, rawId])

  const txs = (blockData?.tx || []).map(txIdOf)

  const navBtn =
    'inline-flex items-center justify-center px-3 h-9 text-sm font-medium border rounded-lg transition'
  const navEnabled =
    'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
  const navDisabled =
    'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
            Block
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">
            {blockData?.height != null ? `#${blockData.height}` : 'Detail'}
          </h1>
        </div>
        <Link
          to="/blocks"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← All blocks
        </Link>
      </header>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      ) : null}

      {error && !loading ? (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
          <p className="font-medium mb-1">Could not load block</p>
          <p className="mb-2">{error}</p>
          <p className="font-mono text-xs break-all opacity-80">{rawId}</p>
        </div>
      ) : null}

      {blockData && !loading ? (
        <>
          <div className="flex flex-wrap gap-2">
            {prevHash ? (
              <Link to={`/block/${prevHash}`} className={`${navBtn} ${navEnabled}`} title={prevHash}>
                ← Previous
              </Link>
            ) : (
              <span className={`${navBtn} ${navDisabled}`}>← Previous</span>
            )}
            {nextHash ? (
              <Link to={`/block/${nextHash}`} className={`${navBtn} ${navEnabled}`} title={nextHash}>
                Next →
              </Link>
            ) : (
              <span className={`${navBtn} ${navDisabled}`}>Next →</span>
            )}
          </div>

          <dl className="text-gray-900 dark:text-gray-100 divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3">
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Hash
              </dt>
              <dd className="text-sm font-mono break-all">{blockData.hash}</dd>
            </div>
            {blockData.height != null ? (
              <div className="flex flex-col py-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Height
                </dt>
                <dd className="text-sm font-medium tabular-nums">{blockData.height}</dd>
              </div>
            ) : null}
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Time
              </dt>
              <dd className="text-sm font-medium">{formatUnixTime(blockData.time)}</dd>
            </div>
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Size
              </dt>
              <dd className="text-sm font-medium tabular-nums">
                {blockData.size != null ? Number(blockData.size).toLocaleString() : '—'}
              </dd>
            </div>
            {blockData.weight != null ? (
              <div className="flex flex-col py-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Weight
                </dt>
                <dd className="text-sm font-medium tabular-nums">
                  {Number(blockData.weight).toLocaleString()}
                </dd>
              </div>
            ) : null}
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Transactions
              </dt>
              <dd className="text-sm font-medium tabular-nums">{txs.length}</dd>
            </div>
          </dl>

          <section>
            <h2 className="text-base sm:text-lg font-semibold dark:text-white mb-2">
              Transactions
            </h2>
            <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-3 py-2">
                      #
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((txid, i) => (
                    <tr
                      key={txid}
                      className="bg-white border-b last:border-0 dark:bg-gray-900 dark:border-gray-800"
                    >
                      <td className="px-3 py-2 tabular-nums text-xs text-gray-500">{i}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        <Link
                          to={`/transactions/${txid}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                          title={txid}
                        >
                          <span className="sm:hidden">{truncateHex(txid, 12, 10)}</span>
                          <span className="hidden sm:inline">{txid}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {txs.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-3 py-4 text-center text-sm text-gray-500">
                        No transactions
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            {prevHash ? (
              <Link to={`/block/${prevHash}`} className={`${navBtn} ${navEnabled}`} title={prevHash}>
                ← Previous
              </Link>
            ) : (
              <span className={`${navBtn} ${navDisabled}`}>← Previous</span>
            )}
            {nextHash ? (
              <Link to={`/block/${nextHash}`} className={`${navBtn} ${navEnabled}`} title={nextHash}>
                Next →
              </Link>
            ) : (
              <span className={`${navBtn} ${navDisabled}`}>Next →</span>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Block
