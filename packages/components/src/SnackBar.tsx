import { useEffect } from 'react'
import type { ToastItem, ToastVariant } from './toastTypes'

const variantStyles: Record<
  ToastVariant,
  { box: string; icon: string; close: string }
> = {
  success: {
    box: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400',
    close: 'text-green-600 dark:text-green-400',
  },
  error: {
    box: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
    close: 'text-red-600 dark:text-red-400',
  },
  warning: {
    box: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    close: 'text-amber-700 dark:text-amber-400',
  },
  info: {
    box: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    close: 'text-blue-700 dark:text-blue-400',
  },
}

function VariantIcon({ variant }: { variant: ToastVariant }) {
  const className = `h-5 w-5 shrink-0 ${variantStyles[variant].icon}`
  if (variant === 'success') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )
  }
  if (variant === 'error') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    )
  }
  if (variant === 'warning') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/** @deprecated Prefer Toast from UtilsContext.toast — kept for direct imports */
export function SnackBar(props: {
  message: string
  success: boolean
  hideSnackBar: () => void
}) {
  const { message, success, hideSnackBar } = props
  return (
    <Toast
      item={{
        id: 'legacy',
        message,
        variant: success ? 'success' : 'error',
        durationMs: 3000,
      }}
      onDismiss={hideSnackBar}
    />
  )
}

export function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const { id, message, title, variant, durationMs = 3000, action } = item
  const styles = variantStyles[variant]
  const isAssertive = variant === 'error' || variant === 'warning'

  useEffect(() => {
    if (durationMs <= 0) return undefined
    const timer = setTimeout(() => onDismiss(id), durationMs)
    return () => clearTimeout(timer)
  }, [id, durationMs, onDismiss])

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-lg border shadow-sm px-3 py-2.5 ${styles.box}`}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-2.5">
        <VariantIcon variant={variant} />
        <div className="min-w-0 flex-1 pt-0.5">
          {title ? <p className="text-sm font-semibold mb-0.5">{title}</p> : null}
          <p className="text-sm font-medium break-words">{message}</p>
          {action ? (
            action.href ? (
              <a
                href={action.href}
                className="mt-1 inline-block text-xs font-medium underline underline-offset-2 opacity-90 hover:opacity-100"
              >
                {action.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="mt-1 text-xs font-medium underline underline-offset-2 opacity-90 hover:opacity-100"
              >
                {action.label}
              </button>
            )
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className={`shrink-0 p-1.5 -m-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-current/30 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:p-1 flex items-center justify-center ${styles.close}`}
          aria-label="Dismiss notification"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ToastHost({
  items,
  onDismiss,
}: {
  items: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed z-[60] flex flex-col gap-2 p-3
        top-[max(0.75rem,env(safe-area-inset-top))] inset-x-0 items-center
        sm:top-auto sm:inset-x-auto sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:right-[max(0.75rem,env(safe-area-inset-right))] sm:items-end sm:max-w-sm sm:w-full"
      aria-label="Notifications"
    >
      {items.map((item) => (
        <Toast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
