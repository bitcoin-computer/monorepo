import { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ComputerContext, bigIntToStr, InlineAlert } from '@bitcoin-computer/components'
import { CopyButton } from './ui/CopyButton'
import { PageHeader, SectionTitle, StatCard } from './ui/PageHeader'

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

function truncateTxId(txId: string, head = 10, tail = 8): string {
  if (!txId || txId.length <= head + tail + 1) return txId
  return `${txId.slice(0, head)}…${txId.slice(-tail)}`
}

const UTXODisplay = () => {
  const params = useParams()
  const address = params.address || ''
  const [utxos, setUtxos] = useState<DbOutput[]>([])
  const [totalAmount, setTotalAmount] = useState<bigint>(0n)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const computer = useContext(ComputerContext)
  const chain = computer.getChain()

  const fetchUTXOs = useCallback(
    async (addr: string) => {
      if (!addr) {
        setLoading(false)
        setError('No address provided')
        setUtxos([])
        setTotalAmount(0n)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const response = (await computer.db.wallet.restClient.getUTXOs({
          address: addr,
          verbosity: 1,
          isObject: false,
        })) as DbOutput[]
        setUtxos(response)
        setTotalAmount(response.reduce((total, unspent) => total + unspent.satoshis, 0n))
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading UTXOs'
        setError(msg)
        setUtxos([])
        setTotalAmount(0n)
      } finally {
        setLoading(false)
      }
    },
    [computer],
  )

  useEffect(() => {
    fetchUTXOs(address)
  }, [address, fetchUTXOs])

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
            onClick={() => fetchUTXOs(address)}
            disabled={loading}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : null}

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
          <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-3 py-2">
                    Transaction
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Vout
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Outpoint
                  </th>
                </tr>
              </thead>
              <tbody>
                {utxos.map((utxo) => {
                  const [txId, vout] = utxo.rev.split(':')
                  return (
                    <tr
                      key={utxo.rev}
                      className="bg-white border-b last:border-0 dark:bg-gray-900 dark:border-gray-800"
                    >
                      <td className="px-3 py-2 font-mono text-xs">
                        <Link
                          to={`/transactions/${txId}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          title={txId}
                        >
                          {truncateTxId(txId)}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{vout}</td>
                      <td className="px-3 py-2 text-right font-mono text-xs whitespace-nowrap">
                        {bigIntToStr(utxo.satoshis)} {chain}
                      </td>
                      <td className="px-3 py-2">
                        <CopyButton text={utxo.rev} label="Copy" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default UTXODisplay
