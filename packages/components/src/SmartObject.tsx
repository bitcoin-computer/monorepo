import { useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import reactStringReplace from 'react-string-replace'
import { HiOutlineClipboard, HiCheck } from 'react-icons/hi'
import { isDecryptionFailure } from './common/transition'
import { capitalizeFirstLetter, isValidRevString, toObject } from './common/utils'
import { methodNamesFrom, SmartObjectFunctions } from './SmartObjectFunctions'
import { ComputerContext } from './ComputerContext'
import { InlineAlert } from './InlineAlert'

const keywords = ['_id', '_rev', '_owners', '_root', '_satoshis']
/** Safety cap when walking first → next → … for the timeline */
const MAX_TIMELINE_REVS = 100

export const getFnParamNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : []
}

function truncateRev(rev: string, head = 8, tail = 6): string {
  if (!rev) return ''
  const [txId, vout] = rev.split(':')
  if (!txId || txId.length <= head + tail) return rev
  return `${txId.slice(0, head)}…${txId.slice(-tail)}:${vout ?? '0'}`
}

function Copy({ text }: { text: string }) {
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
      className="inline-flex items-center cursor-pointer pl-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white focus:outline-none shrink-0"
      aria-label="Copy"
    >
      {copied ? <HiCheck className="w-4 h-4 text-green-500" /> : <HiOutlineClipboard className="w-4 h-4" />}
    </button>
  )
}

/** Compact type badge for state values */
function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      {type}
    </span>
  )
}

function formatStatePreview(value: unknown): { type: string; preview: ReactNode; full: string } {
  if (value === null) {
    return { type: 'null', preview: <span className="text-gray-400 italic">null</span>, full: 'null' }
  }
  if (value === undefined) {
    return {
      type: 'undefined',
      preview: <span className="text-gray-400 italic">undefined</span>,
      full: 'undefined',
    }
  }
  if (typeof value === 'boolean') {
    return {
      type: 'boolean',
      preview: (
        <span className={value ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}>
          {String(value)}
        </span>
      ),
      full: String(value),
    }
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return {
      type: typeof value,
      preview: (
        <span className="tabular-nums font-medium text-gray-900 dark:text-white">{value.toString()}</span>
      ),
      full: value.toString(),
    }
  }
  if (typeof value === 'string') {
    if (isValidRevString(value)) {
      return {
        type: 'rev',
        preview: (
          <Link
            to={`/objects/${value}`}
            className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {truncateRev(value)}
          </Link>
        ),
        full: value,
      }
    }
    const short = value.length > 80 ? `${value.slice(0, 80)}…` : value
    return {
      type: 'string',
      preview: (
        <span className="text-gray-900 dark:text-gray-100 break-words">
          {value === '' ? <span className="text-gray-400 italic">empty</span> : short}
        </span>
      ),
      full: value,
    }
  }
  if (Array.isArray(value)) {
    const full = toObject(value)
    return {
      type: `array[${value.length}]`,
      preview: (
        <span className="text-gray-600 dark:text-gray-300 text-xs">
          {value.length} item{value.length === 1 ? '' : 's'}
        </span>
      ),
      full,
    }
  }
  if (typeof value === 'object') {
    const full = toObject(value)
    const keys = Object.keys(value as object)
    return {
      type: 'object',
      preview: (
        <span className="text-gray-600 dark:text-gray-300 text-xs">
          {keys.length} key{keys.length === 1 ? '' : 's'}
          {keys.length > 0 ? `: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '…' : ''}` : ''}
        </span>
      ),
      full,
    }
  }
  const full = String(value)
  return {
    type: typeof value,
    preview: <span className="break-all">{full}</span>,
    full,
  }
}

