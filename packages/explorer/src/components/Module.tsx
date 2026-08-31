import { useContext, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ModuleRecord } from '@bitcoin-computer/lib'
import {
  Card,
  ComputerContext,
  InlineAlert,
  capitalizeFirstLetter,
  getErrorMessage,
} from '@bitcoin-computer/components'
import { formatTime } from '../utils/rpc'
import { useAsync } from '../hooks/useAsync'
import { ModuleSource } from './ModuleSource'
import { CopyButton } from './ui/CopyButton'
import { PageHeader } from './ui/PageHeader'

function ModuleMeta({ record }: { record: ModuleRecord }) {
  const txId = record.mod.split(':')[0]
  const confirmed = Boolean(record.blockHash)

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-2">
      <div>
        <dt className="text-gray-500 dark:text-gray-400">Storage</dt>
        <dd className="mt-0.5">
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {record.storageType}
          </span>
        </dd>
      </div>
      <div>
        <dt className="text-gray-500 dark:text-gray-400">Status</dt>
        <dd className="mt-0.5 dark:text-gray-200">
          {confirmed ? (
            <>
              Confirmed
              {record.blockHeight != null ? ` · Block #${record.blockHeight}` : null}
            </>
          ) : (
            'Mempool (unconfirmed)'
          )}
        </dd>
      </div>
      <div>
        <dt className="text-gray-500 dark:text-gray-400">Block hash</dt>
        <dd className="mt-0.5 font-mono text-xs break-all dark:text-gray-200">
          {record.blockHash ? (
            <Link
              to={`/block/${record.blockHash}`}
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              {record.blockHash}
            </Link>
          ) : (
            '—'
          )}
        </dd>
      </div>
      <div>
        <dt className="text-gray-500 dark:text-gray-400">Indexed at</dt>
        <dd className="mt-0.5 dark:text-gray-200">{formatTime(record.timestamp)}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-gray-500 dark:text-gray-400">Transaction</dt>
        <dd className="mt-0.5 font-mono text-xs break-all">
          {txId ? (
            <Link
              to={`/transactions/${txId}`}
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              {txId}
            </Link>
          ) : (
            '—'
          )}
        </dd>
      </div>
    </dl>
  )
}

function ModuleExports({ exports }: { exports: Record<string, unknown> }) {
  const names = Object.getOwnPropertyNames(exports)
  if (names.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">This module has no named exports.</p>
    )
  }

  return (
    <>
      {names.map((key) => {
        const value = exports[key]
        let content: string
        try {
          content =
            value !== null &&
            value !== undefined &&
            typeof (value as { toString?: () => string }).toString === 'function'
              ? (value as { toString: () => string }).toString()
              : String(value)
        } catch {
          content = String(value)
        }
        return (
          <div key={key} className="mt-4">
            <h3 className="mb-2 text-xl font-bold dark:text-white">{capitalizeFirstLetter(key)}</h3>
            <Card content={content} />
          </div>
        )
      })}
    </>
  )
}

function EvaluatedExports({ modSpec }: { modSpec: string }) {
  const computer = useContext(ComputerContext)
  const [evaluate, setEvaluate] = useState(false)
  const { data: exports, error: exportsError, loading } = useAsync(
    async () => (await computer.load(modSpec)) as Record<string, unknown>,
    [computer, modSpec],
    evaluate,
    getErrorMessage,
  )

  return (
    <section>
      <h2 className="mb-1 text-base sm:text-lg font-semibold dark:text-white">
        Exports (evaluated)
      </h2>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Source above is the indexed module without running it. Evaluation is opt-in (SES).
      </p>
      {!evaluate ? (
        <button
          type="button"
          onClick={() => setEvaluate(true)}
          className="text-sm font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Load exports
        </button>
      ) : null}
      {evaluate && exportsError ? (
        <InlineAlert variant="warning" className="mb-3">
          Could not evaluate exports: {exportsError}
        </InlineAlert>
      ) : null}
      {evaluate && exports ? <ModuleExports exports={exports} /> : null}
      {evaluate && loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading exports…</p>
      ) : null}
    </section>
  )
}

function Module() {
  const computer = useContext(ComputerContext)
  const { rev: modSpec } = useParams<{ rev: string }>()

  const { data, loading, error: loadError } = useAsync(
    () => computer.getModule(modSpec!),
    [computer, modSpec],
    Boolean(modSpec),
    getErrorMessage,
  )
  const record = loading ? null : data

  if (!modSpec) {
    return (
      <div className="w-full">
        <PageHeader title="Module" subtitle="Missing module specifier." />
      </div>
    )
  }

  return (
    <div className="w-full relative space-y-4">
      <PageHeader
        eyebrow="Module"
        title="Detail"
        actions={
          <Link
            to="/modules"
            className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← All modules
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
        <p className="text-xs sm:text-sm font-mono text-gray-700 dark:text-gray-300 break-all flex-1 min-w-0">
          {modSpec}
        </p>
        <CopyButton text={modSpec} label="Copy" className="text-sm px-1" />
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 animate-pulse" />
          <div className="h-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 animate-pulse" />
        </div>
      ) : null}

      {loadError && !record && !loading ? (
        <InlineAlert variant="error" title="Module not found">
          {loadError ||
            'It may not be indexed yet, or the node may be missing the Module table (0.27+).'}
        </InlineAlert>
      ) : null}

      {record && !loading ? (
        <>
          <section>
            <h2 className="mb-2 text-base sm:text-lg font-semibold dark:text-white">On-chain meta</h2>
            <ModuleMeta record={record} />
          </section>

          <ModuleSource ept={record.ept} />

          <EvaluatedExports key={modSpec} modSpec={modSpec} />
        </>
      ) : null}
    </div>
  )
}

export default Module
