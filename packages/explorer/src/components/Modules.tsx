import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ModuleRecord } from '@bitcoin-computer/lib'
import { ComputerContext, UtilsContext } from '@bitcoin-computer/components'

type StorageFilter = '' | 'multisig' | 'taproot'
type ConfirmedFilter = '' | 'true' | 'false'
type OrderFilter = 'DESC' | 'ASC'

const MODULES_PER_PAGE = 20

function truncateMod(mod: string, head = 8, tail = 8): string {
  const [txId, vout] = mod.split(':')
  if (!txId || txId.length <= head + tail) return mod
  return `${txId.slice(0, head)}…${txId.slice(-tail)}:${vout ?? '0'}`
}

function formatTimestamp(timestamp?: string | number): string {
  if (timestamp === undefined || timestamp === null || timestamp === '') return '—'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return String(timestamp)
  return date.toLocaleString()
}

function StatusCell({ row }: { row: ModuleRecord }) {
  if (row.blockHash) {
    return (
      <span className="text-green-700 dark:text-green-400">
        Confirmed
        {row.blockHeight != null ? (
          <span className="text-gray-500 dark:text-gray-400"> #{row.blockHeight}</span>
        ) : null}
      </span>
    )
  }
  return <span className="text-amber-700 dark:text-amber-400">Mempool</span>
}

function selectClassName() {
  return 'bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block py-1.5 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
}

export default function Modules() {
  const computer = useContext(ComputerContext)
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(false)
  const [isPrevAvailable, setIsPrevAvailable] = useState(false)
  const [rows, setRows] = useState<ModuleRecord[]>([])
  const [showEmpty, setShowEmpty] = useState(false)

  const [order, setOrder] = useState<OrderFilter>('DESC')
  const [storageType, setStorageType] = useState<StorageFilter>('')
  const [isConfirmed, setIsConfirmed] = useState<ConfirmedFilter>('')

  useEffect(() => {
    const fetchModules = async () => {
      try {
        showLoader(true)
        setShowEmpty(false)
        const query: {
          verbosity: 1
          limit: number
          offset: number
          order: OrderFilter
          storageType?: 'multisig' | 'taproot'
          isConfirmed?: boolean
        } = {
          verbosity: 1,
          limit: MODULES_PER_PAGE + 1,
          offset: pageNum * MODULES_PER_PAGE,
          order,
        }
        if (storageType) query.storageType = storageType
        if (isConfirmed === 'true') query.isConfirmed = true
        if (isConfirmed === 'false') query.isConfirmed = false

        const result = await computer.getModules(query)
        setIsNextAvailable(result.length > MODULES_PER_PAGE)
        setIsPrevAvailable(pageNum > 0)
        setRows(result.slice(0, MODULES_PER_PAGE))
        if (pageNum === 0 && result.length === 0) setShowEmpty(true)
      } catch (error) {
        console.error('Error fetching modules', error)
        showSnackBar('Error fetching modules', false)
        setRows([])
        setIsNextAvailable(false)
        if (pageNum === 0) setShowEmpty(true)
      } finally {
        showLoader(false)
      }
    }
    fetchModules()
    // showLoader / showSnackBar are not stable (recreated each UtilsProvider render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer, pageNum, order, storageType, isConfirmed])

  const handleFilterChange = <T,>(setter: (v: T) => void, value: T) => {
    setPageNum(0)
    setter(value)
  }

  const handleNext = () => {
    setPageNum((n) => n + 1)
  }

  const handlePrev = () => {
    setPageNum((n) => Math.max(0, n - 1))
  }

  return (
    <div className="relative overflow-x-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Modules</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Deployed on-chain module sources
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
            Storage
            <select
              className={selectClassName()}
              value={storageType}
              onChange={(e) => handleFilterChange(setStorageType, e.target.value as StorageFilter)}
            >
              <option value="">All</option>
              <option value="multisig">multisig</option>
              <option value="taproot">taproot</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
            Status
            <select
              className={selectClassName()}
              value={isConfirmed}
              onChange={(e) =>
                handleFilterChange(setIsConfirmed, e.target.value as ConfirmedFilter)
              }
            >
              <option value="">All</option>
              <option value="true">Confirmed</option>
              <option value="false">Unconfirmed</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
            Order
            <select
              className={selectClassName()}
              value={order}
              onChange={(e) => handleFilterChange(setOrder, e.target.value as OrderFilter)}
            >
              <option value="DESC">Newest first</option>
              <option value="ASC">Oldest first</option>
            </select>
          </label>
        </div>
      </div>

      {showEmpty ? (
        <div className="py-8 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            No modules indexed
          </h2>
        </div>
      ) : (
        <>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Module
                </th>
                <th scope="col" className="px-3 py-2">
                  Storage
                </th>
                <th scope="col" className="px-3 py-2">
                  Status
                </th>
                <th scope="col" className="px-3 py-2">
                  Indexed
                </th>
                <th scope="col" className="px-3 py-2">
                  Source preview
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.mod}
                  className="bg-white border-b last:border-0 dark:bg-gray-900 dark:border-gray-800"
                >
                  <th
                    scope="row"
                    className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <Link
                      to={`/modules/${row.mod}`}
                      title={row.mod}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline font-mono text-xs"
                    >
                      {truncateMod(row.mod)}
                    </Link>
                  </th>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {row.storageType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <StatusCell row={row} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{formatTimestamp(row.timestamp)}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <span
                      className="block truncate font-mono text-xs text-gray-600 dark:text-gray-300"
                      title={row.ept}
                    >
                      {row.ept.replace(/\s+/g, ' ').slice(0, 80)}
                      {row.ept.length > 80 ? '…' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length > 0 && (
            <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
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
          )}
        </>
      )}
    </div>
  )
}
