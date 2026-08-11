import { Computer, TXORecord } from '@bitcoin-computer/lib'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { initFlowbite } from 'flowbite'
import { ComputerContext } from './ComputerContext'
import { ObjectCard, ObjectCardSkeleton } from './ObjectCard'

export type Class = new (...args: any) => any

export type UserQuery<T extends Class> = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: 'ASC' | 'DESC'
  ids: string[]
  address: string
  isObject: boolean
  contract: {
    class: T
    args?: ConstructorParameters<T>
  }
}>

const DOCS_URL = 'https://docs.bitcoincomputer.io/'

function truncateMiddle(value: string, head = 8, tail = 6): string {
  if (!value || value.length <= head + tail + 1) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

/** Normalize URL search params into a getOUTXOs-compatible query. */
export function queryFromSearchParams(search: string): Record<string, string | boolean> {
  const raw = Object.fromEntries(new URLSearchParams(search))
  const out: Record<string, string | boolean> = {}

  // public-key was used historically; API expects publicKey
  const publicKey = raw.publicKey || raw['public-key']
  if (publicKey) out.publicKey = String(publicKey).trim()

  if (raw.mod) out.mod = String(raw.mod).trim()
  if (raw.address) out.address = String(raw.address).trim()
  if (raw.order === 'ASC' || raw.order === 'DESC') out.order = raw.order

  if (raw.isObject === 'true' || raw.isObject === '1') out.isObject = true
  if (raw.isObject === 'false' || raw.isObject === '0') out.isObject = false

  // txId is not a getOUTXOs field — handled by redirect in GalleryWithPagination
  if (raw.txId || raw.txid) out.txId = String(raw.txId || raw.txid).trim()

  return out
}

function FromRecords({
  records,
  computer,
}: {
  records: TXORecord[]
  computer: Computer
}) {
  const chain = computer.getChain()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 w-full">
      {records.map((record) => (
        <div key={record.rev} className="min-w-0">
          <Link
            to={`/objects/${record.rev}`}
            className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          >
            <ObjectCard record={record} computer={computer} chain={chain} />
          </Link>
        </div>
      ))}
    </div>
  )
}

function Pagination({ isPrevAvailable, handlePrev, isNextAvailable, handleNext }: any) {
  return (
    <nav className="flex items-center justify-between pt-2" aria-label="Objects pagination">
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <button
            type="button"
            disabled={!isPrevAvailable}
            onClick={handlePrev}
            className="flex items-center justify-center px-3 h-9 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled={!isNextAvailable}
            onClick={handleNext}
            className="flex items-center justify-center px-3 h-9 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  )
}

function EmptyObjectsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="w-full py-8 px-4 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
      <h2 className="mb-1.5 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
        {hasFilters ? 'No objects match this filter' : 'No smart objects yet'}
      </h2>
      <p className="mb-4 max-w-md mx-auto text-sm text-gray-600 dark:text-gray-400">
        {hasFilters ? (
          <>Try clearing filters or search for a different owner or module.</>
        ) : (
          <>
            A smart object is on-chain application state you can own and update. Create one in the
            Playground.
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {hasFilters ? (
          <Link
            to="/"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Clear filters
          </Link>
        ) : (
          <Link
            to="/playground"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Open Playground
          </Link>
        )}
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        >
          Docs
        </a>
      </div>
    </div>
  )
}

function GallerySkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 w-full">
      {Array.from({ length: count }, (_, i) => (
        <ObjectCardSkeleton key={i} />
      ))}
    </div>
  )
}

