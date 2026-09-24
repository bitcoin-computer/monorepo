import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { ToastHost } from './SnackBar'
import { Loader } from './Loader'
import {
  DEFAULT_TOAST_DURATION,
  MAX_VISIBLE_TOASTS,
  ToastItem,
  ToastOptions,
  ToastVariant,
} from './toastTypes'

export type { ToastOptions, ToastVariant, ToastItem } from './toastTypes'

export interface ToastApi {
  (options: ToastOptions): void
  success: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void
  error: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void
  info: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void
  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void
}

interface UtilsContextProps {
  /** Transient action feedback (success / error / info / warning). */
  toast: ToastApi
  showLoader: (show: boolean) => void
}

const utilsContext = createContext<UtilsContextProps | undefined>(undefined)

export const useUtilsComponents = (): UtilsContextProps => {
  const context = useContext(utilsContext)
  if (!context) throw new Error('useUtilsComponents must be used within a UtilsProvider')
  return context
}

interface UtilsProviderProps {
  children: ReactNode
}

let toastSeq = 0

function nextToastId(): string {
  toastSeq += 1
  return `toast-${toastSeq}-${Date.now()}`
}

export const UtilsProvider: React.FC<UtilsProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback((options: ToastOptions) => {
    const variant: ToastVariant = options.variant ?? 'info'
    const durationMs =
      options.durationMs !== undefined ? options.durationMs : DEFAULT_TOAST_DURATION[variant]
    const id = options.id ?? nextToastId()
    const item: ToastItem = {
      id,
      message: options.message,
      title: options.title,
      variant,
      durationMs,
      action: options.action,
    }
    setToasts((prev) => {
      const withoutDup = prev.filter((t) => t.id !== id)
      const next = [...withoutDup, item]
      return next.slice(-MAX_VISIBLE_TOASTS)
    })
  }, [])

  const toast = useMemo(() => {
    const api = ((options: ToastOptions) => pushToast(options)) as ToastApi
    api.success = (message, options) =>
      pushToast({ ...options, message, variant: 'success' })
    api.error = (message, options) => pushToast({ ...options, message, variant: 'error' })
    api.info = (message, options) => pushToast({ ...options, message, variant: 'info' })
    api.warning = (message, options) =>
      pushToast({ ...options, message, variant: 'warning' })
    return api
  }, [pushToast])

  const showLoader = useCallback((show: boolean) => {
    setIsLoading(show)
  }, [])

  const value = useMemo(() => ({ toast, showLoader }), [toast, showLoader])

  return (
    <utilsContext.Provider value={value}>
      {children}
      <ToastHost items={toasts} onDismiss={dismissToast} />
      {isLoading && <Loader />}
    </utilsContext.Provider>
  )
}

export const UtilsContext = {
  UtilsProvider,
  useUtilsComponents,
}
