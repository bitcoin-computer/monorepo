import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { IoMdRemoveCircleOutline } from "react-icons/io"
import { Computer } from "@bitcoin-computer/lib"
import { UtilsContext } from "@bitcoin-computer/components"
import { getErrorMessage, isValidRev } from "../../utils"
import { ModSpec } from "./Modspec"

interface ExpressionArgument {
  name: string
  value: string
  hidden: boolean
}

const ExecuteExpression = (props: {
  computer: Computer
  setShow: Dispatch<SetStateAction<boolean>>
  setFunctionResult: Dispatch<SetStateAction<any>>
  setModalTitle: Dispatch<SetStateAction<string>>
  exampleExpression: string
  exampleVars: { name: string; type: string }[]
}) => {
  const { computer, exampleExpression, setShow, setModalTitle, setFunctionResult } = props

  const [expression, setExpression] = useState<string>()
  const [modSpec, setModSpec] = useState<string>()
  const [expressionArgumentsList, setExpressoinArgumentsList] = useState<ExpressionArgument[]>([])
  const { showLoader } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    setExpression(exampleExpression)
  }, [exampleExpression])

  const handleExpressoinArgumentChange = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const updatedExpressionArguments = [...expressionArgumentsList]
    updatedExpressionArguments[index][field] = value
    setExpressoinArgumentsList(updatedExpressionArguments)
  }

  const removeExpressionArgument = (index: number) => {
    const newExpressionArgumentsList = [...expressionArgumentsList]
    newExpressionArgumentsList[index] = { ...newExpressionArgumentsList[index], hidden: true }
    setExpressoinArgumentsList(newExpressionArgumentsList)
  }

  const handleAddExpressionArgument = () => {
    setExpressoinArgumentsList([...expressionArgumentsList, { name: "", value: "", hidden: false }])
  }
  const handleExpressionCall = async () => {
    try {
      showLoader(true)
      const expressionCode = expression?.trim()

      const revMap: any = {}
      expressionArgumentsList
        .filter((argument) => !argument.hidden)
        .forEach((argument) => {
          const argValue = argument.value
          if (isValidRev(argValue)) {
            revMap[argument.name] = argValue
          }
        })

      const encodeObject: any = {
        exp: `${expressionCode}`,
        env: { ...revMap },
        fund: true,
        sign: true
      }
      if (modSpec) {
        encodeObject.mod = modSpec
      }

      const { tx, effect } = (await computer.encode({
        exp: `${expressionCode}`,
        env: { ...revMap },
        fund: true,
        sign: true
      })) as any
      const txId = await computer.broadcast(tx)
      setFunctionResult({ _rev: `${txId}:0`, type: "objects", res: effect.res })
      setModalTitle("Success!")
      setShow(true)
    } catch (error: any) {
      setFunctionResult(getErrorMessage(error))
      setModalTitle("Error!")
      setShow(true)
    } finally {
      showLoader(false)
    }
  }

  return (
    <>
      <textarea
        id="expression-textarea"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="Enter expression here"
        rows={16}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-mono" // Added font-mono for monospaced font
        style={{ tabSize: 2, MozTabSize: 2, OTabSize: 2, WebkitTabSize: 2 } as any} // Set tab size to 2 spaces
        spellCheck="false" // Disable spell check
        autoCapitalize="none" // Disable auto capitalization
        autoComplete="off" // Disable auto completion
        autoCorrect="off" // Disable auto correction
        wrap="off" // Disable word wrapping
      ></textarea>

      <h6 className="mt-4 text-lg font-bold dark:text-white">Environment Variables</h6>

      <div>
        {expressionArgumentsList.map(
          (argument: ExpressionArgument, index) =>
            !argument.hidden && (
              <div key={index} className="mt-2 flex items-center mb-2">
                <input
                  type="text"
                  id={`playground-expression-argument-name-${index}`}
                  value={argument.name}
                  onChange={(e) => handleExpressoinArgumentChange(index, "name", e.target.value)}
                  className="sm:w-1/4 md:w-1/4 lg:w-1/3 mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Name"
                  required
                />
                <input
                  type="text"
                  id={`playground-expression-argument-${index}`}
                  value={argument.value}
                  onChange={(e) => handleExpressoinArgumentChange(index, "value", e.target.value)}
                  className="sm:w-full md:w-2/3 lg:w-1/2 mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Value"
                  required
                />
                <IoMdRemoveCircleOutline
                  className="w-6 h-6 ml-2 text-red-500 cursor-pointer"
                  onClick={() => removeExpressionArgument(index)}
                />
              </div>
            )
        )}
      </div>

      <button
        type="button"
        onClick={handleAddExpressionArgument}
        className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
      >
        Add Environment Variable
      </button>

      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

      <ModSpec modSpec={modSpec} setModSpec={setModSpec} />
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

      <button
        type="button"
        onClick={handleExpressionCall}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Execute Expression
      </button>
    </>
  )
}

export default ExecuteExpression
