export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  href?: string
  onClick?: () => void
}

export interface ToastOptions {
  message: string
  title?: string
  variant?: ToastVariant
  /** Auto-dismiss delay. 0 = sticky until dismissed. Defaults by variant. */
  durationMs?: number
  action?: ToastAction
  /** Replace an existing toast with the same id instead of stacking. */
  id?: string
}

export interface ToastItem {
  id: string
  message: string
  title?: string
  variant: ToastVariant
  durationMs: number
  action?: ToastAction
}

export const DEFAULT_TOAST_DURATION: Record<ToastVariant, number> = {
  success: 2800,
  info: 3000,
  warning: 5000,
  error: 5000,
}

export const MAX_VISIBLE_TOASTS = 3
