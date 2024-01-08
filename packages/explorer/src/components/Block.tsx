import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { Auth, UtilsContext } from "@bitcoin-computer/components"

function Block() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [computer] = useState(Auth.getComputer())
  const [block] = useState(params.block)
  const [isLoading, setIsLoading] = useState(false)
  const [blockData, setBlockData] = useState<any | null>(null)
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    const fetch = async () => {
      try {
        // setIsLoading(true)
        showLoader(true)
        // @ts-ignore
        const res = await computer.rpcCall("getblock", `${block} 2`)
        setBlockData(res.result)
        // setIsLoading(false)
        showLoader(false)
      } catch (error) {
        // setIsLoading(false)
        showLoader(false)
        showSnackBar("Error getting block", false)
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
        <div className="pt-4">
          <dl className="text-gray-900 divide-y divide-gray-200">
            <div className="flex flex-col pb-3">
              <dt className="mb-1 text-gray-500 md:text-md ">Hash</dt>
              <dd className="text-md font-semibold">
                <Link
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  to={`/blocks/${blockData.hash}`}
                >
                  {blockData.hash}
                </Link>
              </dd>
            </div>
            <div className="flex flex-col py-3">
              <dt className="mb-1 text-gray-500 md:text-md">Timestamp</dt>
              <dd className="text-md font-semibold">{blockData.time}</dd>
            </div>
            <div className="flex flex-col pt-3">
              <dt className="mb-1 text-gray-500 md:text-md">Size</dt>
              <dd className="text-md font-semibold">{blockData.size}</dd>
            </div>
            <div className="flex flex-col pt-3">
              <dt className="mb-1 text-gray-500 md:text-md">Weight</dt>
              <dd className="text-md font-semibold">{blockData.weight}</dd>
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
                {blockData?.tx?.map((txn: any) => {
                  return (
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!blockData && !isLoading && (
        <div className="flex items-center pt-4 pt-2 w-full">
          <h1 className="text-md">Not a valid block hash {block}</h1>
        </div>
      )}
    </>
  )
}

export default Block
