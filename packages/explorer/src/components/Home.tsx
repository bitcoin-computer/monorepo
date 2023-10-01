import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Loader from "./Loader"

export default function Home(props: { computer: Computer }) {
  const { computer } = props
  const contractsPerPage = 7

  const [isLoading, setIsLoading] = useState(false)
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0)
  const [revs, setRevs] = useState<string[]>([])
  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        const queryRevs = await computer.query({
          offset: contractsPerPage * pageNum,
          limit: contractsPerPage + 1,
        })

        if (queryRevs.length <= contractsPerPage) {
          setIsNextAvailable(false)
        } else {
          queryRevs.splice(-1)
          setIsNextAvailable(true)
        }
        setRevs(queryRevs)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log('Error loading revisions', error)
      }
    }
    fetch()
  }, [computer, revs.length, pageNum])

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
      <h1 className="mb-4 text-5xl font-extrabold dark:text-white">Bitcoin Computer Explorer</h1>

      <h2 className="mb-2 text-4xl font-bold dark:text-white">Smart Contracts</h2>

      <table className="w-full mt-4 mb-4 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Output Identifier
            </th>
          </tr>
        </thead>
        <tbody>
          {revs.map((rev) => (
            <tr key={rev} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4">
                <Link to={`/outputs/${rev}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                  {rev}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {revs.length > 0 && (
        <nav className="flex items-center justify-between" aria-label="Table navigation">
          <ul className="inline-flex items-center -space-x-px">
            <li>
              <button
                disabled={!isPrevAvailable}
                onClick={handlePrev}
                className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span className="sr-only">Previous</span>
                <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
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
                <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
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