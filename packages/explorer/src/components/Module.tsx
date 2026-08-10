import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ModuleRecord } from '@bitcoin-computer/lib'
import { ComputerContext, UtilsContext } from '@bitcoin-computer/components'
import { capitalizeFirstLetter, getErrorMessage } from '../utils'
import { Card } from './Card'
import { ModuleSource } from './ModuleSource'

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline px-1"
      aria-label={label}
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

function formatTimestamp(timestamp?: string | number): string {
  if (timestamp === undefined || timestamp === null || timestamp === '') return '—'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return String(timestamp)
  return date.toLocaleString()
}

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
              to={`/blocks/${record.blockHash}`}
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
        <dd className="mt-0.5 dark:text-gray-200">{formatTimestamp(record.timestamp)}</dd>
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
            value !== null && value !== undefined && typeof (value as { toString?: () => string }).toString === 'function'
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

function Module() {
  const computer = useContext(ComputerContext)
  const { rev: modSpec } = useParams<{ rev: string }>()
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  const [record, setRecord] = useState<ModuleRecord | null>(null)
  const [exports, setExports] = useState<Record<string, unknown> | null>(null)
  const [exportsError, setExportsError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!modSpec) return

    let cancelled = false

    const fetchModule = async () => {
      try {
        showLoader(true)
        setNotFound(false)
        setRecord(null)
        setExports(null)
        setExportsError(null)

        const row = await computer.getModule(modSpec)
        if (cancelled) return
        setRecord(row)

        try {
          const loaded = await computer.load(modSpec)
          if (!cancelled) setExports(loaded as Record<string, unknown>)
        } catch (error) {
          if (!cancelled) {
            setExportsError(getErrorMessage(error))
            console.warn('Could not evaluate module exports', error)
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching module', error)
          setNotFound(true)
          showSnackBar(getErrorMessage(error) || 'Error fetching module', false)
        }
      } finally {
        if (!cancelled) showLoader(false)
      }
    }

    fetchModule()
    return () => {
      cancelled = true
    }
    // showLoader / showSnackBar are not stable (recreated each UtilsProvider render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer, modSpec])

  if (!modSpec) {
    return (
      <div className="pt-4 w-full">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Module</h1>
        <p className="text-gray-500 dark:text-gray-400">Missing module specifier.</p>
      </div>
    )
  }

  return (
    <div className="pt-4 w-full relative">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h1 className="text-5xl font-extrabold dark:text-white">Module</h1>
        <Link
          to="/modules"
          className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline mt-2"
        >
          ← All modules
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 font-mono break-all">
          {modSpec}
        </p>
        <CopyButton text={modSpec} label="Copy mod" />
      </div>

      {notFound && !record ? (
        <p className="text-gray-500 dark:text-gray-400">
          Module not found. It may not be indexed yet, or the node may be missing the Module table
          (0.27+).
        </p>
      ) : null}

      {record ? (
        <>
          <section className="mb-6">
            <h2 className="mb-3 text-2xl font-bold dark:text-white">On-chain meta</h2>
            <ModuleMeta record={record} />
          </section>

          <ModuleSource ept={record.ept} />

          <section className="mt-10">
            <h2 className="mb-2 text-2xl font-bold dark:text-white">Exports (evaluated)</h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Result of loading the module in a SES compartment. Prefer the source above for
              inspection without evaluation.
            </p>
            {exportsError ? (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Could not evaluate exports: {exportsError}
              </p>
            ) : null}
            {exports ? <ModuleExports exports={exports} /> : null}
            {!exports && !exportsError ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading exports…</p>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  )
}

export default Module
