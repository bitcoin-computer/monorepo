import { useState } from 'react'

/**
 * Read-only monospace panel for indexed module source (`ept`).
 */
export function ModuleSource({ ept }: { ept: string }) {
  const [copied, setCopied] = useState(false)
  const lineCount = ept.length === 0 ? 0 : ept.split('\n').length

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ept)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable in some contexts; ignore.
    }
  }

  return (
    <section className="w-full mt-6">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-baseline gap-3 min-w-0">
          <h2 className="text-2xl font-bold dark:text-white">Source</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline px-2 py-1"
          aria-label="Copy module source"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="block max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <pre className="p-4 text-xs font-mono whitespace-pre text-gray-800 dark:text-gray-200">
          {ept}
        </pre>
      </div>
    </section>
  )
}
