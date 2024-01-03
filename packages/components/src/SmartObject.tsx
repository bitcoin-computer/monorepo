import { useEffect, useState } from "react"
import {
  Dropdown,
  DropdownInterface,
  DropdownOptions,
  InstanceOptions,
  initFlowbite,
} from "flowbite"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { capitalizeFirstLetter, isValidRev, sleep, toObject } from "./common/utils"
import reactStringReplace from "react-string-replace"
import { ModalOld } from "./ModalOld"
import { Auth } from "./Auth"
import { Card } from "./Card"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]

export const getErrorMessage = (error: any): string => {
  if (
    error?.response?.data?.error ===
    "mandatory-script-verify-flag-failed (Operation not valid with the current stack size)"
  ) {
    return "You are not authorized to make changes to this smart object"
  } else if (error?.response?.data?.error) {
    return error?.response?.data?.error
  } else {
    return error.message ? error.message : "Error occurred"
  }
}

export const getFnParamNames = function (fn: string) {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",") : []
}

export const getValueForType = (type: string, stringValue: string) => {
  switch (type) {
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
    case "object":
      return stringValue
    default:
      return Number(stringValue)
  }
}

export const TypeSelectionDropdown = ({ id, onSelectMethod, dropdownList, selectedType }: any) => {
  const [dropDown, setDropdown] = useState<DropdownInterface>()
  const [type, setType] = useState(selectedType ? selectedType : "Type")
  const [dropdownSelectionList] = useState(dropdownList)

  useEffect(() => {
    initFlowbite()
    const $targetEl: HTMLElement = document.getElementById(`dropdownMenu${id}`) as HTMLElement
    const $triggerEl: HTMLElement = document.getElementById(`dropdownButton${id}`) as HTMLElement
    const options: DropdownOptions = {
      placement: "bottom",
      triggerType: "click",
      offsetSkidding: 0,
      offsetDistance: 10,
      delay: 300,
    }
    const instanceOptions: InstanceOptions = {
      id: `dropdownMenu${id}`,
      override: true,
    }
    setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions))
  }, [id])

  const handleClick = (type: string) => {
    setType(type)
    onSelectMethod(type)
    if (dropDown) dropDown.hide()
  }

  return (
    <>
      <button
        id={`dropdownButton${id}`}
        data-dropdown-toggle={`dropdownMenu${id}`}
        className="flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        type="button"
      >
        {type}
        <svg
          className="w-2.5 h-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          ></path>
        </svg>
      </button>

      <div
        id={`dropdownMenu${id}`}
        className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby={`dropdownButton${id}`}
        >
          {dropdownSelectionList.map((option: string, index: number) => (
            <li key={index}>
              <span
                onClick={() => {
                  handleClick(option)
                }}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {option}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
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

const Functions = ({
  smartObject,
  functionsExist,
  formState,
  updateFormValue,
  updateTypes,
  handleSmartObjectMethod,
  options,
}: any) => {
  if (!functionsExist) return <></>
  return (
    <>
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Functions</h2>
      {Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
        .filter(
          (key) =>
            key !== "constructor" && typeof Object.getPrototypeOf(smartObject)[key] === "function"
        )
        .map((key, fnIndex) => {
          const paramList = getFnParamNames(Object.getPrototypeOf(smartObject)[key])
          return (
            <div className="mt-6 mb-6" key={fnIndex}>
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
                        required
                      />
                      <TypeSelectionDropdown
                        id={`${key}${paramName}`}
                        dropdownList={options}
                        onSelectMethod={(option: string) =>
                          updateTypes(option, `${key}-${paramName}`)
                        }
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
            </div>
          )
        })}
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
  const [computer] = useState(Auth.getComputer())
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [formState, setFormState] = useState<any>({})
  const [functionsExist, setFunctionsExist] = useState(false)
  const [show, setShow] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const [functionCallSuccess, setFunctionCallSuccess] = useState(false)
  const options = ["object", "string", "number", "bigint", "boolean", "undefined", "symbol"]

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
        const key = `${fnName}-${param}`
        const paramValue = getValueForType(formState[`${key}--types`], formState[key])
        if (isValidRev(paramValue)) {
          revMap[param] = paramValue
        }
      })

      // @ts-ignore
      const { tx } = await computer.encode({
        exp: `smartObject.${fnName}(${params.map((param) => {
          const key = `${fnName}-${param}`
          const paramValue = getValueForType(formState[`${key}--types`], formState[key])
          return isValidRev(paramValue)
            ? param
            : typeof paramValue === "string"
            ? `'${paramValue}'`
            : paramValue
        })})`,
        env: { smartObject: smartObject._rev, ...revMap },
        // @ts-ignore
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
      setFunctionResult(getErrorMessage(error))
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

  const [txId, outNum] = rev.split(":")

  return (
    <>
      <div>
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Output</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          <Link
            to={`/transactions/${txId}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {txId}
          </Link>
          :{outNum}
        </p>

        <h2 className="mb-2 text-4xl font-bold dark:text-white">Data</h2>

        <SmartObjectValues smartObject={smartObject} />

        <Functions
          smartObject={smartObject}
          functionsExist={functionsExist}
          formState={formState}
          updateFormValue={updateFormValue}
          updateTypes={updateTypes}
          handleSmartObjectMethod={handleSmartObjectMethod}
          options={options}
        />

        <MetaData smartObject={smartObject} />
      </div>
      <ModalOld
        show={show}
        setShow={setShow}
        functionResult={functionResult}
        functionCallSuccess={functionCallSuccess}
      ></ModalOld>
    </>
  )
}

export const SmartObject = {
  Component,
}
