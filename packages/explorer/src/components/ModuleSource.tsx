import { CopyButton } from './ui/CopyButton'

/**
 * Read-only monospace panel for indexed module source (`ept`).
 */
export function ModuleSource({ ept }: { ept: string }) {
  const lineCount = ept.length === 0 ? 0 : ept.split('\n').length

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold dark:text-white">Source</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>
        <CopyButton text={ept} label="Copy" />
      </div>
      <div className="block max-h-[60vh] overflow-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <pre className="p-3 text-xs font-mono whitespace-pre text-gray-800 dark:text-gray-200 leading-relaxed">
          {ept}
        </pre>
      </div>
    </section>
  )
}