function StateValueRow({ name, value }: { name: string; value: unknown }) {
  const [expanded, setExpanded] = useState(false)
  const { type, preview, full } = formatStatePreview(value)
  const isComplex =
    (typeof value === 'object' && value !== null) ||
    (typeof value === 'string' && value.length > 80)
  const showExpand = isComplex || full.length > 80

  // Link revs inside expanded JSON
  const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g
  const expandedContent =
    typeof value === 'string' && !isComplex
      ? full
      : reactStringReplace(full, isRev, (match, i) => (
          <Link
            key={i}
            to={`/objects/${match}`}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {match}
          </Link>
        ))

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Single compact line: label · field · type · value · actions */}
      <div className="px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 min-h-0">
        <div className="shrink-0 flex items-center gap-1.5 w-[7.5rem] sm:w-36">
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap truncate">
            {capitalizeFirstLetter(name)}
          </span>
          <code className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap hidden sm:inline">
            {name}
          </code>
        </div>
        <TypeBadge type={type} />
        <div className="min-w-0 flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
          {preview}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {full && full !== 'null' && full !== 'undefined' ? <Copy text={full} /> : null}
          {showExpand ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline px-1"
            >
              {expanded ? 'Hide' : 'More'}
            </button>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <pre className="mx-3 sm:mx-4 mb-2 max-h-40 overflow-auto rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 p-2 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
          {expandedContent}
        </pre>
      ) : null}
    </div>
  )
}

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return null
  const entries = Object.entries(smartObject).filter(([k]) => !keywords.includes(k))
  if (entries.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
        No public properties on this object.
      </p>
    )
  }
  return (
    <div>
      {entries.map(([key, value]) => (
        <StateValueRow key={key} name={key} value={value} />
      ))}
    </div>
  )
}

/**
 * Single history section at top: nav controls + vertical timeline (revs linked by a line).
 */