function ActiveFilters({
  publicKey,
  mod,
  address,
  order,
}: {
  publicKey?: string
  mod?: string
  address?: string
  order?: string
}) {
  const navigate = useNavigate()
  const chips: { key: string; label: string; clear: () => void }[] = []

  if (publicKey) {
    chips.push({
      key: 'publicKey',
      label: `Owner ${truncateMiddle(publicKey, 10, 8)}`,
      clear: () => {
        const p = new URLSearchParams(window.location.search)
        p.delete('publicKey')
        p.delete('public-key')
        navigate({ search: p.toString() ? `?${p}` : '' })
      },
    })
  }
  if (mod) {
    chips.push({
      key: 'mod',
      label: `Module ${truncateMiddle(mod, 8, 6)}`,
      clear: () => {
        const p = new URLSearchParams(window.location.search)
        p.delete('mod')
        navigate({ search: p.toString() ? `?${p}` : '' })
      },
    })
  }
  if (address) {
    chips.push({
      key: 'address',
      label: `Address ${truncateMiddle(address, 8, 6)}`,
      clear: () => {
        const p = new URLSearchParams(window.location.search)
        p.delete('address')
        navigate({ search: p.toString() ? `?${p}` : '' })
      },
    })
  }
  if (order && order !== 'DESC') {
    chips.push({
      key: 'order',
      label: `Order ${order}`,
      clear: () => {
        const p = new URLSearchParams(window.location.search)
        p.delete('order')
        navigate({ search: p.toString() ? `?${p}` : '' })
      },
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Filters
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-3 py-1 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60"
          title="Remove filter"
        >
          {chip.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
      <Link
        to="/"
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
      >
        Clear all
      </Link>
    </div>
  )
}

export function GalleryWithPagination<T extends Class>(q: UserQuery<T> = {}) {
  const contractsPerPage = 12
  const computer = useContext(ComputerContext)
  const navigate = useNavigate()
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(false)
  const [showNoAsset, setShowNoAsset] = useState(false)
  const [records, setRecords] = useState<TXORecord[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const location = useLocation()

  const fromUrl = useMemo(() => queryFromSearchParams(location.search), [location.search])
  const hasFilters = Boolean(fromUrl.publicKey || fromUrl.mod || fromUrl.address || q.publicKey || q.mod || q.address)

  useEffect(() => {
    initFlowbite()
  }, [])

  // Bare txId query is not supported by getOUTXOs — send users to the transaction page
  useEffect(() => {
    const txId = fromUrl.txId
    if (typeof txId === 'string' && /^[0-9a-fA-F]{64}$/.test(txId)) {
      navigate(`/transactions/${txId.toLowerCase()}`, { replace: true })
    }
  }, [fromUrl.txId, navigate])

  // Reset to first page when filters change
  useEffect(() => {
    setPageNum(0)
    setIsPrevAvailable(false)
  }, [location.search])

  useEffect(() => {
    let cancelled = false

    // Skip list fetch while redirecting a txId filter
    if (typeof fromUrl.txId === 'string' && /^[0-9a-fA-F]{64}$/.test(String(fromUrl.txId))) {
      return undefined
    }

    const fetchPage = async () => {
      setListLoading(true)
      setListError(null)
      setShowNoAsset(false)
      try {
        const isObject =
          fromUrl.isObject !== undefined ? Boolean(fromUrl.isObject) : (q.isObject ?? true)
        const order = (fromUrl.order as 'ASC' | 'DESC' | undefined) || q.order || 'DESC'
        const publicKey = (fromUrl.publicKey as string | undefined) || q.publicKey
        const mod = (fromUrl.mod as string | undefined) || q.mod
        const address = (fromUrl.address as string | undefined) || q.address

        const result = await computer.getOUTXOs({
          verbosity: 1,
          isObject,
          offset: contractsPerPage * pageNum,
          limit: contractsPerPage + 1,
          order,
          ...(publicKey ? { publicKey } : {}),
          ...(mod ? { mod } : {}),
          ...(address ? { address } : {}),
        })
        if (cancelled) return

        setIsNextAvailable(result.length > contractsPerPage)
        setIsPrevAvailable(pageNum > 0)
        setRecords(result.slice(0, contractsPerPage))
        if (pageNum === 0 && result.length === 0) setShowNoAsset(true)
      } catch (err) {
        if (cancelled) return
        console.error('Error fetching objects', err)
        setListError(err instanceof Error ? err.message : 'Error fetching objects')
        setRecords([])
        setIsNextAvailable(false)
        if (pageNum === 0) setShowNoAsset(true)
      } finally {
        if (!cancelled) setListLoading(false)
      }
    }

    fetchPage()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer, pageNum, location.search, q.mod, q.publicKey, q.address, q.order, q.isObject])

  const handleNext = () => {
    setPageNum((n) => n + 1)
  }

  const handlePrev = () => {
    setPageNum((n) => Math.max(0, n - 1))
  }

  return (
    <div className="relative w-full">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Smart objects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unspent on-chain application state
            {records.length > 0
              ? ` · ${records.length}${isNextAvailable ? '+' : ''} on this page`
              : ''}
          </p>
        </div>
        <Link
          to="/playground"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Create
        </Link>
      </header>

      <ActiveFilters
        publicKey={(fromUrl.publicKey as string) || q.publicKey}
        mod={(fromUrl.mod as string) || q.mod}
        address={(fromUrl.address as string) || q.address}
        order={(fromUrl.order as string) || q.order}
      />

      {listLoading && records.length === 0 ? <GallerySkeletons /> : null}

      {listError && !listLoading ? (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-center mb-3">
          <p className="text-red-700 dark:text-red-300 text-sm">{listError}</p>
        </div>
      ) : null}

      {!listLoading && showNoAsset ? <EmptyObjectsState hasFilters={hasFilters} /> : null}

      {records.length > 0 ? <FromRecords records={records} computer={computer} /> : null}

      {!(pageNum === 0 && records.length === 0) && !listLoading ? (
        <Pagination
          isPrevAvailable={isPrevAvailable}
          handlePrev={handlePrev}
          isNextAvailable={isNextAvailable}
          handleNext={handleNext}
        />
      ) : null}
    </div>
  )
}

/** @deprecated Prefer metadata-first Gallery.WithPagination; kept for apps that pass raw revs. */
function FromRevs({ revs, computer }: { revs: string[]; computer: Computer }) {
  const [records, setRecords] = useState<TXORecord[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        if (revs.length === 0) {
          setRecords([])
          return
        }
        const results = await Promise.all(
          revs.map(async (rev) => {
            try {
              const rows = await computer.getOUTXOs({
                rev,
                verbosity: 1,
              })
              if (rows[0]) return rows[0]
            } catch {
              // fall through
            }
            return {
              rev,
              address: '',
              satoshis: 0n,
              asm: '',
            } as TXORecord
          }),
        )
        if (!cancelled) setRecords(results)
      } catch {
        if (!cancelled) {
          setRecords(
            revs.map(
              (rev) =>
                ({
                  rev,
                  address: '',
                  satoshis: 0n,
                  asm: '',
                }) as TXORecord,
            ),
          )
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [revs, computer])

  if (!records) {
    return <GallerySkeletons count={Math.min(revs.length || 3, 6)} />
  }

  return <FromRecords records={records} computer={computer} />
}

export const Gallery = {
  FromRevs,
  WithPagination: GalleryWithPagination,
}
