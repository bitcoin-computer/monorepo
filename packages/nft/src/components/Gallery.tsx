import { Computer } from '@bitcoin-computer/lib'
import { useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { initFlowbite } from 'flowbite'
import { ComputerContext } from '@bitcoin-computer/components'
import { NFT } from '@bitcoin-computer/TBC721'
import { NFTCard } from './Card'

// eslint-disable-next-line
export type Class = new (...args: any) => any

export type UserQuery<T extends Class> = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: 'ASC' | 'DESC'
  ids: string[]
  contract: {
    class: T
    args?: ConstructorParameters<T>
  }
}>

function HomePageCard({ content }: { content: string | (() => JSX.Element) }) {
  return (
    <div className="block w-80 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <pre className="font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs">
        {typeof content === 'function' ? content() : ''}
      </pre>
    </div>
  )
}

function ValueComponent({ rev, computer }: { rev: string; computer: Computer }) {
  const [nft, setNft] = useState<NFT>()
  const [errorMsg, setMsgError] = useState('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const synced: NFT = (await computer.sync(rev)) as NFT
        setNft(synced)
      } catch (err) {
        if (err instanceof Error) setMsgError(`Error: ${err.message}`)
      }
      setLoading(false)
    }
    fetch()
  }, [computer, rev])

  if (loading) {
    return <SkeletonCard />
  }

  if (errorMsg) {
    return <HomePageCard content={errorMsg} />
  }

  return <NFTCard nft={nft} userPublicKey={computer.getPublicKey()} />
}

function FromRevs({ revs, computer }: { revs: string[]; computer: Computer }) {
  const cols: string[][] = [[], [], [], []]

  revs.forEach((rev, index) => {
    const colNumber = index % 4
    cols[colNumber].push(rev)
  })
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="grid gap-4">
          {cols[0].map((rev) => (
            <div key={rev}>
              <Link
                to={`/objects/${rev}`}
                className="block font-medium text-blue-600 dark:text-blue-500"
              >
                <ValueComponent rev={rev} computer={computer} />
              </Link>
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {cols[1].map((rev) => (
            <div key={rev}>
              <Link
                to={`/objects/${rev}`}
                className="block font-medium text-blue-600 dark:text-blue-500"
              >
                <ValueComponent rev={rev} computer={computer} />
              </Link>
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {cols[2].map((rev) => (
            <div key={rev}>
              <Link
                to={`/objects/${rev}`}
                className="block font-medium text-blue-600 dark:text-blue-500 w-full"
              >
                <ValueComponent rev={rev} computer={computer} />
              </Link>
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {cols[3].map((rev) => (
            <div key={rev}>
              <Link
                to={`/objects/${rev}`}
                className="block font-medium text-blue-600 dark:text-blue-500 w-full"
              >
                <ValueComponent rev={rev} computer={computer} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function Pagination({
  isPrevAvailable,
  handlePrev,
  isNextAvailable,
  handleNext,
}: {
  isPrevAvailable: boolean
  handlePrev: () => Promise<void>
  isNextAvailable: boolean
  handleNext: () => Promise<void>
  revs: string[]
}) {
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
  )
}

const SkeletonCard = () => (
  <div
    role="status"
    className="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4 relative overflow-hidden group animate-pulse"
  >
    <div className="flex items-center justify-center h-48 bg-gray-300 rounded-t-lg dark:bg-gray-700">
      <svg
        className="w-10 h-10 text-gray-200 dark:text-gray-600"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 20"
      >
        <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
      </svg>
    </div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-1/2 mb-1"></div>
    </div>
    <span className="sr-only">Loading...</span>
  </div>
)

export default function WithPagination<T extends Class>(q: UserQuery<T>) {
  const contractsPerPage = 12
  const computer = useContext(ComputerContext)
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0)
  const [showNoAsset, setShowNoAsset] = useState(false)
  const [revs, setRevs] = useState<string[]>([])
  const [listLoading, setListLoading] = useState(true)
  const location = useLocation()
  const params = Object.fromEntries(new URLSearchParams(location.search))

  useEffect(() => {
    initFlowbite()
  }, [])

  useEffect(() => {
    const fetch = async () => {
      setListLoading(true)
      const query = { ...q, ...params }
      query.offset = contractsPerPage * pageNum
      query.limit = contractsPerPage + 1
      query.order = 'DESC'
      const result = await computer.query(query)
      setIsNextAvailable(result.length > contractsPerPage)
      setRevs(result.slice(0, contractsPerPage))
      if (pageNum === 0 && result?.length === 0) {
        setShowNoAsset(true)
      }
      setListLoading(false)
    }
    fetch()
  }, [computer, pageNum])

  const handleNext = async () => {
    setIsPrevAvailable(true)
    setPageNum(pageNum + 1)
  }

  const handlePrev = async () => {
    setIsNextAvailable(true)
    if (pageNum - 1 === 0) setIsPrevAvailable(false)
    setPageNum(pageNum - 1)
  }

  const loadingContent = () => (
    <>
      <svg
        aria-hidden="true"
        role="status"
        className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="#1C64F2"
        />
      </svg>
      &nbsp;Loading...
    </>
  )

  return (
    <div className="relative sm:rounded-lg w-full">
      {listLoading ? (
        <div className="flex justify-center items-center h-32">{loadingContent()}</div>
      ) : (
        <>
          <FromRevs revs={revs} computer={computer} />
          {!(pageNum === 0 && revs && revs.length === 0) && (
            <Pagination
              revs={revs}
              isPrevAvailable={isPrevAvailable}
              handlePrev={handlePrev}
              isNextAvailable={isNextAvailable}
              handleNext={handleNext}
            />
          )}
          {pageNum === 0 && revs && revs.length === 0 && showNoAsset && (
            <h1 className="w-full mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white text-center mx-auto">
              No Assets
            </h1>
          )}
        </>
      )}
    </div>
  )
}

export const Gallery = {
  FromRevs,
  WithPagination,
}
