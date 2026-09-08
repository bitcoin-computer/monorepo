import { toObject } from '@bitcoin-computer/components'
import { Panel, secondaryBtnClassName } from './ui'

function safeStringify(value: unknown): string {
  try {
    if (value !== null && typeof value === 'object') {
      // Prefer explorer-style bigint-safe stringify when possible
      return toObject(value)
    }
    return String(value)
  } catch {
    try {
      return JSON.stringify(
        value,
        (_k, v) => (typeof v === 'bigint' ? v.toString() : v),
        2,
      )
    } catch {
      return String(value)
    }
  }
}

export type EffectPreviewData = {
  /** Dry-run vs broadcast */
  kind: 'preview' | 'broadcast'
  res: unknown
  env?: Record<string, unknown>
  txId?: string
  txHexLength?: number
  note?: string
}

/**
 * Always-visible effect panel: Preview control lives in the header (desktop + mobile).
 * Body shows dry-run / broadcast result, or short empty-state guidance.
 */
export function EffectPanel({
  data,
  onPreview,
  previewDisabled,
  onDismiss,
}: {
  data: EffectPreviewData | null
  onPreview: () => void
  previewDisabled?: boolean
  onDismiss?: () => void
}) {
  const isPreview = data?.kind === 'preview'
  const hasData = Boolean(data)

  return (
    <Panel
      title={hasData ? (isPreview ? 'Preview — new state' : 'Effect — new state') : 'Effect'}
      badge={
        hasData ? (
          <span
            className={`text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 ${
              isPreview
                ? 'bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200'
                : 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
            }`}
          >
            {isPreview ? 'Dry-run' : 'On-chain'}
          </span>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            Not run
          </span>
        )
      }
      actions={
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={onPreview}
            disabled={previewDisabled}
            className={`${secondaryBtnClassName} whitespace-nowrap`}
            title="Encode without broadcasting (⌘/Ctrl+Shift+Enter)"
          >
            Preview effect
          </button>
          {hasData && onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-1.5 py-1"
            >
              Dismiss
            </button>
          ) : null}
        </div>
      }
    >
      {!hasData ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="text-xs leading-relaxed">
            Run <strong className="font-medium text-gray-700 dark:text-gray-300">Preview effect</strong>{' '}
            to encode without broadcasting. New state from{' '}
            <code className="text-[11px]">effect.res</code> appears here.
          </p>
          <p className="text-[11px] mt-2 text-gray-400 dark:text-gray-500 hidden sm:block">
            Shortcut: ⌘/Ctrl+Shift+Enter
          </p>
        </div>
      ) : (
        <EffectBody data={data!} />
      )}
    </Panel>
  )
}

function EffectBody({ data }: { data: EffectPreviewData }) {
  const isPreview = data.kind === 'preview'

  return (
    <>
      {data.note ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.note}</p>
      ) : null}

      <div className="space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            effect.res
          </p>
          <pre
            className="text-xs font-mono p-2.5 rounded-md bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-x-auto max-h-56 whitespace-pre-wrap break-words"
            tabIndex={0}
          >
            {safeStringify(data.res)}
          </pre>
        </div>

        {data.env && Object.keys(data.env).length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              effect.env
            </p>
            <pre className="text-xs font-mono p-2.5 rounded-md bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
              {safeStringify(data.env)}
            </pre>
          </div>
        ) : null}

        {data.txId ? (
          <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
            txId {data.txId}
          </p>
        ) : null}
        {data.txHexLength != null ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Encoded tx ~{data.txHexLength} hex chars
            {isPreview ? ' (unsigned / unfunded if dry-run)' : ''}
          </p>
        ) : null}
      </div>
    </>
  )
}


