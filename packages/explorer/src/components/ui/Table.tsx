import { ReactNode } from 'react'

export type TableColumn = {
  key: string
  label: string
  className?: string
}

export const tdClass = 'px-3 py-2'

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-11 border-b last:border-0 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 animate-pulse"
        />
      ))}
    </div>
  )
}

export function TableRow({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <tr
      className={`bg-white border-b last:border-0 dark:bg-gray-900 dark:border-gray-800 ${className}`}
    >
      {children}
    </tr>
  )
}

export function DataTable({
  columns,
  children,
  empty,
}: {
  columns: TableColumn[]
  children: ReactNode
  empty?: ReactNode
}) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={`px-3 py-2 ${col.className ?? ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
          {empty ? (
            <TableRow>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-gray-500">
                {empty}
              </td>
            </TableRow>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

export function Pager({
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  info,
}: {
  onPrev: () => void
  onNext: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
  prevLabel?: string
  nextLabel?: string
  info?: ReactNode
}) {
  const btn =
    'px-3 h-8 text-sm border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'

  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      {info ? <p className="text-xs text-gray-500 dark:text-gray-400">{info}</p> : <span />}
      <div className="inline-flex -space-x-px">
        <button
          type="button"
          disabled={prevDisabled}
          onClick={onPrev}
          className={`${btn} rounded-l-lg`}
        >
          {prevLabel}
        </button>
        <button
          type="button"
          disabled={nextDisabled}
          onClick={onNext}
          className={`${btn} rounded-r-lg`}
        >
          {nextLabel}
        </button>
      </div>
    </nav>
  )
}
