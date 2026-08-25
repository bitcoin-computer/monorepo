import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ComputerContext, bigIntToStr, InlineAlert } from '@bitcoin-computer/components'
import { CopyButton } from './ui/CopyButton'
import { PageHeader, SectionTitle, StatCard } from './ui/PageHeader'
import { DataTable, TableRow, TableSkeleton, tdClass } from './ui/Table'
import { truncateHex } from '../utils/rpc'
import { useAsync } from '../hooks/useAsync'

interface DbOutput {
  rev: string
  address: string
  satoshis: bigint
  asm: string
  expHash?: string
  mod?: string
  isObject?: boolean
  previous?: string
  blockHash?: string
  blockHeight?: number
  blockIndex?: number
}

const UTXODisplay = () => {
  const params = useParams()
  const address = params.address || ''
  const computer = useContext(ComputerContext)
  const chain = computer.getChain()

  const { data, loading, error, reload } = useAsync(async () => {
    if (!address) throw new Error('No address provided')
    const response = (await computer.db.wallet.restClient.getUTXOs({
      address,
      verbosity: 1,
      isObject: false,
    })) as DbOutput[]
    return {
      utxos: response,
      totalAmount: response.reduce((total, unspent) => total + unspent.satoshis, 0n),
    }
  }, [computer, address])

  const utxos = data?.utxos ?? []
  const totalAmount = data?.totalAmount ?? 0n

  return (
    <div className="w-full space-y-4">
      <PageHeader
        eyebrow="Address"
        title={address || '—'}
        monoTitle
        actions={address ? <CopyButton text={address} label="Copy" /> : null}
      />

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Balance">
          {loading ? (
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <>
              {bigIntToStr(totalAmount)}{' '}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{chain}</span>
            </>
          )}
        </StatCard>
        <StatCard label="UTXOs">
          {loading ? (
            <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            utxos.length
          )}
        </StatCard>
        <StatCard label="Network">
          <span className="capitalize">{computer.getNetwork()}</span>
        </StatCard>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>Unspent outputs</SectionTitle>
          <button
            type="button"
            onClick={() => reload()}
            disabled={loading}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? <TableSkeleton rows={3} /> : null}

        {error && !loading ? <InlineAlert variant="error">{error}</InlineAlert> : null}

        {!loading && !error && utxos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No UTXOs</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No unspent payment outputs. Smart objects are listed under{' '}
              <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                Objects
              </Link>
              .
            </p>
          </div>
        ) : null}

        {!loading && utxos.length > 0 ? (
          <DataTable
            columns={[
              { key: 'tx', label: 'Transaction' },
              { key: 'vout', label: 'Vout' },
              { key: 'amount', label: 'Amount', className: 'text-right' },
              { key: 'outpoint', label: 'Outpoint' },
            ]}
          >
            {utxos.map((utxo) => {
              const [txId, vout] = utxo.rev.split(':')
              return (
                <TableRow key={utxo.rev}>
                  <td className={`${tdClass} font-mono text-xs`}>
                    <Link
                      to={`/transactions/${txId}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      title={txId}
                    >
                      {truncateHex(txId)}
                    </Link>
                  </td>
                  <td className={tdClass}>{vout}</td>
                  <td className={`${tdClass} text-right font-mono text-xs whitespace-nowrap`}>
                    {bigIntToStr(utxo.satoshis)} {chain}
                  </td>
                  <td className={tdClass}>
                    <CopyButton text={utxo.rev} label="Copy" />
                  </td>
                </TableRow>
              )
            })}
          </DataTable>
        ) : null}
      </section>
    </div>
  )
}

export default UTXODisplay
