import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ComputerContext, InlineAlert } from '@bitcoin-computer/components'
import {
  formatTime,
  getBlock,
  resolveBlockHash,
  resolveNeighbors,
  txIdOf,
  unwrapRpcResult,
} from '../utils/rpc'
import { useAsync } from '../hooks/useAsync'
import { HexLink } from './ui/HexLink'
import { PageHeader } from './ui/PageHeader'
import { DataTable, TableRow, tdClass } from './ui/Table'

function NeighborNav({
  prevHash,
  nextHash,
}: {
  prevHash?: string
  nextHash?: string
}) {
  const navBtn =
    'inline-flex items-center justify-center px-3 h-9 text-sm font-medium border rounded-lg transition'
  const navEnabled =
    'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
  const navDisabled =
    'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'

  return (
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
  )
}

function Block() {
  const { id: rawId = '' } = useParams<{ id?: string }>()
  const computer = useContext(ComputerContext)

  const { data, loading, error } = useAsync(async () => {
    const hash = await resolveBlockHash(computer, rawId)
    const block = await getBlock(computer, hash)
    if (!block?.hash) throw new Error('Block not found')

    if (block.height == null) {
      try {
        const headerRes = await computer.rpc('getblockheader', hash)
        const header = unwrapRpcResult<{ height?: number }>(headerRes)
        if (header?.height != null) block.height = header.height
      } catch {
        // ignore
      }
    }

    const neighbors = await resolveNeighbors(computer, block)
    return { block, prevHash: neighbors.prevHash, nextHash: neighbors.nextHash }
  }, [computer, rawId], Boolean(rawId))

  const blockData = data?.block
  const txs = (blockData?.tx || []).map(txIdOf)

  return (
    <div className="w-full space-y-4">
      <PageHeader
        eyebrow="Block"
        title={blockData?.height != null ? `#${blockData.height}` : 'Detail'}
        actions={
          <Link
            to="/blocks"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← All blocks
          </Link>
        }
      />

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      ) : null}

      {error && !loading ? (
        <InlineAlert variant="error" title="Could not load block">
          <p className="mb-2">{error}</p>
          <p className="font-mono text-xs break-all opacity-80">{rawId}</p>
        </InlineAlert>
      ) : null}

      {blockData && !loading ? (
        <>
          <NeighborNav prevHash={data?.prevHash} nextHash={data?.nextHash} />

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
              <dd className="text-sm font-medium">{formatTime(blockData.time)}</dd>
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
            <DataTable
              columns={[
                { key: 'i', label: '#' },
                { key: 'txid', label: 'Transaction ID' },
              ]}
              empty={txs.length === 0 ? 'No transactions' : undefined}
            >
              {txs.map((txid, i) => (
                <TableRow key={txid}>
                  <td className={`${tdClass} tabular-nums text-xs text-gray-500`}>{i}</td>
                  <td className={`${tdClass} font-mono text-xs`}>
                    <HexLink
                      to={`/transactions/${txid}`}
                      value={txid}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                      mobile={[12, 10]}
                      desktop="full"
                    />
                  </td>
                </TableRow>
              ))}
            </DataTable>
          </section>
        </>
      ) : null}
    </div>
  )
}

export default Block
