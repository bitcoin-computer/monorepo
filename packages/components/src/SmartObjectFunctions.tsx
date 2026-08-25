import { useEffect, useMemo, useState } from 'react'
import { SmartObjectFunction, getParameterNames } from './SmartObjectFunction'

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

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const SmartObjectFunctions = ({
  smartObject,
  functionsExist,
  options,
}: {
  smartObject: any
  functionsExist: boolean
  options: string[]
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

  // Always have a concrete selection when methods exist
  const activeMethod = selected && methods.includes(selected) ? selected : methods[0]

  const selectedParams = (() => {
    try {
      const fn = getMethodFn(smartObject, activeMethod)
      if (!fn) return [] as string[]
      return getParameterNames(fn).filter(Boolean)
    } catch {
      return [] as string[]
    }
  })()

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

      {/* Two sides: left = method list, right = params + call (always side-by-side) */}
      <div className="flex flex-row items-stretch min-h-[14rem]">
        {/* LEFT */}
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

        {/* RIGHT */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 overflow-x-auto bg-white dark:bg-gray-900">
          <div className="mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
              Call method
            </p>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white font-mono">
              {capitalizeFirstLetter(activeMethod)}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
              {activeMethod}({selectedParams.join(', ')})
            </p>
          </div>

          <SmartObjectFunction
            key={activeMethod}
            funcName={activeMethod}
            smartObject={smartObject}
            functionsExist
            options={options}
            embedded
          />
        </div>
      </div>
    </section>
  )
}
