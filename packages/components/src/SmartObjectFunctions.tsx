import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SmartObjectFunction, getParameterNames } from './SmartObjectFunction'
import { highlightJs } from './jsHighlight'

/** Built-in / prototype noise we never treat as smart-object methods */
const SKIP_METHOD_NAMES = new Set([
  'constructor',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
  'toJSON',
])

/**
 * Collect callable methods from the object's prototype chain.
 */
export function methodNamesFrom(smartObject: unknown): string[] {
  if (!smartObject || (typeof smartObject !== 'object' && typeof smartObject !== 'function')) {
    return []
  }

  const names: string[] = []
  const seen = new Set<string>()

  try {
    let proto: object | null = Object.getPrototypeOf(smartObject)
    while (proto && proto !== Object.prototype) {
      let keys: string[] = []
      try {
        keys = Object.getOwnPropertyNames(proto)
      } catch {
        keys = []
      }

      for (const key of keys) {
        if (seen.has(key) || SKIP_METHOD_NAMES.has(key)) continue
        try {
          const desc = Object.getOwnPropertyDescriptor(proto, key)
          const value = desc && 'value' in desc ? desc.value : (proto as any)[key]
          if (typeof value === 'function') {
            seen.add(key)
            names.push(key)
          }
        } catch {
          // SES / revoked proxy — skip
        }
      }

      try {
        proto = Object.getPrototypeOf(proto)
      } catch {
        break
      }
    }
  } catch {
    return names
  }

  return names
}

function getMethodFn(smartObject: any, name: string): ((...args: unknown[]) => unknown) | null {
  try {
    let proto: object | null = Object.getPrototypeOf(smartObject)
    while (proto && proto !== Object.prototype) {
      try {
        const desc = Object.getOwnPropertyDescriptor(proto, name)
        if (desc && 'value' in desc && typeof desc.value === 'function') {
          return desc.value
        }
        const v = (proto as any)[name]
        if (typeof v === 'function') return v
      } catch {
        // continue walking
      }
      try {
        proto = Object.getPrototypeOf(proto)
      } catch {
        break
      }
    }
  } catch {
    return null
  }
  return null
}

function arityOf(smartObject: any, name: string): number {
  try {
    const fn = getMethodFn(smartObject, name)
    if (!fn) return 0
    return getParameterNames(fn).filter(Boolean).length
  } catch {
    return 0
  }
}

function sourceOf(smartObject: any, name: string): string {
  try {
    const fn = getMethodFn(smartObject, name)
    if (!fn) return ''
    return fn.toString()
  } catch {
    return ''
  }
}

function CopyCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      }}
      className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export const SmartObjectFunctions = ({
  smartObject,
  functionsExist,
  options,
  latestRev,
}: {
  smartObject: any
  functionsExist: boolean
  options: string[]
  latestRev?: string
}) => {
  const methods = useMemo(() => methodNamesFrom(smartObject), [smartObject])
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    if (methods.length === 0) {
      setSelected('')
      return
    }
    setSelected((prev) => (prev && methods.includes(prev) ? prev : methods[0]))
  }, [methods])

  const hasMethods = methods.length > 0 || functionsExist
  const isHistorical = Boolean(latestRev && smartObject?._rev && latestRev !== smartObject._rev)

  // Always have a concrete selection when methods exist
  const activeMethod = selected && methods.includes(selected) ? selected : methods[0]
  const selectedSource = methods.length > 0 ? sourceOf(smartObject, activeMethod) : ''
  const highlightedSource = useMemo(() => highlightJs(selectedSource), [selectedSource])

  if (!hasMethods || methods.length === 0) {
    return (
      <section
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
        aria-label="Methods"
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Methods
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Callable functions on this smart object
          </p>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No public methods on this object.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
      aria-label="Methods"
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Methods
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {methods.length} method{methods.length === 1 ? '' : 's'} · select one to call
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 tabular-nums">
          {methods.length}
        </span>
      </div>

      {isHistorical ? (
        <div className="px-4 py-2.5 border-b border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-sm text-amber-900 dark:text-amber-200">
          You are viewing a historical revision. Method calls that spend this object will fail.{' '}
          <Link
            to={`/objects/${latestRev}`}
            className="font-medium underline underline-offset-2 hover:opacity-90"
          >
            Go to latest revision →
          </Link>
        </div>
      ) : null}

      {/* Three columns: methods · javascript · call (params + effect). */}
      <div className="flex flex-row items-stretch min-h-[14rem] overflow-x-auto">
        <nav
          className="shrink-0 w-44 sm:w-52 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
          aria-label="Method list"
        >
          <ul
            className="p-1.5 space-y-0.5 overflow-y-auto max-h-80"
            role="listbox"
            aria-label="Available methods"
          >
            {methods.map((name) => {
              const isActive = name === activeMethod
              const arity = arityOf(smartObject, name)
              return (
                <li key={name} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => setSelected(name)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700/80'
                    }`}
                  >
                    <span className="font-medium font-mono text-[13px] block truncate" title={name}>
                      {name}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {arity === 0 ? 'no args' : `${arity} arg${arity === 1 ? '' : 's'}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div
          className="flex-1 min-w-[12rem] flex flex-col border-r border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-950/40"
          aria-label="Method source"
        >
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              JavaScript
            </p>
            <CopyCode text={selectedSource} />
          </div>
          {selectedSource ? (
            <pre className="p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-80 whitespace-pre-wrap break-words leading-relaxed">
              {highlightedSource}
            </pre>
          ) : (
            <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
              Source unavailable for this method.
            </p>
          )}
        </div>

        <SmartObjectFunction
          key={activeMethod}
          funcName={activeMethod}
          smartObject={smartObject}
          functionsExist
          options={options}
          latestRev={latestRev}
          embedded
        />
      </div>
    </section>
  )
}
