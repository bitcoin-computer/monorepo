import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import reactStringReplace from 'react-string-replace'
import { HiOutlineClipboard } from 'react-icons/hi'
import { capitalizeFirstLetter, toObject } from './common/utils'
import { Card } from './Card'
import { Modal } from './Modal'
import { FunctionResultModalContent } from './common/SmartCallExecutionResult'
import { SmartObjectFunctions } from './SmartObjectFunctions'
import { ComputerContext } from './ComputerContext'

const keywords = ['_id', '_rev', '_owners', '_root', '_satoshis']
const modalId = 'smart-object-info-modal'

export const getFnParamNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : []
}

function Copy({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="cursor-pointer pl-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      aria-label="Copy Transaction ID"
    >
      <HiOutlineClipboard />
    </button>
  )
}

function ObjectValueCard({ content, id }: { content: string; id?: string }) {
  const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g
  const revLink = (rev: string, i: number) => (
    <Link
      key={i}
      to={`/objects/${rev}`}
      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      {rev}
    </Link>
  )
  const formattedContent = reactStringReplace(content, isRev, revLink)

  return <Card content={formattedContent} id={`property-${id}-value`} />
}

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return <></>
  return (
    <>
      {Object.entries(smartObject)
        .filter(([k]) => !keywords.includes(k))
        .map(([key, value], i) => (
          <div key={i}>
            <h3 className="mt-2 text-xl font-bold dark:text-white">{capitalizeFirstLetter(key)}</h3>
            <ObjectValueCard id={key} content={toObject(value)} />
          </div>
        ))}
    </>
  )
}

function MetaData({ smartObject, prev, next }: any) {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  return (
    <div>
      <div className="pt-6 pb-6 space-y-4 border-t border-gray-300 dark:border-gray-700">
        <div className="flex">
          <a
            href={prev ? `/objects/${prev}` : undefined}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      ${
        prev
          ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
      }`}
            aria-disabled={!prev}
          >
            Previous
          </a>
          <a
            href={next ? `/objects/${next}` : undefined}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      ${
        next
          ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
      }`}
            aria-disabled={!next}
          >
            Next
          </a>
          <button
            onClick={toggleVisibility}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700`}
          >
            {isVisible ? 'Hide Metadata' : 'Show Metadata'}
          </button>
        </div>
      </div>

      {isVisible && (
        <table className="w-full mt-4 mb-8 text-[12px] text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-2">
                Key
              </th>
              <th scope="col" className="px-4 py-2">
                Short
              </th>
              <th scope="col" className="px-4 py-2">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Identity</td>
              <td className="px-4 py-2">
                <pre>_id</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  to={`/objects/${smartObject?._id}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._id}
                </Link>
                <Copy text={smartObject?._id} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Revision</td>
              <td className="px-4 py-2">
                <pre>_rev</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  to={`/objects/${smartObject?._rev}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._rev}
                </Link>
                <Copy text={smartObject?._rev} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Root</td>
              <td className="px-4 py-2">
                <pre>_root</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  to={`/objects/${smartObject?._root}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._root}
                </Link>
                <Copy text={smartObject?._root} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Owners</td>
              <td className="px-4 py-2">
                <pre>_owners</pre>
              </td>
              <td className="px-4 py-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {smartObject?._owners}
                </span>
                <Copy text={JSON.stringify(smartObject?._owners)} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Amount</td>
              <td className="px-4 py-2">
                <pre>_satoshis</pre>
              </td>
              <td className="px-4 py-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {smartObject?._satoshis} Satoshi
                </span>
                <Copy text={smartObject?._satoshis} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

function Component({ title }: { title?: string }) {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const [rev] = useState(params.rev || '')
  const computer = useContext(ComputerContext)
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [next, setNext] = useState<string | undefined>(undefined)
  const [prev, setPrev] = useState<string | undefined>(undefined)
  const [functionsExist, setFunctionsExist] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol']

  const [modalTitle, setModalTitle] = useState('')

  const setShow: any = (flag: boolean) => {
    if (flag) {
      Modal.get(modalId).show()
    } else {
      Modal.get(modalId).hide()
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const [o, p, n] = await Promise.all([
        computer.sync(rev),
        computer.prev(rev),
        computer.next(rev),
      ])

      setSmartObject(o)
      setPrev(p)
      setNext(n)
    }
    fetch()
  }, [computer, rev, location, navigate])

  useEffect(() => {
    let funcExist = false
    if (smartObject) {
      const filteredSmartObject = Object.getOwnPropertyNames(
        Object.getPrototypeOf(smartObject),
      ).filter(
        (key) =>
          key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function',
      )

      Object.keys(filteredSmartObject).forEach((key) => {
        if (key) {
          funcExist = true
        }
      })
    }
    setFunctionsExist(funcExist)
  }, [smartObject])

  const [txId, outNum] = rev.split(':')

  return (
    <>
      <div className="max-w-screen-md mx-auto">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">{title || 'Object'}</h1>
        <div className="mb-8">
          <Link
            to={`/transactions/${txId}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {txId}
          </Link>
          <span>:{outNum}</span>
          <Copy text={`${txId}:${outNum}`} />
        </div>

        <SmartObjectValues smartObject={smartObject} />

        <SmartObjectFunctions
          smartObject={smartObject}
          functionsExist={functionsExist}
          options={options}
          setFunctionResult={setFunctionResult}
          setShow={setShow}
          setModalTitle={setModalTitle}
        />

        <MetaData smartObject={smartObject} prev={prev} next={next} />
      </div>
      <Modal.Component
        title={modalTitle}
        content={FunctionResultModalContent}
        contentData={{ functionResult }}
        id={modalId}
      />
    </>
  )
}

export const SmartObject = {
  Component,
}
