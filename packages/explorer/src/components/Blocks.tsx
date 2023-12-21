import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Loader from "./Loader"
import { getComputer } from "@bitcoin-computer/components"

export default function Blocks() {
  const navigate = useNavigate()
  const [computer] = useState(getComputer())
  const blocksPerPage = 100

  const [isLoading, setIsLoading] = useState(false)
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0)
  const [totalBlocks, setTotalBlocks] = useState(0)
  const [blocks, setBlocks] = useState<number[]>([])
  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        // @ts-ignore
        const res = await computer.rpcCall("getblockchaininfo", "")
        setTotalBlocks(res.result.blocks)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log("Error getting blocks", error)
      }
    }
    fetch()
  }, [computer])

  useEffect(() => {
    try {
      let length = blocksPerPage
      if (totalBlocks - (pageNum * blocksPerPage + blocksPerPage - 1) <= 0) {
        setIsNextAvailable(false)
        length = totalBlocks - (pageNum * blocksPerPage + blocksPerPage - 1) + blocksPerPage - 1
      }
      setBlocks(
        Array.from({ length: length }, (_, i) => totalBlocks - (pageNum * blocksPerPage + i))
      )
    } catch (error) {
      console.log("Error setting blocks", error)
    }
  }, [totalBlocks, pageNum])

  const handleClick = async (block: number) => {
    // @ts-ignore
    const res = await computer.wallet.restClient.rpc("getblockhash", `${block}`)
    const blockHash = res.result.result
    navigate(`/blocks/${blockHash}`)
  }

  const handleNext = async () => {
    setIsPrevAvailable(true)
    setPageNum(pageNum + 1)
  }

  const handlePrev = async () => {
    setIsNextAvailable(true)
    if (pageNum - 1 === 0) {
      setIsPrevAvailable(false)
    }
    setPageNum(pageNum - 1)
  }
  return (
    <div className="relative overflow-x-auto sm:rounded-lg pt-4">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Block Number
            </th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => {
            return (
              <tr key={block} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  <button
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    onClick={() => handleClick(block)}
                  >
                    Block #{block}
                  </button>
                </th>
              </tr>
            )
          })}
        </tbody>
      </table>
      {blocks.length > 0 && (
        <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
          <ul className="inline-flex items-center -space-x-px">
            <li>
              <button
                disabled={!isPrevAvailable}
                onClick={handlePrev}
                className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
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
                disabled={!isNextAvailable}
                onClick={handleNext}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
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
      {isLoading && <Loader />}
    </div>
  )
}
