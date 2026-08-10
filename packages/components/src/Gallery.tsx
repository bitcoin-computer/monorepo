import { Computer, TXORecord } from '@bitcoin-computer/lib'
import { useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

/** Normalize URL search params into a getOUTXOs-compatible query. */
export function queryFromSearchParams(search: string): Record<string, string | boolean> {
  const raw = Object.fromEntries(new URLSearchParams(search))
  const out: Record<string, string | boolean> = {}

  // public-key was used historically; API expects publicKey
  const publicKey = raw.publicKey || raw['public-key']
  if (publicKey) out.publicKey = publicKey.trim()

  if (raw.mod) out.mod = raw.mod.trim()
  if (raw.address) out.address = raw.address.trim()
  if (raw.order === 'ASC' || raw.order === 'DESC') out.order = raw.order

  if (raw.isObject === 'true' || raw.isObject === '1') out.isObject = true
  if (raw.isObject === 'false' || raw.isObject === '0') out.isObject = false

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mt-4 w-full">
      {records.map((record) => (
        <div key={record.rev}>
          <Link
            to={`/objects/${record.rev}`}
            className="block font-medium text-blue-600 dark:text-blue-500 h-full"
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
    <nav className="flex items-center justify-between" aria-label="Table navigation">
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <button
            type="button"
            disabled={!isPrevAvailable}
            onClick={handlePrev}
            className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
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
            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
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

function EmptyObjectsState() {
  return (
    <div className="w-full py-12 px-4 text-center">
      <h1 className="mb-3 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white">
        No smart objects yet
      </h1>
      <p className="mb-6 max-w-xl mx-auto text-base text-gray-600 dark:text-gray-400">
        On Bitcoin Computer, a <strong className="font-semibold text-gray-800 dark:text-gray-200">smart object</strong>{' '}
        is on-chain application state you can own, update, and call methods on — not just a bare
        UTXO. Create one in the Playground, or learn how objects work in the docs.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/playground"
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Open Playground
        </Link>
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        >
          Read the docs
        </a>
      </div>
    </div>
  )
}

function GallerySkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mt-4 w-full">
      {Array.from({ length: count }, (_, i) => (
        <ObjectCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function GalleryWithPagination<T extends Class>(q: UserQuery<T> = {}) {
  const contractsPerPage = 12
  const computer = useContext(ComputerContext)
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(false)
  const [showNoAsset, setShowNoAsset] = useState(false)
  const [records, setRecords] = useState<TXORecord[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    initFlowbite()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setPageNum(0)
    setIsPrevAvailable(false)
  }, [location.search])

  useEffect(() => {
    let cancelled = false

    const fetchPage = async () => {
      setListLoading(true)
      setListError(null)
      setShowNoAsset(false)
      try {
        const fromUrl = queryFromSearchParams(location.search)
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
    // q identity is not stable across parent re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer, pageNum, location.search, q.mod, q.publicKey, q.address, q.order, q.isObject])

  const handleNext = () => {
    setPageNum((n) => n + 1)
  }

  const handlePrev = () => {
    setPageNum((n) => Math.max(0, n - 1))
  }

  return (
    <div className="relative sm:rounded-lg pt-4 w-full">
      {listLoading && records.length === 0 ? <GallerySkeletons /> : null}

      {listError && !listLoading ? (
        <div className="py-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">{listError}</p>
        </div>
      ) : null}

      {!listLoading && showNoAsset ? <EmptyObjectsState /> : null}

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
        // Fetch metadata for known revs when possible
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
