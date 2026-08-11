import { ReactNode } from 'react'

/**
 * Consistent page title strip used across explorer views.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  monoTitle,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  /** Use monospace for long hashes/addresses as the title */
  monoTitle?: boolean
}) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={`text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white leading-snug ${
            monoTitle ? 'font-mono break-all' : ''
          }`}
        >
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </header>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {children}
    </h2>
  )
}

export function StatCard({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm ${className}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
        {label}
      </p>
      <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white tabular-nums">
        {children}
      </div>
    </div>
  )
}
