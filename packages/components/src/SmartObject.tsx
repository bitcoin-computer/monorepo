import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { capitalizeFirstLetter, toObject } from "./common/utils"
import reactStringReplace from "react-string-replace"
import { Card } from "./Card"
import { Modal } from "./Modal"
import { FunctionResultModalContent } from "./common/SmartCallExecutionResult"
import { SmartObjectFunction } from "./SmartObjectFunction"
import { ComputerContext } from "./ComputerContext"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]
const modalId = "smart-object-info-modal"

export const getFnParamNames = function (fn: string) {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",") : []
}

function ObjectValueCard({ content }: { content: string }) {
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

  return <Card content={formattedContent} />
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
            <ObjectValueCard content={toObject(value)} />
          </div>
        ))}
    </>
  )
}

const revToId = (rev: string) => rev?.split(":")[0]

const MetaData = ({ smartObject }: any) => {
  return (
    <>
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Meta Data</h2>
      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Key
            </th>
            <th scope="col" className="px-6 py-3">
              Short
            </th>
            <th scope="col" className="px-6 py-3">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">Identity</td>
            <td className="px-6 py-4 break-all text-sm">
              <pre>_id</pre>
            </td>
            <td className="px-6 py-4">
              <Link
                to={`/objects/${smartObject?._id}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                {smartObject?._id}
              </Link>
            </td>
          </tr>

          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">Revision</td>
            <td className="px-6 py-4 break-all">
              <pre>_rev</pre>
            </td>
            <td className="px-6 py-4">
              <Link
                to={`/objects/${smartObject?._rev}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                {smartObject?._rev}
              </Link>
            </td>
          </tr>

          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">Root</td>
            <td className="px-6 py-4 break-all">
              <pre>_root</pre>
            </td>
            <td className="px-6 py-4">
              <Link
                to={`/objects/${smartObject?._root}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                {smartObject?._root}
              </Link>
            </td>
          </tr>

          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">Owners</td>
            <td className="px-6 py-4 break-all">
              <pre>_owners</pre>
            </td>
            <td className="px-6 py-4">
              <span className="font-medium text-gray-900 dark:text-white">
                {smartObject?._owners}
              </span>
            </td>
          </tr>

          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">Amount</td>
            <td className="px-6 py-4 break-all">
              <pre>_amount</pre>
            </td>
            <td className="px-6 py-4">
              <span className="font-medium text-gray-900 dark:text-white">
                {smartObject?._amount}
              </span>
            </td>
          </tr>

          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">Transaction</td>
            <td className="px-6 py-4 break-all"></td>
            <td className="px-6 py-4">
              <Link
                to={`/transactions/${revToId(smartObject?._rev)}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                {revToId(smartObject?._rev)}
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

function Component() {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const [rev] = useState(params.rev || "")
  const computer = useContext(ComputerContext)
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [functionsExist, setFunctionsExist] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const options = ["object", "string", "number", "bigint", "boolean", "undefined", "symbol"]

  const [modalTitle, setModalTitle] = useState("")

  const setShow: any = (flag: boolean) => {
    flag ? Modal.get(modalId).show() : Modal.get(modalId).hide()
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const synced = await computer.sync(rev)
        setSmartObject(synced)
      } catch (error) {
        const [txId] = rev.split(":")
        navigate(`/transactions/${txId}`)
      }
    }
    fetch()
  }, [computer, rev, location, navigate])

  useEffect(() => {
    let funcExist = false
    if (smartObject) {
      const filteredSmartObject = Object.getOwnPropertyNames(
        Object.getPrototypeOf(smartObject)
      ).filter(
        (key) =>
          key !== "constructor" && typeof Object.getPrototypeOf(smartObject)[key] === "function"
      )

      for (const key in filteredSmartObject) {
        if (key) {
          funcExist = true
        }
      }
    }
    setFunctionsExist(funcExist)
  }, [smartObject])

  const [txId, outNum] = rev.split(":")

  return (
    <>
      <div>
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Object</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          <Link
            to={`/transactions/${txId}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {txId}
          </Link>
          :{outNum}
        </p>

        <SmartObjectValues smartObject={smartObject} />

        <SmartObjectFunction
          smartObject={smartObject}
          functionsExist={functionsExist}
          options={options}
          setFunctionResult={setFunctionResult}
          setShow={setShow}
          setModalTitle={setModalTitle}
        />

        {/* <MetaData smartObject={smartObject} /> */}
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
