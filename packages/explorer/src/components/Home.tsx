import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Loader from "./Loader"
import Well from "./Well"
import { jsonMap, strip } from "../utils"

function Card({ content }: { content: string }) {
  return (<a href="#" className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
    <pre className="font-normal text-gray-700 dark:text-gray-400 text-xs">
      {content}
    </pre>
  </a>)
}

function ValueComponent({ rev, computer }: {rev: string, computer: Computer}) {
  const [value, setValue] = useState('loading...')
  const [errorMsg, setMsgError] = useState('')
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const synced = await computer.sync(rev)
        setValue(synced)
      } catch(err) {
        if (err instanceof Error)
          setMsgError(`Error: ${err.message}`)
      }
    }
    fetch()
  }, [computer, rev])

  if(errorMsg) (<Card content={errorMsg} />)

  return (<Card content={JSON.stringify(jsonMap(strip as any)(value as any), null, 2)} />)
}

function chunk(arr: string[]) {
  const chunkSize = 4;
  const chunks = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  return chunks
}

function Gallery({ revs, computer }: { revs: string[], computer: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 mt-4">
      {chunk(revs).map(
        (chunk) => (
          <div className="grid gap-4">
            {chunk.map((rev: string) => (
              <div>
                <Link to={`/outputs/${rev}`} className="font-medium text-blue-600 dark:text-blue-500">
                  <ValueComponent rev={rev} computer={computer} />
                </Link>
              </div>))
            }
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
            disabled={!isPrevAvailable}
            onClick={handlePrev}
            className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Previous</span>
            <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
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
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default function Home(props: { computer: Computer }) {
  const { computer } = props
  const contractsPerPage = 12

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
    <div className="relative sm:rounded-lg pt-4">
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Smart Objects</h2>
      <Gallery 
        revs={revs}
        computer={computer}
      />
      <Pagination
        revs={revs}
        isPrevAvailable={isPrevAvailable}
        handlePrev={handlePrev}
        isNextAvailable={isNextAvailable}
        handleNext={handleNext}
      />
      {isLoading && <Loader />}
    </div>
  )
}
