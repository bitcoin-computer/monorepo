import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import reactStringReplace from 'react-string-replace'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { Card } from './Card'
import { ComputerContext } from './ComputerContext'
import { InlineAlert } from './InlineAlert'
import {
  classifyDecodeFailure,
  errorMessage,
  readOnChainMeta,
  type DecodeFailureKind,
} from './common/transition'
import { HiOutlineRefresh, HiOutlineClipboard, HiCheck } from 'react-icons/hi'

type TransactionRouteParams = {
  txn?: string
}

function CopyIconButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label="Copy"
    >
      {copied ? (
        <HiCheck className="w-4 h-4 text-green-500" />
      ) : (
        <HiOutlineClipboard className="w-4 h-4" />
      )}
    </button>
  )
}

function truncateMiddle(value: string, head = 8, tail = 6): string {
  if (!value || value.length <= head + tail + 1) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

function formatRpcValue(value: unknown): string {
  if (typeof value === 'number') return value.toFixed(8).replace(/\.?0+$/, '') || '0'
  if (typeof value === 'string') return value
  return String(value ?? '—')
}

function ExpressionCard({ content, env }: { content: string; env: { [s: string]: string } }) {
  const entries = Object.entries(env)
  let formattedContent = content as any
  entries.forEach((entry) => {
    const [name, rev] = entry
    const regExp = new RegExp(`(${name})`, 'g')
    const replacer = (n: string, ind: number) => (
      <Link
        key={`${rev}|${ind}`}
        to={`/objects/${rev}`}
        className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        {n}
      </Link>
    )
    formattedContent = reactStringReplace(formattedContent, regExp, replacer)
  })
  return <Card content={formattedContent} />
}

function SpendsCell({ utxo }: { utxo: string }) {
  const computer = useContext(ComputerContext)
  const [spends, setSpends] = useState<string | undefined | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpends = async () => {
      try {
        const res = await computer.spendingInput(utxo)
        setSpends(res)
      } catch {
        setSpends(undefined)
      } finally {
        setLoading(false)
      }
    }
    fetchSpends()
  }, [computer, utxo])

  if (loading) {
    return <HiOutlineRefresh className="animate-spin text-blue-600 dark:text-blue-400 w-4 h-4" />
  }

  if (!spends) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
        Unspent
      </span>
    )
  }

  const [spTxid, spVout] = spends.split(':')
  const trimmed = spTxid ? `${truncateMiddle(spTxid, 6, 4)}:${spVout || ''}` : spends

  return (
    <Link
      to={`/objects/${spends}`}
      className="font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs"
      title={spends}
    >
      {trimmed}
    </Link>
  )
}

