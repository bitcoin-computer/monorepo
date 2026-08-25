import { ReactNode } from 'react'

export function EmptyState({
  title,
  children,
  className = 'p-6',
  titleClassName = 'text-sm font-semibold text-gray-900 dark:text-white mb-1',
}: {
  title: ReactNode
  children?: ReactNode
  className?: string
  titleClassName?: string
}) {
  return (
    <div
      className={`rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center ${className}`}
    >
      <p className={titleClassName}>{title}</p>
      {children}
    </div>
  )
}
