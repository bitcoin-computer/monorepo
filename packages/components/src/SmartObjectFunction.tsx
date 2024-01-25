import { useState } from "react"
import { TypeSelectionDropdown } from "./common/TypeSelectionDropdown"
import { isValidRev, sleep } from "./common/utils"
import { UtilsContext } from "./UtilsContext"

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

export const SmartObjectFunction = ({
  computer,
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
}: any) => {
  const [formState, setFormState] = useState<any>({})
  const { showLoader } = UtilsContext.useUtilsComponents()

  const handleSmartObjectMethod = async (
    event: any,
    smartObject: any,
    fnName: string,
    params: string[]
  ) => {
    event.preventDefault()
    showLoader(true)
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
      setModalTitle("Success!")
      showLoader(false)
      setShow(true)
    } catch (error: any) {
      setFunctionResult(getErrorMessage(error))
      setModalTitle("Error!")
      showLoader(false)
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
                        value={formState[`${key}-${paramName}`] || ""}
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
