import { DependencyList, useCallback, useEffect, useState } from 'react'

const defaultFormatError = (e: unknown) =>
  e instanceof Error ? e.message : 'Error occurred'

/**
 * Run an async factory whenever `deps` change (or `reload()` is called).
 * Cancels stale in-flight work so late results do not overwrite newer ones.
 */
export function useAsync<T>(
  factory: () => Promise<T>,
  deps: DependencyList,
  enabled = true,
  formatError: (e: unknown) => string = defaultFormatError,
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setError(null)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    factory()
      .then((value) => {
        if (!cancelled) {
          setData(value)
          setError(null)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(formatError(e))
          setData(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // factory is captured from the render that changed deps/tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled, formatError])

  return { data, loading, error, reload }
}
