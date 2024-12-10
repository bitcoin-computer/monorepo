import { Computer } from "@bitcoin-computer/lib"
import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { initFlowbite } from "flowbite"
import { Auth, ComputerContext, UtilsContext } from "@bitcoin-computer/components"
import { BiGitCompare } from "react-icons/bi"
import { ChessGame } from "../contracts/chess-game"
import { Chess } from "../contracts/chess-module"
import { getGameState, truncateName } from "./utils"

export type Class = new (...args: any) => any

export type UserQuery<T extends Class> = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: "ASC" | "DESC"
  ids: string[]
  contract: {
    class: T
    args?: ConstructorParameters<T>
  }
}>

function GameCard({ chessGame }: { chessGame: ChessGame }) {
  const c = new Chess(chessGame.fen)
  const publicKey = Auth.getComputer().getPublicKey()
  return (
    <>
      <div
        className={`bg-white border rounded-lg shadow mb-4 ${
          chessGame.firstUserPubKey === publicKey || chessGame.secondUserPubKey === publicKey
            ? "border-blue-600 dark:border-blue-500"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="p-4">
          <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
            {getGameState(c)}
          </p>
          <p
            className={`mb-1 font-normal break-words ${
              chessGame.firstUserPubKey === publicKey
                ? "text-blue-600 dark:text-blue-500"
                : "text-gray-700 dark:text-gray-400"
            }`}
            title={chessGame.firstPlayerName}
          >
            {truncateName(chessGame.firstPlayerName)}
          </p>
          <div className="flex justify-center items-center my-1 text-gray-500 dark:text-gray-400">
            <BiGitCompare size={20} />
          </div>
          <p
            className={`mb-1 font-normal break-words ${
              chessGame.secondUserPubKey === publicKey
                ? "text-blue-600 dark:text-blue-500"
                : "text-gray-700 dark:text-gray-400"
            }`}
            title={chessGame.secondPlayerName}
          >
            {truncateName(chessGame.secondPlayerName)}
          </p>
        </div>
      </div>
    </>
  )
}

function HomePageCard({ content }: any) {
  return (
    <div className="block w-80 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <pre className="font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs">
        {typeof content === "function" ? content() : ""}
      </pre>
    </div>
  )
}

function ValueComponent({ rev, computer }: { rev: string; computer: Computer }) {
  const [value, setValue] = useState<ChessGame | null>(null)
  const [errorMsg, setMsgError] = useState("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const synced: ChessGame = (await computer.sync(rev)) as ChessGame
        setValue(synced)
      } catch (err) {
        if (err instanceof Error) setMsgError(`Error: ${err.message}`)
      }
      setLoading(false)
    }
    fetch()
  }, [computer, rev])

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

  if (loading) {
    return <HomePageCard content={loadingContent} />
  }

  if (errorMsg) {
    return <HomePageCard content={errorMsg} />
  }

  return (
    <Link to={`/game/${value?._id}`} className="block font-medium text-blue-600 dark:text-blue-500">
      {value ? <GameCard chessGame={value} /> : <></>}
    </Link>
  )
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
              <ValueComponent rev={rev} computer={computer} />
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {cols[1].map((rev) => (
            <div key={rev}>
              <ValueComponent rev={rev} computer={computer} />
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {cols[2].map((rev) => (
            <div key={rev}>
              <ValueComponent rev={rev} computer={computer} />
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {cols[3].map((rev) => (
            <div key={rev}>
              <ValueComponent rev={rev} computer={computer} />
            </div>
          ))}
        </div>
      </div>
    </>
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

export default function WithPagination<T extends Class>(q: UserQuery<T>) {
  const navigate = useNavigate()
  const { showLoader } = UtilsContext.useUtilsComponents()
  const contractsPerPage = 12
  const computer = useContext(ComputerContext)
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0)
  const [showNoAsset, setShowNoAsset] = useState(false)
  const [revs, setRevs] = useState<string[]>([])
  const location = useLocation()
  const params = Object.fromEntries(new URLSearchParams(location.search))

  useEffect(() => {
    initFlowbite()
  }, [])

  useEffect(() => {
    const fetch = async () => {
      showLoader(true)
      const query = { ...q, ...params }
      query.offset = contractsPerPage * pageNum
      query.limit = contractsPerPage + 1
      query.order = "DESC"
      const result = await computer.query(query)
      setIsNextAvailable(result.length > contractsPerPage)
      setRevs(result.slice(0, contractsPerPage))
      if (pageNum === 0 && result?.length === 0) {
        setShowNoAsset(true)
      }
      showLoader(false)
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

  return (
    <div className="relative sm:rounded-lg pt-4 w-full">
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
        <div className="flex items-center justify-center h-20">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => navigate("/new-game")}
          >
            Play as a Guest
          </button>
        </div>
      )}
    </div>
  )
}

export const Gallery = {
  FromRevs,
  WithPagination
}
