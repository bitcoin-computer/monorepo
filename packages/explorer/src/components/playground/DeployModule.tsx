import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import { getErrorMessage } from "../../utils"

const DeployModule = (props: {
  computer: Computer
  setShow: Dispatch<SetStateAction<boolean>>
  setFunctionResult: Dispatch<SetStateAction<any>>
  setModalTitle: Dispatch<SetStateAction<string>>
  exampleModule: string
}) => {
  const { computer, exampleModule, setShow, setModalTitle, setFunctionResult } = props
  const [module, setModule] = useState<string>()

  useEffect(() => {
    setModule(exampleModule)
  }, [exampleModule])

  const handleModuleDeploy = async () => {
    try {
      // @ts-ignore
      const modSpec = await computer.deploy(module?.trim())
      setFunctionResult({ _rev: modSpec, type: "modules" })
      setModalTitle("Success!")
      setShow(true)
    } catch (error: any) {
      setFunctionResult(getErrorMessage(error))
      setModalTitle("Error!")
      setShow(true)
    }
  }

  return (
    <>
      <textarea
        id="module-textarea"
        value={module}
        onChange={(e) => setModule(e.target.value)}
        placeholder="Enter your module here"
        rows={16}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-mono" // Added font-mono for monospaced font
        style={{ tabSize: 2, MozTabSize: 2, OTabSize: 2, WebkitTabSize: 2 } as any} // Set tab size to 2 spaces
        spellCheck="false" // Disable spell check
        autoCapitalize="none" // Disable auto capitalization
        autoComplete="off" // Disable auto completion
        autoCorrect="off" // Disable auto correction
        wrap="off" // Disable word wrapping
      ></textarea>
      <button
        type="button"
        onClick={handleModuleDeploy}
        className="mt-4 text-white bg-green-500 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
      >
        Deploy Module
      </button>
    </>
  )
}

export default DeployModule
