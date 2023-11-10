import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Loader from "./Loader"
import Well from "./Well"

type Json = JBasic | JObject | JArray
type JBasic = undefined | null | boolean | number | string | symbol | bigint
type JArray = Json[]
type JObject = { [x: string]: Json }

const isJUndefined = (a: any): a is undefined => typeof a === 'undefined'
const isJNull = (a: any): a is null => a === null
const isJBoolean = (a: any): a is boolean => typeof a === 'boolean'
const isJNumber = (a: any): a is number => typeof a === 'number'
const isJString = (a: any): a is string => typeof a === 'string'
const isJSymbol = (a: any): a is symbol => typeof a === 'symbol'
const isJBigInt = (a: any): a is bigint => typeof a === 'bigint'
const isJBasic = (a: any): a is JBasic =>
  isJNull(a) ||
  isJUndefined(a) ||
  isJNumber(a) ||
  isJString(a) ||
  isJBoolean(a) ||
  isJSymbol(a) ||
  isJBigInt(a)
const isJObject = (a: any): a is JObject => !isJBasic(a) && !Array.isArray(a)
const isJArray = (a: any): a is JArray => !isJBasic(a) && Array.isArray(a)

const objectEntryMap =
  (g: (el: [string, Json]) => [string, Json]) =>
  (object: JObject): JObject =>
    Object.fromEntries(Object.entries(object).map(g))

const objectMap =
  (f: (el: Json) => Json) =>
  (object: JObject): JObject =>
    objectEntryMap(([key, value]) => [key, f(value)])(object)

const jsonMap =
  (g: (el: Json) => Json) =>
  (json: Json): Json => {
    if (isJBasic(json)) return g(json)
    if (isJArray(json)) return g(json.map(jsonMap(g)))
    if (isJObject(json)) return g(objectMap(jsonMap(g))(json))
    throw new Error('Unsupported type')
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

  if(errorMsg)
    return (<Well content={errorMsg} />)

  // @ts-ignore
  const strip = (value) => {
    if (isJBasic(value)) return value
    if (isJArray(value)) return value.map(strip)
    const { _id, _root, _rev, _amount, _owners, ...rest } = value
    return rest
  }

  return (<Well content={JSON.stringify(jsonMap(strip as any)(value as any), null, 2)} />)
}

export default function Home(props: { computer: Computer }) {
  const { computer } = props
  const contractsPerPage = 10

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
      <h1 className="mb-4 text-5xl font-extrabold dark:text-white">Bitcoin Computer Explorer</h1>

      <h2 className="mb-2 text-4xl font-bold dark:text-white">Smart Objects</h2>

      <table className="w-full mt-4 mb-4 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="max-w-[50%] px-6 py-3">
              Value
            </th>
            <th scope="col" className="max-w-[50%] px-6 py-3">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {revs.map((rev) => (
            <tr key={rev} className="max-w-[50%] overflow-x-scroll bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4 overflow-x-scroll">
                <ValueComponent rev={rev} computer={computer} />
              </td>

              <td className="max-w-[50%] px-6 py-4">
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
      )}
      {isLoading && <Loader />}
    </div>
  )
}