export const outputsComponent = ({
  rpcTxnData,
  txn,
}: {
  rpcTxnData: any
  txn: string | undefined
}) => (
  <section className="w-full">
    <h2 className="mb-2 text-base sm:text-lg font-semibold dark:text-white">Outputs</h2>
    <div className="relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/80 dark:text-gray-300">
          <tr>
            <th scope="col" className="px-4 py-3">
              #
            </th>
            <th scope="col" className="px-4 py-3">
              Value
            </th>
            <th scope="col" className="px-4 py-3">
              Type
            </th>
            <th scope="col" className="px-4 py-3 hidden md:table-cell">
              Script
            </th>
            <th scope="col" className="px-4 py-3">
              Spent by
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vout?.map((output: any) => (
            <tr
              key={output.n}
              className="bg-white border-b last:border-0 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40"
            >
              <td className="px-4 py-3">
                <Link
                  to={`/objects/${txn}:${output.n}`}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline tabular-nums"
                >
                  {output.n}
                </Link>
              </td>
              <td className="px-4 py-3 tabular-nums font-medium text-gray-900 dark:text-white">
                {formatRpcValue(output.value)}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {output.scriptPubKey?.type || '—'}
                </span>
              </td>
              <td className="px-4 py-3 break-all font-mono text-xs max-w-xs truncate hidden md:table-cell" title={output.scriptPubKey?.asm}>
                {output.scriptPubKey?.asm || '—'}
              </td>
              <td className="px-4 py-3">
                {txn ? <SpendsCell utxo={`${txn}:${output.n}`} /> : <span>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

function InputRevCell({ utxo, checkForSpentInput }: { utxo: string; checkForSpentInput: boolean }) {
  const computer = useContext(ComputerContext)
  const [spends, setSpends] = useState<string | null | undefined>(null)
  useEffect(() => {
    if (checkForSpentInput) {
      setSpends(null)
      const fetch = async () => {
        try {
          const res = await computer.spendingInput(utxo)
          setSpends(res || undefined)
        } catch (err) {
          console.error('Error fetching spending input:', err)
          setSpends(undefined)
        }
      }
      fetch()
    } else {
      setSpends(undefined)
    }
  }, [checkForSpentInput, utxo, computer])

  const isLoading = spends === null
  const isSpent = typeof spends === 'string'
  const linkClass = isSpent
    ? 'font-medium text-red-600 dark:text-red-400 hover:underline font-mono text-xs break-all'
    : 'font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs break-all'

  let trimmed = ''
  let spendingTxId = ''
  if (isSpent) {
    const [txId, vIn] = spends.split(':')
    spendingTxId = txId
    trimmed = `${truncateMiddle(txId, 6, 4)}:${vIn || ''}`
  }

  return (
    <div className="relative group inline-block max-w-full">
      <Link to={`/objects/${utxo}`} className={linkClass} title={utxo}>
        {truncateMiddle(utxo, 12, 10)}
      </Link>
      {isLoading && (
        <HiOutlineRefresh className="inline ml-2 animate-spin text-blue-600 dark:text-blue-400 w-4 h-4" />
      )}
      {isSpent && (
        <div className="absolute left-1/2 z-10 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 group-hover:opacity-100 bottom-full -translate-x-1/2 mb-3 whitespace-nowrap">
          Already spent in{' '}
          <Link
            to={`/transactions/${spendingTxId}`}
            className="font-medium text-blue-300 hover:underline"
          >
            {trimmed}
          </Link>
        </div>
      )}
    </div>
  )
}

export const inputsComponent = ({
  rpcTxnData,
  checkForSpentInput = false,
}: {
  rpcTxnData: any
  checkForSpentInput: boolean
}) => (
  <section className="w-full">
    <h2 className="mb-2 text-base sm:text-lg font-semibold dark:text-white">Inputs</h2>
    <div className="relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/80 dark:text-gray-300">
          <tr>
            <th scope="col" className="px-4 py-3">
              Outpoint
            </th>
            <th scope="col" className="px-4 py-3 hidden sm:table-cell">
              Script sig
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vin?.map((input: any, ind: any) => (
            <tr
              key={`${input.txid}|${ind}`}
              className="bg-white border-b last:border-0 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40"
            >
              <td className="px-4 py-3">
                {input.coinbase ? (
                  <span className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    Coinbase
                  </span>
                ) : (
                  <InputRevCell
                    utxo={`${input.txid}:${input.vout}`}
                    checkForSpentInput={checkForSpentInput}
                  />
                )}
              </td>
              <td className="px-4 py-3 break-all font-mono text-xs hidden sm:table-cell max-w-md truncate" title={input.scriptSig?.asm || input.coinbase}>
                {input.coinbase
                  ? truncateMiddle(String(input.coinbase), 16, 8)
                  : input.scriptSig?.asm || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const envTable = (env: { [s: string]: string }) => (
  <div className="relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/80 dark:text-gray-300">
        <tr>
          <th scope="col" className="px-4 py-3">
            Name
          </th>
          <th scope="col" className="px-4 py-3">
            Revision
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(env).map(([name, output]) => (
          <tr
            key={output}
            className="bg-white border-b last:border-0 dark:bg-gray-800 dark:border-gray-700"
          >
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{name}</td>
            <td className="px-4 py-3">
              <Link
                to={`/objects/${output}`}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs break-all"
              >
                {output}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export function TransitionUnavailable({
  kind,
  error,
  txn,
}: {
  kind: DecodeFailureKind
  error?: string
  txn?: string
}) {
  if (kind === 'encrypted') {
    return (
      <InlineAlert variant="info" title="Encrypted/private">
        <p className="mb-1">You cannot decrypt this expression.</p>
        <p className="text-xs opacity-90">
          Only wallets whose public key is listed in this object&apos;s _readers can read it.
        </p>
      </InlineAlert>
    )
  }

  if (kind === 'module') {
    return (
      <InlineAlert variant="info" title="Module deploy">
        <p className="mb-1">This transaction deploys a module, not a smart-object expression.</p>
        {txn ? (
          <p className="text-xs opacity-90">
            <Link
              to={`/modules/${txn}:0`}
              className="font-medium underline underline-offset-2 hover:opacity-100"
            >
              View module
            </Link>
          </p>
        ) : null}
      </InlineAlert>
    )
  }

  if (kind === 'error') {
    return (
      <InlineAlert variant="error" title="Could not decode expression">
        <p>{error || 'Failed to decode transaction metadata.'}</p>
      </InlineAlert>
    )
  }

  return (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      No Bitcoin Computer expression on this transaction (plain payment or non-BC payload).
    </p>
  )
}

export const transitionComponent = ({ transition }: { transition: any }) => (
  <section className="w-full space-y-4">
    <div>
      <h2 className="mb-2 text-base sm:text-lg font-semibold dark:text-white">Expression</h2>
      <ExpressionCard content={transition.exp} env={transition.env} />
    </div>

    <div>
      <h2 className="mb-2 text-base sm:text-lg font-semibold dark:text-white">Environment</h2>
      {Object.keys(transition.env || {}).length > 0 ? (
        envTable(transition.env)
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No environment bindings.</p>
      )}
    </div>

    {transition.mod && (
      <div>
        <h2 className="mb-2 text-base sm:text-lg font-semibold dark:text-white">Module</h2>
        <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
          <Link
            to={`/modules/${transition.mod}`}
            className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {transition.mod}
          </Link>
        </div>
      </div>
    )}
  </section>
)

function TxSummary({ rpcTxnData, txn }: { rpcTxnData: any; txn: string }) {
  const confirmations = rpcTxnData?.confirmations
  const blockHeight = rpcTxnData?.blockheight
  const blockHash = rpcTxnData?.blockhash
  const time = rpcTxnData?.time || rpcTxnData?.blocktime
  const vinCount = rpcTxnData?.vin?.length ?? 0
  const voutCount = rpcTxnData?.vout?.length ?? 0
  const confirmed = typeof confirmations === 'number' && confirmations > 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
          Status
        </p>
        {confirmed ? (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
            Confirmed
            {typeof confirmations === 'number' ? ` · ${confirmations}` : ''}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            Mempool
          </span>
        )}
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
          Block
        </p>
        {blockHash ? (
          <Link
            to={`/block/${blockHash}`}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {blockHeight != null ? `#${blockHeight}` : truncateMiddle(blockHash, 8, 6)}
          </Link>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
        )}
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
          Time
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {time ? new Date(time * 1000).toLocaleString() : '—'}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
          I/O
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white tabular-nums">
          {vinCount} in · {voutCount} out
        </p>
      </div>
      <div className="col-span-2 sm:col-span-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
          Transaction ID
        </p>
        <div className="flex items-start gap-2">
          <p className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white break-all flex-1">
            {txn}
          </p>
          <CopyIconButton text={txn} />
        </div>
      </div>
    </div>
  )
}

export function TransactionComponent() {
  const location = useLocation()
  const params = useParams<TransactionRouteParams>()
  const computer = useContext(ComputerContext)

  const [txn, setTxn] = useState<string | undefined>(params.txn)
  const [txnData, setTxnData] = useState<any | null>(null)
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null)
  const [transition, setTransition] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decodeFailure, setDecodeFailure] = useState<DecodeFailureKind | null>(null)
  const [decodeError, setDecodeError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      if (!params.txn) return

      setTxn(params.txn)
      setLoading(true)
      setError(null)
      setTxnData(null)
      setRPCTxnData(null)
      setTransition(null)
      setDecodeFailure(null)
      setDecodeError(null)

      try {
        const [hex] = await computer.db.wallet.restClient.getRawTxs([params.txn])
        const tx = BCTransaction.fromHex(hex)
        setTxnData(tx)

        try {
          const { result } = await computer.rpc('getrawtransaction', `${params.txn} 2`)
          setRPCTxnData(result)
        } catch (rpcErr) {
          console.warn('RPC getrawtransaction failed:', rpcErr)
        }
      } catch (err) {
        console.error('Failed to fetch transaction:', err)
        setError(err instanceof Error ? err.message : 'Failed to load transaction')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [computer, params.txn, location])

  useEffect(() => {
    const fetch = async () => {
      if (!txnData) return
      try {
        const decoded = await computer.decode(txnData)
        setTransition(decoded)
        setDecodeFailure(null)
        setDecodeError(null)
      } catch (err) {
        setTransition(null)
        setDecodeFailure(classifyDecodeFailure(readOnChainMeta(txnData), err))
        setDecodeError(errorMessage(err) || 'Failed to decode transaction metadata.')
      }
    }
    fetch()
  }, [computer, txnData])

  if (!txn) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-red-600 dark:text-red-400">Transaction ID not found in URL</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
          Transaction
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Details</h1>
      </header>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
          <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      ) : null}

      {error && !loading ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-5">
          <p className="font-semibold text-red-800 dark:text-red-300 mb-1">Transaction not found</p>
          <p className="text-sm text-red-700 dark:text-red-400 mb-3">{error}</p>
          <p className="text-xs font-mono break-all text-red-600/80 dark:text-red-400/80">{txn}</p>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Tip: 64-character hex values are treated as transaction ids. To filter objects by owner
            public key, use a compressed key (66 hex, starting with 02/03) or open{' '}
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
              /?publicKey=…
            </code>
            .
          </p>
        </div>
      ) : null}

      {!loading && !error && rpcTxnData ? <TxSummary rpcTxnData={rpcTxnData} txn={txn} /> : null}

      {!loading && !error && !rpcTxnData && txnData ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4 shadow-sm">
          <div className="flex items-start gap-2">
            <p className="font-mono text-xs sm:text-sm break-all flex-1 dark:text-white">{txn}</p>
            <CopyIconButton text={txn} />
          </div>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            Loaded raw transaction; RPC details unavailable.
          </p>
        </div>
      ) : null}

      {!loading && !error && transition ? transitionComponent({ transition }) : null}

      {!loading && !error && !transition && decodeFailure ? (
        <TransitionUnavailable kind={decodeFailure} error={decodeError ?? undefined} txn={txn} />
      ) : null}

      {!loading && !error && rpcTxnData?.vin
        ? inputsComponent({ rpcTxnData, checkForSpentInput: false })
        : null}
      {!loading && !error && rpcTxnData?.vout
        ? outputsComponent({ rpcTxnData, txn })
        : null}
    </div>
  )
}

export const Transaction = { Component: TransactionComponent }
