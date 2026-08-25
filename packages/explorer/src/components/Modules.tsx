import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ModuleRecord } from '@bitcoin-computer/lib'
import { ComputerContext, InlineAlert } from '@bitcoin-computer/components'
import { formatTime, truncateRev } from '../utils/rpc'
import { PageHeader } from './ui/PageHeader'
import { DataTable, Pager, TableRow, TableSkeleton, tdClass } from './ui/Table'

type StorageFilter = '' | 'multisig' | 'taproot'
type ConfirmedFilter = '' | 'true' | 'false'
type OrderFilter = 'DESC' | 'ASC'

const MODULES_PER_PAGE = 20

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

  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(false)
  const [isPrevAvailable, setIsPrevAvailable] = useState(false)
  const [rows, setRows] = useState<ModuleRecord[]>([])
  const [showEmpty, setShowEmpty] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [order, setOrder] = useState<OrderFilter>('DESC')
  const [storageType, setStorageType] = useState<StorageFilter>('')
  const [isConfirmed, setIsConfirmed] = useState<ConfirmedFilter>('')

  useEffect(() => {
    let cancelled = false

    const fetchModules = async () => {
      try {
        setListLoading(true)
        setListError(null)
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
        if (cancelled) return
        setIsNextAvailable(result.length > MODULES_PER_PAGE)
        setIsPrevAvailable(pageNum > 0)
        setRows(result.slice(0, MODULES_PER_PAGE))
        if (pageNum === 0 && result.length === 0) setShowEmpty(true)
      } catch (error) {
        if (cancelled) return
        console.error('Error fetching modules', error)
        setListError(error instanceof Error ? error.message : 'Error fetching modules')
        setRows([])
        setIsNextAvailable(false)
        setShowEmpty(false)
      } finally {
        if (!cancelled) setListLoading(false)
      }
    }
    fetchModules()
    return () => {
      cancelled = true
    }
  }, [computer, pageNum, order, storageType, isConfirmed])

  const handleFilterChange = <T,>(setter: (v: T) => void, value: T) => {
    setPageNum(0)
    setter(value)
  }

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="Modules"
        subtitle="Deployed on-chain module sources"
        actions={
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
        }
      />

      {listLoading && rows.length === 0 ? <TableSkeleton /> : null}

      {listError && !listLoading ? (
        <InlineAlert variant="error">{listError}</InlineAlert>
      ) : null}

      {!listLoading && showEmpty ? (
        <div className="py-8 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            No modules indexed
          </h2>
        </div>
      ) : null}

      {!listLoading && !listError && !showEmpty && rows.length > 0 ? (
        <>
          <DataTable
            columns={[
              { key: 'mod', label: 'Module' },
              { key: 'storage', label: 'Storage' },
              { key: 'status', label: 'Status' },
              { key: 'indexed', label: 'Indexed' },
              { key: 'preview', label: 'Source preview' },
            ]}
          >
            {rows.map((row) => (
              <TableRow key={row.mod}>
                <th
                  scope="row"
                  className={`${tdClass} font-medium text-gray-900 whitespace-nowrap dark:text-white`}
                >
                  <Link
                    to={`/modules/${row.mod}`}
                    title={row.mod}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline font-mono text-xs"
                  >
                    {truncateRev(row.mod)}
                  </Link>
                </th>
                <td className={tdClass}>
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {row.storageType}
                  </span>
                </td>
                <td className={`${tdClass} text-xs`}>
                  <StatusCell row={row} />
                </td>
                <td className={`${tdClass} whitespace-nowrap text-xs`}>
                  {formatTime(row.timestamp)}
                </td>
                <td className={`${tdClass} max-w-xs`}>
                  <span
                    className="block truncate font-mono text-xs text-gray-600 dark:text-gray-300"
                    title={row.ept}
                  >
                    {row.ept.replace(/\s+/g, ' ').slice(0, 80)}
                    {row.ept.length > 80 ? '…' : ''}
                  </span>
                </td>
              </TableRow>
            ))}
          </DataTable>

          <Pager
            prevDisabled={!isPrevAvailable}
            nextDisabled={!isNextAvailable}
            onPrev={() => setPageNum((n) => Math.max(0, n - 1))}
            onNext={() => setPageNum((n) => n + 1)}
          />
        </>
      ) : null}
    </div>
  )
}
