import { Link, useNavigate } from 'react-router-dom'

/**
 * Success / result body for smart-call modals (playground and other callers).
 * Object method calls on the explorer objects page use toast only (see SmartObjectFunction).
 * Styling aligns with InlineAlert success / error variants.
 */
export function FunctionResultModalContent({ functionResult }: any) {
  const navigate = useNavigate()

  if (functionResult && typeof functionResult === 'object' && !Array.isArray(functionResult)) {
    if (functionResult._rev && !functionResult.type && !functionResult.res) {
      // Method call success: only {_rev}
      return (
        <div
          id="smart-call-execution-success"
          className="p-4 md:p-5"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-3 text-sm">
            <p className="font-semibold mb-1">Method executed</p>
            <p className="mb-2 opacity-90">
              A new revision was created on chain.
            </p>
            <Link
              id="smart-call-execution-counter-link"
              to={`/objects/${functionResult._rev}`}
              className="font-medium underline underline-offset-2 hover:opacity-90"
              onClick={() => {
                navigate(`/objects/${functionResult._rev}`)
                window.location.reload()
              }}
            >
              View latest revision →
            </Link>
          </div>
        </div>
      )
    }

    const isModule = functionResult.type === 'modules'
    const path = isModule ? `/modules/${functionResult._rev}` : `/objects/${functionResult._rev}`
    const label = isModule ? 'module' : 'on chain object'

    return (
      <div
        id="smart-call-execution-success"
        className="p-4 md:p-5"
        role="status"
        aria-live="polite"
      >
        <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-3 text-sm">
          <p className="font-semibold mb-1">Created successfully</p>
          <p>
            You created {isModule ? 'a' : 'an'}&nbsp;
            <Link
              id="smart-call-execution-counter-link"
              to={path}
              className="font-medium underline underline-offset-2 hover:opacity-90"
              onClick={() => {
                navigate(path)
                window.location.reload()
              }}
            >
              {label}
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  if (
    functionResult &&
    typeof functionResult === 'object' &&
    functionResult._rev &&
    functionResult.res != null
  ) {
    return (
      <div className="p-4 md:p-5" role="status" aria-live="polite">
        <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-3 text-sm">
          <p className="font-semibold mb-1">Value created</p>
          <p className="mb-2 text-xs opacity-90 font-mono break-all">
            Revision {functionResult._rev}
          </p>
          <pre className="text-xs whitespace-pre-wrap break-words bg-white/50 dark:bg-black/20 rounded p-2">
            {functionResult.res.toString()}
          </pre>
        </div>
      </div>
    )
  }

  // Fallback: plain message (legacy error modal path or string result)
  const isErrorLike =
    typeof functionResult === 'string' &&
    (functionResult.toLowerCase().includes('error') ||
      functionResult.toLowerCase().includes('fail') ||
      functionResult.toLowerCase().includes('not authorized'))

  return (
    <div className="p-4 md:p-5" role={isErrorLike ? 'alert' : 'status'}>
      <div
        className={`rounded-lg border p-3 text-sm ${
          isErrorLike
            ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        <p className="break-words">{functionResult}</p>
      </div>
    </div>
  )
}
