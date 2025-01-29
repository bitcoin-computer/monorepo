import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Computer } from '@bitcoin-computer/lib'
import { UtilsContext } from '@bitcoin-computer/components'
import { getErrorMessage } from '../../utils'

const DeployModule = (props: {
  computer: Computer
  setShow: (flag: boolean) => void
  // eslint-disable-next-line
  setFunctionResult: Dispatch<SetStateAction<any>>
  setModalTitle: Dispatch<SetStateAction<string>>
  exampleModule: string
}) => {
  const { computer, exampleModule, setShow, setModalTitle, setFunctionResult } = props
  const [module, setModule] = useState<string>()
  const { showLoader } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    setModule(exampleModule)
  }, [exampleModule])

  const handleModuleDeploy = async () => {
    try {
      showLoader(true)
      const modSpec = await computer.deploy(module?.trim() as string)
      setFunctionResult({ _rev: modSpec, type: 'modules' })
      setModalTitle('Success!')
      setShow(true)
    } catch (error: unknown) {
      setFunctionResult(getErrorMessage(error))
      setModalTitle('Error!')
      setShow(true)
    } finally {
      showLoader(false)
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
        // eslint-disable-next-line
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
        className="mt-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Deploy Module
      </button>
    </>
  )
}

export default DeployModule