function RevisionHistory({
  prev,
  next,
  first,
  latest,
  current,
  chain,
  loading,
  ancestorTxIds,
}: {
  prev?: string
  next?: string
  first?: string
  latest?: string
  current: string
  chain: string[]
  loading: boolean
  ancestorTxIds: string[]
}) {
  const isLatest = latest ? latest === current : !next
  const isFirst = first ? first === current : !prev
  const currentIndex = useMemo(
    () => chain.findIndex((r) => r === current),
    [chain, current],
  )

  const btnBase =
    'inline-flex items-center justify-center gap-1.5 px-3 h-9 text-sm font-medium rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800'
  const btnActive =
    'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border-blue-600'
  const btnIdle =
    'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700'
  const btnDisabled =
    'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'

  return (
    <section
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
      aria-label="Revision history"
    >
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Revision history
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {!loading && chain.length > 0
              ? `${chain.length} revision${chain.length === 1 ? '' : 's'}${
                  currentIndex >= 0 ? ` · viewing #${currentIndex + 1}` : ''
                }`
              : 'Navigate between object revisions'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {isFirst ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              First
            </span>
          ) : null}
          {isLatest ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
              Latest
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Historical
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Nav controls */}
        <div className="flex flex-wrap gap-2">
          {first && first !== current ? (
            <Link to={`/objects/${first}`} className={`${btnBase} ${btnIdle}`} title={first}>
              First
            </Link>
          ) : (
            <span className={`${btnBase} ${btnDisabled}`}>First</span>
          )}

          {prev ? (
            <Link to={`/objects/${prev}`} className={`${btnBase} ${btnActive}`} title={prev}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Link>
          ) : (
            <span className={`${btnBase} ${btnDisabled}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </span>
          )}

          {next ? (
            <Link to={`/objects/${next}`} className={`${btnBase} ${btnActive}`} title={next}>
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className={`${btnBase} ${btnDisabled}`}>
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}

          {latest && latest !== current ? (
            <Link to={`/objects/${latest}`} className={`${btnBase} ${btnIdle}`} title={latest}>
              Latest
            </Link>
          ) : (
            <span className={`${btnBase} ${btnDisabled}`}>Latest</span>
          )}
        </div>

        {/* Vertical timeline with connecting line */}
        {loading ? (
          <div className="animate-pulse space-y-2 ms-2">
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6" />
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/6" />
          </div>
        ) : chain.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No revision history available.</p>
        ) : (
          <ol className="relative border-s border-gray-200 dark:border-gray-700 ms-2">
            {chain.map((r, i) => {
              const isCurrent = r === current
              const isChainFirst = i === 0
              const isChainLast = i === chain.length - 1
              return (
                <li key={r} className="ms-4 pb-4 last:pb-0">
                  <span
                    className={`absolute flex items-center justify-center w-3 h-3 rounded-full -start-1.5 mt-1.5 ring-2 ring-white dark:ring-gray-900 ${
                      isCurrent
                        ? 'bg-blue-600'
                        : isChainLast
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                  <div
                    className={`rounded-lg border px-3 py-2 ${
                      isCurrent
                        ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40'
                        : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        #{i + 1}
                      </span>
                      {isChainFirst ? (
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          first
                        </span>
                      ) : null}
                      {isChainLast ? (
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                          latest
                        </span>
                      ) : null}
                      {isCurrent ? (
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                          viewing
                        </span>
                      ) : null}
                    </div>
                    {isCurrent ? (
                      <p className="font-mono text-xs text-gray-900 dark:text-white break-all">{r}</p>
                    ) : (
                      <Link
                        to={`/objects/${r}`}
                        className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {r}
                      </Link>
                    )}
                    <div className="mt-1">
                      <Link
                        to={`/transactions/${r.split(':')[0]}`}
                        className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        View transaction →
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        {(prev || next) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
            {prev ? (
              <p className="truncate" title={prev}>
                <span className="text-gray-400 dark:text-gray-500 font-sans">prev </span>
                <Link
                  to={`/objects/${prev}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {truncateRev(prev)}
                </Link>
              </p>
            ) : (
              <p className="text-gray-400 font-sans">No previous revision</p>
            )}
            {next ? (
              <p className="truncate sm:text-right" title={next}>
                <span className="text-gray-400 dark:text-gray-500 font-sans">next </span>
                <Link
                  to={`/objects/${next}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {truncateRev(next)}
                </Link>
              </p>
            ) : (
              <p className="text-gray-400 sm:text-right font-sans">No next revision</p>
            )}
          </div>
        )}

        {ancestorTxIds.length > 0 ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              Ancestor transactions ({ancestorTxIds.length})
            </summary>
            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-2">
              {ancestorTxIds.map((txId) => (
                <li key={txId}>
                  <Link
                    to={`/transactions/${txId}`}
                    className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {txId}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  )
}

function MetaDataPanel({ smartObject }: { smartObject: any }) {
  if (!smartObject) return null

  const rows: { label: string; short: string; value: ReactNode; copy?: string }[] = [
    {
      label: 'Identity',
      short: '_id',
      value: smartObject._id ? (
        <Link
          to={`/objects/${smartObject._id}`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all font-mono text-xs"
        >
          {smartObject._id}
        </Link>
      ) : (
        '—'
      ),
      copy: smartObject._id,
    },
    {
      label: 'Revision',
      short: '_rev',
      value: smartObject._rev ? (
        <Link
          to={`/objects/${smartObject._rev}`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all font-mono text-xs"
        >
          {smartObject._rev}
        </Link>
      ) : (
        '—'
      ),
      copy: smartObject._rev,
    },
    {
      label: 'Root',
      short: '_root',
      value: smartObject._root ? (
        <Link
          to={`/objects/${smartObject._root}`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline break-all font-mono text-xs"
        >
          {smartObject._root}
        </Link>
      ) : (
        '—'
      ),
      copy: smartObject._root,
    },
    {
      label: 'Owners',
      short: '_owners',
      value: (
        <span className="font-mono text-xs text-gray-900 dark:text-white break-all">
          {Array.isArray(smartObject._owners)
            ? smartObject._owners.join(', ')
            : String(smartObject._owners ?? '—')}
        </span>
      ),
      copy: JSON.stringify(smartObject._owners ?? null),
    },
    {
      label: 'Amount',
      short: '_satoshis',
      value: (
        <span className="font-medium text-gray-900 dark:text-white tabular-nums text-sm">
          {smartObject._satoshis?.toString?.() ?? String(smartObject._satoshis ?? '—')}
          <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">sats</span>
        </span>
      ),
      copy: String(smartObject._satoshis ?? ''),
    },
  ]

  return (
    <section
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
      aria-label="Metadata"
    >
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Metadata
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          On-chain identity fields for this smart object
        </p>
      </div>
      <dl className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <div
            key={row.short}
            className="px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 min-h-0"
          >
            <dt className="shrink-0 flex items-center gap-1.5 w-[9.5rem] sm:w-40">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                {row.label}
              </span>
              <code className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {row.short}
              </code>
            </dt>
            <dd className="min-w-0 flex-1 flex items-center gap-0.5 text-xs text-gray-700 dark:text-gray-300">
              <span className="min-w-0 flex-1 truncate sm:whitespace-normal sm:break-all">
                {row.value}
              </span>
              {row.copy ? <Copy text={row.copy} /> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * Build chronological object revs: first → next → … → latest (capped).
 */
async function buildRevisionChain(
  computer: {
    first: (r: string) => Promise<string>
    next: (r: string) => Promise<string | undefined>
    latest: (r: string) => Promise<string>
  },
  rev: string,
): Promise<string[]> {
  const [firstRev, latestRev] = await Promise.all([computer.first(rev), computer.latest(rev)])
  const chain: string[] = [firstRev]
  let cursor = firstRev
  const seen = new Set<string>([firstRev])

  while (chain.length < MAX_TIMELINE_REVS) {
    if (cursor === latestRev) break
    const n = await computer.next(cursor)
    if (!n || seen.has(n)) break
    seen.add(n)
    chain.push(n)
    cursor = n
  }

  if (!seen.has(rev)) chain.push(rev)
  if (!seen.has(latestRev) && latestRev !== rev) chain.push(latestRev)

  return chain
}

type MyRouteParams = {
  rev?: string
}

function Component({ title }: { title?: string }) {
  const location = useLocation()
  const params = useParams<MyRouteParams>()
  const rev = params.rev || ''
  const computer = useContext(ComputerContext)
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [next, setNext] = useState<string | undefined>(undefined)
  const [prev, setPrev] = useState<string | undefined>(undefined)
  const [first, setFirst] = useState<string | undefined>(undefined)
  const [latest, setLatest] = useState<string | undefined>(undefined)
  const [timeline, setTimeline] = useState<string[]>([])
  const [ancestorTxIds, setAncestorTxIds] = useState<string[]>([])
  const [timelineLoading, setTimelineLoading] = useState(true)
  const [functionsExist, setFunctionsExist] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol']

  useEffect(() => {
    if (!rev) return
    let cancelled = false
    setSmartObject(null)
    setPrev(undefined)
    setNext(undefined)
    setFirst(undefined)
    setLatest(undefined)
    setTimeline([])
    setAncestorTxIds([])
    setTimelineLoading(true)
    setLoadError(null)

    const fetchCore = async () => {
      try {
        const o = await computer.sync(rev)
        if (cancelled) return
        setSmartObject(o)
        setLoadError(null)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Could not load this smart object revision'
        console.log('Error syncing to object:', message)
        setLoadError(message)
        setSmartObject(null)
      }

      try {
        const [p, n, f, l] = await Promise.all([
          computer.prev(rev),
          computer.next(rev),
          computer.first(rev).catch(() => rev),
          computer.latest(rev).catch(() => rev),
        ])
        if (cancelled) return
        setPrev(p)
        setNext(n)
        setFirst(f)
        setLatest(l)
      } catch (err) {
        console.warn('Error loading revision links', err)
      }
    }

    const fetchTimeline = async () => {
      try {
        const [chain, ancestors] = await Promise.all([
          buildRevisionChain(computer, rev),
          computer.getAncestors(rev).catch(() => [] as string[]),
        ])
        if (cancelled) return
        setTimeline(chain)
        setAncestorTxIds(Array.isArray(ancestors) ? ancestors : [])
      } catch (err) {
        if (!cancelled) {
          console.warn('Error building revision timeline', err)
          setTimeline([rev])
        }
      } finally {
        if (!cancelled) setTimelineLoading(false)
      }
    }

    fetchCore()
    fetchTimeline()

    return () => {
      cancelled = true
    }
  }, [computer, rev, location])

  useEffect(() => {
    if (!smartObject) {
      setFunctionsExist(false)
      return
    }
    setFunctionsExist(methodNamesFrom(smartObject).length > 0)
  }, [smartObject])

  const [txId, outNum] = rev.split(':')
  const loading = !smartObject && !loadError
  const decryptDenied = isDecryptionFailure(loadError)

  return (
    <div className="w-full space-y-5">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
            Smart object
          </p>
          <h1 className="mb-2 text-xl sm:text-2xl font-semibold dark:text-white">
            {title || 'Object'}
          </h1>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Revision
            </p>
            <div className="flex flex-wrap items-center gap-1 font-mono text-xs sm:text-sm break-all">
              <Link
                to={`/transactions/${txId}`}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {txId}
              </Link>
              <span className="text-gray-700 dark:text-gray-300">:{outNum}</span>
              <Copy text={`${txId}:${outNum}`} />
            </div>
            {smartObject?._satoshis != null ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  {smartObject._satoshis.toString()}
                </span>{' '}
                sats
                {Array.isArray(smartObject._owners) && smartObject._owners.length > 0 ? (
                  <>
                    {' · '}
                    <span className="font-mono text-xs">
                      {String(smartObject._owners[0]).slice(0, 12)}…
                    </span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        </header>

        {loadError && decryptDenied ? (
          <InlineAlert variant="info" title="You cannot decrypt this object">
            <p className="mb-2">
              Only wallets whose public key is listed in this object&apos;s _readers can read its
              state.
            </p>
            <p className="text-xs opacity-90">
              <Link
                to={`/transactions/${txId}`}
                className="font-medium underline underline-offset-2 hover:opacity-100"
              >
                View transaction
              </Link>
            </p>
          </InlineAlert>
        ) : null}

        {loadError && !decryptDenied ? (
          <InlineAlert
            variant="error"
            title="Could not load object"
            onDismiss={() => setLoadError(null)}
          >
            <p className="mb-2">{loadError}</p>
            <p className="text-xs opacity-90">
              This revision may not be a smart object, or the node failed to evaluate it.{' '}
              <Link
                to={`/transactions/${txId}`}
                className="font-medium underline underline-offset-2 hover:opacity-100"
              >
                View transaction
              </Link>
            </p>
          </InlineAlert>
        ) : null}

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-36 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        ) : null}

        {/* Order: State → Methods → Revision history → Metadata */}
        {smartObject ? (
          <>
            <section
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
              aria-label="State"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  State
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Public properties of this smart object at the current revision — the data stored on
                  chain after evaluation (not including system fields like _id or _owners).
                </p>
              </div>
              <SmartObjectValues smartObject={smartObject} />
            </section>

            <SmartObjectFunctions
              smartObject={smartObject}
              functionsExist={functionsExist}
              options={options}
              latestRev={latest}
            />
          </>
        ) : null}

        <RevisionHistory
          prev={prev}
          next={next}
          first={first}
          latest={latest}
          current={rev}
          chain={timeline}
          loading={timelineLoading}
          ancestorTxIds={ancestorTxIds}
        />

      {smartObject ? <MetaDataPanel smartObject={smartObject} /> : null}
    </div>
  )
}

export const SmartObject = {
  Component,
}
