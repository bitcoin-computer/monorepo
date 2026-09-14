import { ReactNode, RefObject } from 'react'
import { Link } from 'react-router-dom'
import { CopyButton } from '../ui/CopyButton'
import { explorerLinkClass } from '../ui/HexLink'
import { PlaygroundResult, PlaygroundRevData } from './types'

function isRevData(data: unknown): data is PlaygroundRevData {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  return (
    typeof (data as PlaygroundRevData)._rev === 'string' &&
    Boolean((data as PlaygroundRevData)._rev)
  )
}

export function ResultPanel({
  result,
  onDismiss,
  panelRef,
}: {
  result: PlaygroundResult | null
  onDismiss: () => void
  panelRef?: RefObject<HTMLDivElement>
}) {
  if (!result) return null

  const isSuccess = result.status === 'success'
  const data = result.data

  let body: ReactNode = null
  if (typeof data === 'string') {
    body = <p className="text-sm whitespace-pre-wrap break-words">{data}</p>
  } else if (isRevData(data)) {
    const isModule = data.type === 'modules'
    const path = isModule ? `/modules/${data._rev}` : `/objects/${data._rev}`
    const label = isModule ? 'module' : 'object'
    const txId = data._rev.includes(':') ? data._rev.split(':')[0] : undefined
    body = (
      <div className="space-y-2 text-sm">
        <p>
          Created {isModule ? 'a' : 'an'}{' '}
          <Link to={path} className={`font-medium ${explorerLinkClass}`}>
            {label}
          </Link>
          .
        </p>
        <p className="flex items-start gap-1.5 font-mono text-xs text-gray-700 dark:text-gray-300">
          <span className="min-w-0 break-all">
            <span className="text-gray-500 dark:text-gray-400">rev </span>
            {data._rev}
          </span>
          <CopyButton text={data._rev} label="Copy revision" icon />
        </p>
        {txId ? (
          <p>
            <Link
              to={`/transactions/${txId}`}
              className={`text-xs font-medium ${explorerLinkClass}`}
            >
              View transaction →
            </Link>
          </p>
        ) : null}
      </div>
    )
  } else if (data && typeof data === 'object') {
    body = (
      <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  } else {
    body = <p className="text-sm">{String(data)}</p>
  }

  return (
    <div
      ref={panelRef}
      className={`rounded-lg border p-3 sm:p-4 scroll-mt-24 ${
        isSuccess
          ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
          : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p
          className={`text-sm font-semibold ${
            isSuccess ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}
        >
          {result.title}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Dismiss
        </button>
      </div>
      <div
        className={
          isSuccess ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
        }
      >
        {body}
      </div>
    </div>
  )
}
