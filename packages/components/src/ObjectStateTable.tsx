import type { ReactNode } from 'react'
import { capitalizeFirstLetter, isValidRevString } from './common/utils'

const SYSTEM_KEYS = new Set(['_id', '_rev', '_owners', '_root', '_satoshis'])
const ROW_HEIGHT_PX = 32
export const DEFAULT_MAX_VISIBLE_ROWS = 3

function truncateRev(rev: string, head = 8, tail = 6): string {
  if (!rev) return ''
  const [txId, vout] = rev.split(':')
  if (!txId || txId.length <= head + tail) return rev
  return `${txId.slice(0, head)}…${txId.slice(-tail)}:${vout ?? '0'}`
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 shrink-0">
      {type}
    </span>
  )
}

function formatStatePreview(value: unknown): { type: string; preview: ReactNode } {
  if (value === null) {
    return { type: 'null', preview: <span className="text-gray-400 italic">null</span> }
  }
  if (value === undefined) {
    return {
      type: 'undefined',
      preview: <span className="text-gray-400 italic">undefined</span>,
    }
  }
  if (typeof value === 'boolean') {
    return {
      type: 'boolean',
      preview: (
        <span
          className={
            value ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
          }
        >
          {String(value)}
        </span>
      ),
    }
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return {
      type: typeof value,
      preview: (
        <span className="tabular-nums font-medium text-gray-900 dark:text-white">
          {value.toString()}
        </span>
      ),
    }
  }
  if (typeof value === 'string') {
    if (isValidRevString(value)) {
      return {
        type: 'rev',
        preview: <span className="font-mono text-xs">{truncateRev(value)}</span>,
      }
    }
    const short = value.length > 80 ? `${value.slice(0, 80)}…` : value
    return {
      type: 'string',
      preview: (
        <span className="text-gray-900 dark:text-gray-100">
          {value === '' ? <span className="text-gray-400 italic">empty</span> : short}
        </span>
      ),
    }
  }
  if (Array.isArray(value)) {
    return {
      type: `array[${value.length}]`,
      preview: (
        <span className="text-gray-600 dark:text-gray-300 text-xs">
          {value.length} item{value.length === 1 ? '' : 's'}
        </span>
      ),
    }
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value as object)
    return {
      type: 'object',
      preview: (
        <span className="text-gray-600 dark:text-gray-300 text-xs">
          {keys.length} key{keys.length === 1 ? '' : 's'}
          {keys.length > 0 ? `: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '…' : ''}` : ''}
        </span>
      ),
    }
  }
  return {
    type: typeof value,
    preview: <span>{String(value)}</span>,
  }
}

function publicEntries(smartObject: unknown): [string, unknown][] {
  if (smartObject == null || typeof smartObject !== 'object') return []
  return Object.entries(smartObject as Record<string, unknown>).filter(
    ([key, value]) => !SYSTEM_KEYS.has(key) && typeof value !== 'function',
  )
}

function StateRow({ name, value }: { name: string; value: unknown }) {
  const { type, preview } = formatStatePreview(value)
  return (
    <div
      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
      style={{ height: ROW_HEIGHT_PX }}
    >
      <div className="h-full px-0.5 flex items-center gap-1.5 min-h-0">
        <div className="shrink-0 w-[4.5rem] min-w-0">
          <span
            className="block text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap truncate"
            title={name}
          >
            {capitalizeFirstLetter(name)}
          </span>
        </div>
        <TypeBadge type={type} />
        <div className="min-w-0 flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
          {preview}
        </div>
      </div>
    </div>
  )
}

export function ObjectStateTable({
  smartObject,
  maxVisibleRows = DEFAULT_MAX_VISIBLE_ROWS,
}: {
  smartObject: unknown
  maxVisibleRows?: number
}) {
  const entries = publicEntries(smartObject)
  if (entries.length === 0) {
    return <p className="text-[11px] text-gray-500 dark:text-gray-400">No public properties</p>
  }

  const scroll = entries.length > maxVisibleRows
  return (
    <div
      className={scroll ? 'overflow-y-auto overscroll-contain' : undefined}
      style={scroll ? { maxHeight: maxVisibleRows * ROW_HEIGHT_PX } : undefined}
    >
      {entries.map(([key, value]) => (
        <StateRow key={key} name={key} value={value} />
      ))}
    </div>
  )
}
