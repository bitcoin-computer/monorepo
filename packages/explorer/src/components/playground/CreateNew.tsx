import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { TypeSelectionDropdown } from "../TypeSelectionDropdown"
import { IoMdRemoveCircleOutline } from "react-icons/io"
import { Computer } from "@bitcoin-computer/lib"
import { getErrorMessage, getValueForType, isValidRev, sleep } from "../../utils"
import { ModSpec } from "./Modspec"
import { UtilsContext } from "@bitcoin-computer/components"

interface Argument {
  type: string
  value: string
  hidden: boolean
}

const CreateNew = (props: {
  computer: Computer
  setShow: Dispatch<SetStateAction<boolean>>
  setFunctionResult: Dispatch<SetStateAction<any>>
  setModalTitle: Dispatch<SetStateAction<string>>
  exampleCode: string
  exampleVars: { name: string; type: string; value: string }[]
}) => {
  const { computer, exampleVars, exampleCode, setShow, setModalTitle, setFunctionResult } = props
  const [code, setCode] = useState<string>()
  const [modSpec, setModSpec] = useState<string>()
  const [argumentsList, setArgumentsList] = useState<Argument[]>([])
  const options = ["object", "string", "number", "bigint", "boolean", "undefined", "symbol"]
  const { showLoader } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    const newArgumentsList = [...argumentsList]
    newArgumentsList.forEach((argument) => {
      argument.hidden = true
    })
    if (exampleVars) {
      exampleVars.forEach((exampleVar) => {
        newArgumentsList.push({
          type: exampleVar.type,
          value: exampleVar.value ? exampleVar.value : "",
          hidden: false,
        })
      })
    }
    setArgumentsList(newArgumentsList)
    setCode(exampleCode)
  }, [exampleCode, exampleVars])

  const handleAddArgument = () => {
    setArgumentsList([...argumentsList, { type: "", value: "", hidden: false }])
  }

  const handleArgumentChange = (index: number, field: "type" | "value", value: string) => {
    const updatedArguments = [...argumentsList]
    updatedArguments[index][field] = value
    setArgumentsList(updatedArguments)
  }

  const removeArgument = (index: number) => {
    const newArgumentsList = [...argumentsList]
    newArgumentsList[index] = { ...newArgumentsList[index], hidden: true }
    setArgumentsList(newArgumentsList)
  }

  const handleDeploy = async () => {
    try {
      showLoader(true)
      const createClassFunction = new Function(`return ${code?.trim()}`)
      const dynamicClass = createClassFunction()
      if (
        dynamicClass &&
        typeof dynamicClass === "function" &&
        dynamicClass.prototype &&
        dynamicClass.prototype instanceof Contract
      ) {
        const revMap: any = {}
        argumentsList
          .filter((argument) => !argument.hidden)
          .forEach((argument, index) => {
            const argValue = argument.value
            if (isValidRev(argValue)) {
              revMap[`param${index}`] = argValue
            }
          })

        const encodeObject: any = {
          exp: `
          ${dynamicClass} 
          new ${dynamicClass.name}(${argumentsList
            .filter((argument) => !argument.hidden)
            .map((argument, index) => {
              const argValue = getValueForType(argument.type, argument.value)
              return isValidRev(argValue)
                ? `param${index}`
                : typeof argValue === "string"
                ? `'${argValue}'`
                : argValue
            })})
          `,
          env: { ...revMap },
          fund: true,
          sign: true,
        }
        if (modSpec) {
          encodeObject["mod"] = modSpec
        }

        // @ts-ignore
        const { tx } = await computer.encode(encodeObject)
        const txId = await computer.broadcast(tx)
        sleep(500)
        const { res } = await computer.sync(txId)
        setFunctionResult({ _rev: res._rev, type: "objects" })
        setModalTitle("Success!")
        showLoader(false)
        setShow(true)
      } else {
        setFunctionResult("Please check the code you provided!")
        setModalTitle("Error!")
        showLoader(false)
        setShow(true)
      }
    } catch (error: any) {
      setFunctionResult(getErrorMessage(error))
      setModalTitle("Error!")
      setShow(true)
    }
  }

  return (
    <>
      <textarea
        id="code-textarea"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your JS class and code here"
        rows={16}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-mono" // Added font-mono for monospaced font
        style={{ tabSize: 2, MozTabSize: 2, OTabSize: 2, WebkitTabSize: 2 } as any} // Set tab size to 2 spaces
        spellCheck="false" // Disable spell check
        autoCapitalize="none" // Disable auto capitalization
        autoComplete="off" // Disable auto completion
        autoCorrect="off" // Disable auto correction
        wrap="off" // Disable word wrapping
      ></textarea>

      <div className="mt-4 mb-4">
        {argumentsList.map(
          (argument: Argument, index) =>
            !argument.hidden && (
              <div key={index} className="mt-2 flex items-center mb-2">
                <input
                  type="text"
                  id={`playground-argument-${index}`}
                  value={argument.value}
                  onChange={(e) => handleArgumentChange(index, "value", e.target.value)}
                  className="sm:w-full md:w-2/3 lg:w-1/2 mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Value"
                  required
                />
                <TypeSelectionDropdown
                  id={`playground-dropdown-${index}`}
                  onSelectMethod={(option: string) => {
                    argument.type = option
                  }}
                  dropdownList={options}
                  selectedType={argument.type}
                />
                <IoMdRemoveCircleOutline
                  className="w-6 h-6 ml-2 text-red-500 cursor-pointer"
                  onClick={() => removeArgument(index)}
                />
              </div>
            )
        )}
      </div>
      <button
        type="button"
        onClick={handleAddArgument}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Add Argument
      </button>
      <ModSpec modSpec={modSpec} setModSpec={setModSpec} />
      <button
        type="button"
        onClick={handleDeploy}
        className="mt-4 text-white bg-green-500 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
      >
        Call Deploy
      </button>
    </>
  )
}

export default CreateNew
