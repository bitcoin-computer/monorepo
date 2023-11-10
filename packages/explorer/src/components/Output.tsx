import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import Well from "./Well"
import { getFnParamNames, isValidRev, sleep } from "../utils"
import Dropdown from "./Utils/Dropdown"
import Modal from "./Modal"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]

function Output(props: { computer: Computer }) {
  const location = useLocation()
  const { computer } = props
  const params = useParams()
  const [rev] = useState(params.rev || "")
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [outputData, setOutputData] = useState<any | null>(null)
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
        const string = `${rev?.split(":")[0]} ${rev?.split(":")[1]} true`
        const { result } = await computer.rpcCall("gettxout", string)
        setOutputData(result)
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
    const value = { ...formState }
    value[key] = e.target.value
    setFormState(value)
  }

  const updateTypes = (option: string, key: string) => {
    const value = { ...formState }
    value[`${key}--types`] = option
    setFormState(value)
  }

  const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

  const revToId = (rev: string) => rev?.split(":")[0]

  return (
    <>
      <div className="pt-4">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Output</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {rev}
        </p>

        <h2 className="mb-2 text-4xl font-bold dark:text-white">Data</h2>

        {smartObject &&
          Object.entries(smartObject)
            .filter(([k]) => !keywords.includes(k))
            .map(([key, value], i) => {
              return (
                <div key={i}>
                  <h3 className="mt-2 text-xl font-bold dark:text-white">
                    {capitalizeFirstLetter(key)}
                  </h3>
                  {<Well content={JSON.stringify(value, null, 2)} />}
                </div>
              )
            })}

        {functionsExist && (
          <>
            <h2 className="mb-2 text-4xl font-bold dark:text-white">Functions</h2>
            <div>
              {Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
                .filter(
                  (key) =>
                    key !== "constructor" &&
                    typeof Object.getPrototypeOf(smartObject)[key] === "function"
                )
                .map((key, fnIndex) => {
                  const paramList = getFnParamNames(Object.getPrototypeOf(smartObject)[key])
                  return (
                    <div key={fnIndex}>
                      <h3 className="mt-2 text-xl font-bold dark:text-white">{key}</h3>
                      <div className="mb-6 mt-6">
                        <form id={`fn-index-${fnIndex}`}>
                          {paramList.map((paramName, paramIndex) => (
                            <div key={paramIndex} className="mb-4">
                              <div className="mb-2">
                                <label
                                  htmlFor={`${key}-${paramName}`}
                                  className="text-md bg-gray-50 dark:bg-gray-800 dark:text-blue-4 font-medium"
                                >
                                  {paramName}
                                </label>
                              </div>
                              <div className="flex items-center space-x-4">
                                <Dropdown
                                  onSelectMethod={(option) =>
                                    updateTypes(option, `${key}-${paramName}`)
                                  }
                                  options={options}
                                  selectionTitle={"Select Type"}
                                />
                                <input
                                  type="text"
                                  className="block w-3/4 py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-md"
                                  placeholder="Enter value"
                                  required
                                  id={`${key}-${paramName}`}
                                  value={formState[`${key}-${paramName}`]}
                                  onChange={(e) => updateFormValue(e, `${key}-${paramName}`)}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-end">
                            <button
                              className="mr-8 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              onClick={(evt) =>
                                handleSmartObjectMethod(evt, smartObject, key, paramList)
                              }
                            >
                              Call Function
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )
                })}
            </div>
          </>
        )}

        {/* <h2 className="mb-2 text-4xl font-bold dark:text-white">Functions</h2>

      <h3 className="mt-2 text-xl font-bold dark:text-white">AddStudent</h3>

      {input()} */}

        <h2 className="mb-2 text-4xl font-bold dark:text-white">Meta Data</h2>

        <h3 className="text-xl font-bold dark:text-white">Id</h3>
        <Link
          to={`/outputs/${smartObject?._id}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          {smartObject?._id}
        </Link>

        <h3 className="text-xl font-bold dark:text-white">Revision</h3>
        <Link
          to={`/outputs/${smartObject?._rev}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          {smartObject?._rev}
        </Link>

        <h3 className="text-xl font-bold dark:text-white">Root</h3>
        <Link
          to={`/outputs/${smartObject?._root}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          {smartObject?._root}
        </Link>

        <h3 className="text-xl font-bold dark:text-white">Transaction</h3>
        <Link
          to={`/transactions/${revToId(smartObject?._rev)}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          {revToId(smartObject?._rev)}
        </Link>

        <h3 className="text-xl font-bold dark:text-white">Owners</h3>
        {smartObject?._owners}

        <h3 className="text-xl font-bold dark:text-white">Amount</h3>
        {smartObject?._amount}

        <h3 className="text-xl font-bold dark:text-white">Script</h3>
        {outputData?.scriptPubKey.asm}

        <h3 className="text-xl font-bold dark:text-white">Script Type</h3>
        {outputData?.scriptPubKey.type}
      </div>
      <Modal
        show={show}
        setShow={setShow}
        functionResult={functionResult}
        functionCallSuccess={functionCallSuccess}
      ></Modal>
    </>
  )
}

export default Output
