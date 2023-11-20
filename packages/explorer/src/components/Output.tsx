import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { getFnParamNames, isValidRev, sleep } from "../utils"
import Modal from "./Modal"
// import { Modal2 } from "./Modal2"
import reactStringReplace from 'react-string-replace'
import { Card } from "./Card"
import { TypeSelectionDropdown } from "./TypeSelectionDropdown"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]

function ObjectValueCard({ content }: { content: string }) {
  const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g
  const revLink = (rev: string, i: number) => (<Link 
    key={i}
    to={`/outputs/${rev}`}
    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      {rev}
    </Link>) 
  const formattedContent = reactStringReplace(content, isRev, revLink)

  return <Card content={formattedContent} />
}

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return <></>
  return (<>
    {Object.entries(smartObject)
    .filter(([k]) => !keywords.includes(k))
    .map(([key, value], i) => (<div key={i}>
      <h3 className="mt-2 text-xl font-bold dark:text-white">
        {capitalizeFirstLetter(key)}
      </h3>
      <ObjectValueCard content={JSON.stringify(value, null, 2)} />
    </div>)
    )}
  </>)
}

const Functions = ({ smartObject, functionsExist, formState, updateFormValue, updateTypes, handleSmartObjectMethod }: any) => {
  if (!functionsExist) return <></>
  return (<>
  <h2 className="mb-2 text-4xl font-bold dark:text-white">Functions</h2>
  {Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
    .filter((key) => key !== "constructor" && typeof Object.getPrototypeOf(smartObject)[key] === "function")
    .map((key, fnIndex) => {
      const paramList = getFnParamNames(Object.getPrototypeOf(smartObject)[key])
      return (<div className="mt-6 mb-6" key={fnIndex}>
        <h3 className="mt-2 text-xl font-bold dark:text-white">{key}</h3>
        <form id={`fn-index-${fnIndex}`}>
          {paramList.map((paramName, paramIndex) => (
            <div key={paramIndex} className="mb-4">
              <div className="mb-2">
                <label
                  htmlFor={`${key}-${paramName}`}
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {paramName}
                </label>
              </div>
              <div className="flex items-center space-x-4">
              <input
                  type="text"
                  id={`${key}-${paramName}`}
                  value={formState[`${key}-${paramName}`]}
                  onChange={(e) => updateFormValue(e, `${key}-${paramName}`)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Value" 
                  required />
              <TypeSelectionDropdown 
                id={`${key}${paramName}`}
                onSelectMethod={(option: string) => updateTypes(option, `${key}-${paramName}`) }
              />
              </div>
            </div>
          ))}
          <button
            className="mr-8 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={(evt) => handleSmartObjectMethod(evt, smartObject, key, paramList)}
          >
            Call Function
          </button>
        </form>
      </div>)
    })
  }
</>)}

const revToId = (rev: string) => rev?.split(":")[0]

const MetaData = ({ smartObject }: any) => {
  return (<>
    <h2 className="mb-2 text-4xl font-bold dark:text-white">Meta Data</h2><table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
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
          <td className="px-6 py-4 break-all">
            Identity
          </td>
          <td className="px-6 py-4 break-all text-sm">
            <pre>_id</pre>
          </td>
          <td className="px-6 py-4">
            <Link
              to={`/outputs/${smartObject?._id}`}
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              {smartObject?._id}
            </Link>
          </td>
        </tr>

        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <td className="px-6 py-4 break-all">
            Revision
          </td>
          <td className="px-6 py-4 break-all">
            <pre>_rev</pre>
          </td>
          <td className="px-6 py-4">
            <Link
              to={`/outputs/${smartObject?._rev}`}
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              {smartObject?._rev}
            </Link>
          </td>
        </tr>

        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <td className="px-6 py-4 break-all">
            Root
          </td>
          <td className="px-6 py-4 break-all">
            <pre>_root</pre>
          </td>
          <td className="px-6 py-4">
            <Link
              to={`/outputs/${smartObject?._root}`}
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              {smartObject?._root}
            </Link>
          </td>
        </tr>

        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <td className="px-6 py-4 break-all">
            Owners
          </td>
          <td className="px-6 py-4 break-all">
            <pre>_owners</pre>
          </td>
          <td className="px-6 py-4">
            <span
              className="font-medium text-gray-900 dark:text-white"
            >
              {smartObject?._owners}
            </span>
          </td>
        </tr>

        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <td className="px-6 py-4 break-all">
            Amount
          </td>
          <td className="px-6 py-4 break-all">
            <pre>_amount</pre>
          </td>
          <td className="px-6 py-4">
            <span
              className="font-medium text-gray-900 dark:text-white"
            >
              {smartObject?._amount}
            </span>
          </td>
        </tr>

        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <td className="px-6 py-4 break-all">
            Transaction
          </td>
          <td className="px-6 py-4 break-all">
          </td>
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
  </>)
}

function Output(props: { computer: Computer }) {
  const location = useLocation()
  const { computer } = props
  const params = useParams()
  const [rev] = useState(params.rev || "")
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [formState, setFormState] = useState<any>({})
  const [functionsExist, setFunctionsExist] = useState(false)
  const [show, setShow] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const [functionCallSuccess, setFunctionCallSuccess] = useState(false)
  const options = ["String", "Number", "Boolean", "Smart Object", "Undefined", "NULL"]

  useEffect(() => {
    const fetch = async () => {
      try {
        setSmartObject(await computer.sync(rev))
      } catch (error) {
        console.log("Error syncing to smart object", error)
      }
    }
    fetch()
  }, [computer, rev, location])

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

  const getValue = (key: string) => {
    const stringValue = formState[key]
    switch (formState[`${key}--types`]) {
      case "number":
        return Number(stringValue)
      case "string":
        return stringValue
      case "boolean":
        return true // make this dynamic
      case "undefined":
        return undefined
      case "null":
        return null
      case "smart object":
        return stringValue
      default:
        return Number(stringValue)
    }
  }

  const handleSmartObjectMethod = async (
    event: any,
    smartObject: any,
    fnName: string,
    params: string[]
  ) => {
    event.preventDefault()
    try {
      const revMap: any = {}

      params.forEach((param) => {
        const paramValue = getValue(`${fnName}-${param}`)
        if (isValidRev(paramValue)) {
          revMap[param] = paramValue
        }
      })

      console.log({
        exp: `smartObject.${fnName}(${params.map((param) => {
          const paramValue = getValue(`${fnName}-${param}`)
          return isValidRev(paramValue)
            ? param
            : typeof paramValue === "string"
            ? `'${paramValue}'`
            : paramValue
        })})`,
        env: { smartObject: smartObject._rev, ...revMap },
        fund: true,
        sign: true,
      })

      // @ts-ignore
      const { tx } = await computer.encode({
        exp: `smartObject.${fnName}(${params.map((param) => {
          const paramValue = getValue(`${fnName}-${param}`)
          return isValidRev(paramValue)
            ? param
            : typeof paramValue === "string"
            ? `'${paramValue}'`
            : paramValue
        })})`,
        env: { smartObject: smartObject._rev, ...revMap },
        fund: true,
        sign: true,
      })

      await computer.broadcast(tx)
      await sleep(1000)
      const res = await computer.query({ ids: [smartObject._id] })
      setFunctionResult({ _rev: res[0] })
      setFunctionCallSuccess(true)
      setShow(true)
    } catch (error: any) {
      console.log(error)
      if (
        error?.response?.data?.error ===
        "mandatory-script-verify-flag-failed (Operation not valid with the current stack size)"
      ) {
        setFunctionResult("You are not authorised to make changes to this smart object")
      } else if (error?.response?.data?.error) {
        setFunctionResult(error?.response?.data?.error)
      } else {
        setFunctionResult(error.message ? error.message : "Error occurred")
      }
      setFunctionCallSuccess(false)
      setShow(true)
    }
  }

  const updateFormValue = (e: any, key: string) => {
    e.preventDefault()
    console.log(e, key)
    const value = { ...formState }
    value[key] = e.target.value
    setFormState(value)
  }

  const updateTypes = (option: string, key: string) => {
    const value = { ...formState }
    value[`${key}--types`] = option
    setFormState(value)
  }

  return (
    <>
      <div>
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Output</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {rev}
        </p>

        <h2 className="mb-2 text-4xl font-bold dark:text-white">Data</h2>

        <SmartObjectValues 
          smartObject={smartObject} />

        <Functions
          smartObject={smartObject}
          functionsExist={functionsExist}
          formState={formState}
          updateFormValue={updateFormValue}
          updateTypes={updateTypes}
          handleSmartObjectMethod={handleSmartObjectMethod}
        />

        <MetaData smartObject={smartObject} />
      </div>
      <Modal
        show={show}
        setShow={setShow}
        functionResult={functionResult}
        functionCallSuccess={functionCallSuccess}
      ></Modal>

      {/* <Modal2
        show={true}
      ></Modal2> */}
    </>
  )
}

export default Output
