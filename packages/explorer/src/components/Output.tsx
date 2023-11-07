import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link, useLocation, useParams, useNavigate } from "react-router-dom"
import Well from "./Well"
import { getFnParamNames } from "../utils"
import Dropdown from "./Utils/Dropdown"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]

function Output(props: { computer: Computer }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { computer } = props
  const params = useParams()
  const [rev] = useState(params.rev || "")
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [outputData, setOutputData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formState, setFormState] = useState<any>({})
  const [smartObjectsExist, setSmartObjectsExist] = useState(false)
  const [propertiesExist, setPropertiesExist] = useState(false)
  const [functionsExist, setFunctionsExist] = useState(false)
  const [show, setShow] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        setSmartObject(await computer.sync(rev))
        const string = `${rev?.split(":")[0]} ${rev?.split(":")[1]} true`
        const { result } = await computer.rpcCall("gettxout", string)
        setOutputData(result)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log("Error syncing to smart object", error)
      }
    }
    fetch()
  }, [computer, rev, location])

  useEffect(() => {
    let funcExist = false
    let propExist = false
    let smartExist = false
    if (smartObject) {
      for (const key in smartObject) {
        if (
          (typeof smartObject[key] !== "object" || Array.isArray(smartObject[key])) &&
          !keywords.includes(key)
        ) {
          propExist = true
        }

        if (typeof smartObject[key] === "object" && !Array.isArray(smartObject[key])) {
          smartExist = true
        }
      }

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
    setPropertiesExist(propExist)
    setFunctionsExist(funcExist)
    setSmartObjectsExist(smartExist)
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
      default:
        return Number(stringValue)
    }
  }

  const navigateToNewSmartObject = async () => {
    const out = await computer.getLatestRev(smartObject._id)
    navigate(`/outputs/${out}`)
    window.location.reload()
  }

  const handleSmartContractMethod = async (
    event: any,
    smartContract: any,
    fnName: string,
    params: string[]
  ) => {
    setIsLoading(true)
    event.preventDefault()
    try {
      // const res = await smartContract[fnName](
      //   ...params.map((param) => {
      //     return getValue(`${fnName}-${param}`)
      //   })
      // )
      console.log(
        smartContract,
        fnName,
        ...params.map((param) => {
          return getValue(`${fnName}-${param}`)
        })
      )

      // const obj: any = {}

      // params.forEach((param) => {
      //   obj[param] = getValue(`${fnName}-${param}`)
      // })

      console.log({
        exp: `smartContract.${fnName}(${params.map((param) => {
          return getValue(`${fnName}-${param}`)
        })})`,
        env: { smartContract: smartContract._rev },
      })

      // @ts-ignore
      const { tx } = await computer.encode({
        exp: `smartContract.${fnName}(${params.map((param) => {
          return getValue(`${fnName}-${param}`)
        })})`,
        env: { smartContract: smartContract._rev },
      })

      console.log(tx)
      setIsLoading(false)
      // setFunctionResult(res)
      setShow(true)
    } catch (error) {
      setIsLoading(false)
      console.log("Error", error)
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
    console.log("update types is being called, ", key, value[`${key}--types`], option)
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
                              <div>
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
                                handleSmartContractMethod(evt, smartObject, key, paramList)
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
    </>
  )
}

export default Output
