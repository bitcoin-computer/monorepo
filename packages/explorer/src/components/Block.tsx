import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ComputerContext, UtilsContext } from '@bitcoin-computer/components'

function Block() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const computer = useContext(ComputerContext)
  const [block] = useState(params.block)
  const [blockData, setBlockData] = useState<{
    hash: string
    time: string
    size: string
    weight: string
    previousblockhash: string
    nextblockhash: string
    tx: { txid: string }[]
  } | null>(null)
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    const fetch = async () => {
      try {
        showLoader(true)
        const res = await computer.rpc('getblock', `${block} 2`)
        setBlockData(res.result)
        showLoader(false)
      } catch {
        showLoader(false)
        showSnackBar('Error getting block', false)
      }
    }
    fetch()
  }, [computer, block, location])

  const handleClick = async (txid: string) => {
    navigate(`/transactions/${txid}`)
  }

  return (
    <>
      {blockData && (
        <div className="w-full space-y-3">
          <header>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
              Block
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Detail</h1>
          </header>
          <dl className="text-gray-900 dark:text-gray-100 divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3">
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Hash</dt>
              <dd className="text-sm font-mono break-all">
                <Link
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  to={`/blocks/${blockData.hash}`}
                >
                  {blockData.hash}
                </Link>
              </dd>
            </div>
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Timestamp</dt>
              <dd className="text-sm font-medium">{blockData.time}</dd>
            </div>
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Size</dt>
              <dd className="text-sm font-medium tabular-nums">{blockData.size}</dd>
            </div>
            <div className="flex flex-col py-2.5">
              <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Weight</dt>
              <dd className="text-sm font-medium tabular-nums">{blockData.weight}</dd>
            </div>
          </dl>
          <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  disabled={!blockData.previousblockhash}
                  onClick={() => navigate(`/blocks/${blockData.previousblockhash}`)}
                  className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white disabled:bg-slate-100 border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5 inline"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>Prev Block</span>
                </button>
              </li>
              <li>
                <button
                  disabled={!blockData.nextblockhash}
                  onClick={() => navigate(`/blocks/${blockData.nextblockhash}`)}
                  className="block px-3 py-2 leading-tight text-gray-500 bg-white disabled:bg-slate-100 border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                >
                  <span>Next Block</span>
                  <svg
                    className="w-5 h-5 inline"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </li>
            </ul>
          </nav>

          <div className="relative overflow-x-auto sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody>
                {blockData?.tx?.map((txn: { txid: string }) => (
                  <tr
                    key={txn.txid}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      <button
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        onClick={() => handleClick(txn.txid)}
                      >
                        {txn.txid}
                      </button>
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!blockData && (
        <div className="flex items-center pt-4 pt-2 w-full">
          <h1 className="text-md">Not a valid block hash {block}</h1>
        </div>
      )}
    </>
  )
}

export default Block
