import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { BsArrowUpRight } from "react-icons/bs"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { getFnParamNames } from "../utils"
import Loader from "./Loader"
import Modal from "./Modal"

const META_FIELDS = ["_id", "_rev", "_owners", "_root", "_amount"]

function Output(props: { computer: Computer }) {
  const navigate = useNavigate()

  const location = useLocation()
  const { computer } = props
  const params = useParams()
  const [rev] = useState(params.rev)
  const [isLoading, setIsLoading] = useState(false)
  const [smartContract, setSmartContract] = useState<any | null>(null)
  const [outputData, setOutputData] = useState<any | null>(null)
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
        try {
          console.log(rev)
          // @ts-ignore
          const res = await computer.sync(rev)
          console.log("res: ", res)
          setSmartContract(res)
        } catch (error) {
          console.log(error)
        }

        // @ts-ignore
        const rpcRes = await computer.rpcCall(
          "gettxout",
          `${rev?.split(":")[0]} ${rev?.split(":")[1]} true`
        )
        console.log(rpcRes)
        setOutputData(rpcRes.result)

        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log(error)
      }
    }
    fetch()
  }, [computer, rev, location])

  useEffect(() => {
    let funcExist = false
    let propExist = false
    let smartExist = false
    if (smartContract) {
      for (const key in smartContract) {
        if (
          (typeof smartContract[key] !== "object" || Array.isArray(smartContract[key])) &&
          !META_FIELDS.includes(key)
        ) {
          propExist = true
        }

        if (typeof smartContract[key] === "object" && !Array.isArray(smartContract[key])) {
          smartExist = true
        }
      }

      const filteredSmartContract = Object.getOwnPropertyNames(
        Object.getPrototypeOf(smartContract)
      ).filter(
        (key) =>
          key !== "constructor" && typeof Object.getPrototypeOf(smartContract)[key] === "function"
      )

      for (const key in filteredSmartContract) {
        if (key) {
          funcExist = true
        }
      }
    }
    setPropertiesExist(propExist)
    setFunctionsExist(funcExist)
    setSmartObjectsExist(smartExist)
  }, [smartContract])

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
    const out = await computer.getLatestRev(smartContract._id)
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
      console.log(params.map((param) => formState[`${fnName}-${param}`]))
      const res = await smartContract[fnName](
        ...params.map((param) => {
          return getValue(`${fnName}-${param}`)
        })
      )
      setIsLoading(false)
      setFunctionResult(res)
      setShow(true)
    } catch (error) {
      setIsLoading(false)
      console.log(error)
    }
  }

  const updateFormValue = (e: any, key: string) => {
    e.preventDefault()
    const value = { ...formState }
    value[key] = e.target.value
    setFormState(value)
  }

  const updateTypes = (e: any, key: string) => {
    e.preventDefault()
    const value = { ...formState }
    value[`${key}--types`] = e.target.value
    setFormState(value)
  }

  return (
    <>
      <div className="pt-4">
        {smartContract && (
          <div className="pb-8 pl-2">
            {(propertiesExist || smartObjectsExist) && (
              <>
                <h3 className="text-xl font-semibold leading-10 text-gray-900">Properties</h3>

                <div className="relative overflow-x-auto sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Key
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(smartContract).map((key) => {
                        return (
                          <>
                            {(typeof smartContract[key] !== "object" ||
                              Array.isArray(smartContract[key])) &&
                            !META_FIELDS.includes(key) &&
                            !Array.isArray(smartContract[key]) ? (
                              <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                                <th
                                  scope="row"
                                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                  {key}
                                </th>
                                <td className="px-6 py-4">{smartContract[key]}</td>
                              </tr>
                            ) : typeof smartContract[key] === "object" &&
                              !Array.isArray(smartContract[key]) ? (
                              <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                                <th
                                  scope="row"
                                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                  {key}
                                  <p className="inline mb-1 text-gray-400 text-sm"> smart object</p>
                                </th>
                                <td className="px-6 py-4">
                                  <Link
                                    to={`/outputs/${smartContract[key]._rev}`}
                                    className="hover:text-bit-blue"
                                  >
                                    {smartContract[key]._rev}
                                    <BsArrowUpRight className="inline text-l ml-1 hover:text-slate-500" />
                                  </Link>
                                </td>
                              </tr>
                            ) : (
                              <></>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {Object.keys(smartContract).map((key) => {
                  return (
                    <>
                      {(typeof smartContract[key] !== "object" ||
                        Array.isArray(smartContract[key])) &&
                      !META_FIELDS.includes(key) &&
                      Array.isArray(smartContract[key]) ? (
                        <>
                          <h3 className="text-xl font-semibold leading-10 text-gray-900">{key}</h3>
                          <div className="relative overflow-x-auto sm:rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                  <th scope="col" className="px-6 py-3">
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {smartContract[key].map((val: any, index: any) => {
                                  return (
                                    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                                      <td className="px-6 py-4">{val}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </>
                  )
                })}
              </>
            )}
            {functionsExist && (
              <>
                <dl className="text-gray-900 divide-y divide-gray-200">
                  {Object.getOwnPropertyNames(Object.getPrototypeOf(smartContract))
                    .filter(
                      (key) =>
                        key !== "constructor" &&
                        typeof Object.getPrototypeOf(smartContract)[key] === "function"
                    )
                    .map((key, fnIndex) => {
                      const paramList = getFnParamNames(Object.getPrototypeOf(smartContract)[key])
                      return (
                        <div className="flex flex-col py-3">
                          <h3 className="text-xl font-semibold leading-10 text-gray-900">{key}</h3>
                          <dd className="text-md font-normal">
                            <form id={`fn-index-${fnIndex}`}>
                              <div className="flex flex-row">
                                {paramList.map((paramName) => (
                                  <div className="relative z-0 w-full mb-6 group">
                                    <div className="flex flex-row">
                                      <label className="sr-only">Choose a state</label>
                                      <select
                                        id="types"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg border-gray-100 border-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 mr-2"
                                        onChange={(e) => updateTypes(e, `${key}-${paramName}`)}
                                      >
                                        <option value="number" selected>
                                          Number
                                        </option>
                                        <option value="string">String</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="undefined">Undefined</option>
                                        <option value="null">NULL</option>
                                      </select>

                                      <div>
                                        <input
                                          type="text"
                                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                          placeholder=" "
                                          required
                                          id={`${key}-${paramName}`}
                                          value={formState[`${key}-${paramName}`]}
                                          onChange={(e) =>
                                            updateFormValue(e, `${key}-${paramName}`)
                                          }
                                        />
                                        <label className="peer-focus:font-normal absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                          {paramName}
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-normal rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={(evt) =>
                                  handleSmartContractMethod(evt, smartContract, key, paramList)
                                }
                              >
                                {Object.getPrototypeOf(smartContract)[key].name}
                              </button>
                            </form>
                          </dd>
                        </div>
                      )
                    })}
                </dl>
              </>
            )}
            <h3 className="text-xl font-semibold leading-10 text-gray-900">Meta Information</h3>
            <div className="relative overflow-x-auto sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Key
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {META_FIELDS.map((key) => {
                    return (
                      <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {key}
                        </th>
                        <td className="px-6 py-4">{smartContract[key]}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <dl className="text-gray-900 divide-y divide-gray-200 pt-6">
              <h3 className="text-xl font-semibold leading-10 text-gray-900">Transaction</h3>
              <div className="flex flex-col py-3">
                <dd className="text-md font-normal">
                  <Link to={`/transactions/${rev?.split(":")[0]}`} className="hover:text-bit-blue">
                    {rev?.split(":")[0]}
                    <BsArrowUpRight className="inline text-l ml-1 hover:text-slate-500" />
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        )}
        {outputData && (
          <div className="relative overflow-x-auto sm:rounded-lg pl-2">
            <h3 className="text-xl font-semibold leading-10 text-gray-900">Output</h3>

            <table className="w-full text-sm text-left text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Script PubKey
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {outputData && (
                  <tr key={outputData.n} className="bg-white border-b hover:bg-gray-50 ">
                    <th
                      scope="row"
                      className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap"
                    >
                      {outputData.value}
                    </th>
                    <th
                      scope="row"
                      className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap"
                    >
                      <button
                        className="hover:text-bit-blue"
                        // onClick={() => handleClick(txn, output.n)}
                      >
                        {outputData.scriptPubKey.asm}
                        <BsArrowUpRight className="inline text-l ml-1 hover:text-slate-500" />
                      </button>
                    </th>
                    <th
                      scope="row"
                      className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap"
                    >
                      {outputData.scriptPubKey.type}
                    </th>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isLoading && <Loader />}
      <Modal
        show={show}
        setShow={setShow}
        functionResult={functionResult}
        navigateToNewSmartObject={navigateToNewSmartObject}
      ></Modal>
    </>
  )
}

export default Output
