import { ReactNode, RefObject } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '@bitcoin-computer/components'

export type PlaygroundResult = {
  status: 'success' | 'error'
  title: string
  data: unknown
}

export function Panel({
  title,
  badge,
  actions,
  children,
  className = '',
  bodyClassName = 'p-3 sm:p-4',
}: {
  title?: string
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className}`}
    >
      {(title || badge || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {title ? (
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            ) : null}
            {badge}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-1.5">{actions}</div> : null}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function EditorToolbar({
  onCopy,
  onReset,
  onClear,
  canReset,
  canClear,
}: {
  onCopy: () => void
  onReset: () => void
  onClear: () => void
  canReset: boolean
  canClear: boolean
}) {
  const btn =
    'text-xs font-medium px-2 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
  return (
    <>
      <button type="button" className={btn} onClick={onCopy} disabled={!canClear}>
        Copy
      </button>
      <button type="button" className={btn} onClick={onReset} disabled={!canReset}>
        Reset
      </button>
      <button type="button" className={btn} onClick={onClear} disabled={!canClear}>
        Clear
      </button>
    </>
  )
}

export const inputClassName =
  'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white'

export const secondaryBtnClassName =
  'text-sm font-medium text-blue-700 border border-blue-600 rounded-lg px-3 py-1.5 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-950/40 disabled:opacity-40 disabled:cursor-not-allowed'

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  title,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  title?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-blue-800'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function ActionBar({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  loggedIn,
  onPreview,
  previewDisabled,
  previewLabel = 'Preview',
}: {
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  loggedIn: boolean
  /** Optional secondary action (e.g. Validate on Deploy). Effect preview lives on EffectPanel. */
  onPreview?: () => void
  previewDisabled?: boolean
  previewLabel?: string
}) {
  return (
    <>
      <div className="hidden sm:flex flex-wrap items-center gap-3">
        {onPreview ? (
          <button
            type="button"
            onClick={onPreview}
            disabled={previewDisabled}
            className={secondaryBtnClassName}
            title="Encode without broadcasting (⌘/Ctrl+Shift+Enter)"
          >
            {previewLabel}
          </button>
        ) : null}
        <PrimaryButton
          onClick={onPrimary}
          disabled={primaryDisabled || !loggedIn}
          title="Broadcast (⌘/Ctrl+Enter)"
        >
          {primaryLabel}
        </PrimaryButton>
        {!loggedIn ? <Modal.ShowButton id="sign-in-modal" text="Sign in to broadcast" /> : null}
        <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden md:inline">
          {onPreview
            ? '⌘/Ctrl+Enter run · ⌘/Ctrl+Shift+Enter preview'
            : '⌘/Ctrl+Enter broadcast'}
        </span>
      </div>

      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-2 max-w-screen-xl mx-auto">
          {onPreview ? (
            <button
              type="button"
              onClick={onPreview}
              disabled={previewDisabled}
              className={`${secondaryBtnClassName} shrink-0`}
            >
              {previewLabel === 'Preview effect' ? 'Preview' : previewLabel}
            </button>
          ) : null}
          <PrimaryButton
            onClick={onPrimary}
            disabled={primaryDisabled || !loggedIn}
            className="flex-1"
          >
            {primaryLabel}
          </PrimaryButton>
          {!loggedIn ? (
            <span className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400 underline">
              <Modal.ShowButton id="sign-in-modal" text="Sign in" />
            </span>
          ) : null}
        </div>
      </div>
      <div className="sm:hidden h-16" aria-hidden />
    </>
  )
}

export function EmptyWorkspace({ onPickExample }: { onPickExample?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-900/40 px-4 py-10 text-center">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        Start with an example or paste code
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-3">
        Pick NFT, Token, Counter, or Chat from the examples, or paste a{' '}
        <code className="text-[11px]">Contract</code> class into the editor.
      </p>
      {onPickExample ? (
        <button
          type="button"
          onClick={onPickExample}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Load Counter example
        </button>
      ) : null}
    </div>
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
  } else if (data && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as { _rev?: string; type?: string; res?: unknown }
    if (obj._rev) {
      const isModule = obj.type === 'modules'
      const path = isModule ? `/modules/${obj._rev}` : `/objects/${obj._rev}`
      const label = isModule ? 'module' : 'object'
      const txId = obj._rev.includes(':') ? obj._rev.split(':')[0] : undefined
      body = (
        <div className="space-y-2 text-sm">
          <p>
            Created {isModule ? 'a' : 'an'}{' '}
            <Link to={path} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              {label}
            </Link>
            .
          </p>
          <p className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
            <span className="text-gray-500 dark:text-gray-400">rev </span>
            {obj._rev}
          </p>
          {txId ? (
            <p>
              <Link
                to={`/transactions/${txId}`}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                View transaction →
              </Link>
            </p>
          ) : null}
        </div>
      )
    } else {
      body = (
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      )
    }
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
