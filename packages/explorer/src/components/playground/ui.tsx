import { ReactNode } from 'react'
import { EmptyState } from '../ui/EmptyState'
import { TrashIcon } from '../ui/icons'
import { inputClassName, secondaryBtnClassName } from './classes'

export type { PlaygroundResult, PlaygroundRevData } from './types'
export { ActionBar } from './ActionBar'
export { ResultPanel } from './ResultPanel'

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

export function TypeSelect({
  id,
  value,
  options,
  onChange,
}: {
  id?: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClassName} w-32`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

export function SourceBadge({ exampleLoaded }: { exampleLoaded: boolean }) {
  return exampleLoaded ? (
    <span className="text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
      Example loaded
    </span>
  ) : (
    <span className="text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
      Custom
    </span>
  )
}

export function RemoveRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
      aria-label={label}
      title="Remove"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  )
}

export function FieldList({
  count,
  empty,
  onAdd,
  addLabel,
  children,
}: {
  count: number
  empty: ReactNode
  onAdd: () => void
  addLabel: string
  children: ReactNode
}) {
  return (
    <>
      {count === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{empty}</p>
      ) : (
        <div className="space-y-2 mb-3">{children}</div>
      )}
      <button type="button" onClick={onAdd} className={secondaryBtnClassName}>
        {addLabel}
      </button>
    </>
  )
}

export function EmptyWorkspace({ onPickExample }: { onPickExample?: () => void }) {
  return (
    <EmptyState
      title="Start with an example or paste code"
      className="bg-gray-50/80 dark:bg-gray-900/40 px-4 py-10"
    >
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
    </EmptyState>
  )
}
