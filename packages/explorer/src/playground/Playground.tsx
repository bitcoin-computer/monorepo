import { useEffect, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import CreateNew from "./CreateNew"
import ExecuteExpression from "./ExecuteExpression"
import DeployModule from "./DeployModule"
import { initFlowbite } from "flowbite"
import {
  chat,
  chatExport,
  chatExpresion,
  fungibleToken,
  fungibleTokenExport,
  fungibleTokenExpresion,
  nft,
  nftExport,
  nftExpresion,
} from "./examples"
import { Modal } from "../components/Modal"

const Playground = (props: { computer: Computer }) => {
  const { computer } = props
  const [show, setShow] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const [functionCallSuccess, setFunctionCallSuccess] = useState(false)
  const [exampleCode, setExampleCode] = useState<string>("")
  const [exampleExpression, setExampleExpresion] = useState<string>("")
  const [exampleModule, setExampleModule] = useState<string>("")
  useEffect(() => {
    initFlowbite()
  }, [])

  const [testShow, setTestShow] = useState(true)

  const test = () => {
    console.log("testing")
  }

  const clearExamples = () => {
    setExampleCode("")
    setExampleExpresion("")
    setExampleModule("")
  }
  const loadExamples = (type: string) => {
    switch (type) {
      case "nft":
        setExampleCode(nft)
        setExampleExpresion(nftExpresion)
        setExampleModule(nftExport)
        break
      case "token":
        setExampleCode(fungibleToken)
        setExampleExpresion(fungibleTokenExpresion)
        setExampleModule(fungibleTokenExport)
        break
      case "chat":
        setExampleCode(chat)
        setExampleExpresion(chatExpresion)
        setExampleModule(chatExport)
        break
      default:
        console.log("Please select valid type")
    }
  }

  return (
    <>
      <div className="pt-4 w-full relative">
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul
            className="flex flex-wrap -mb-px text-sm font-medium text-center"
            id="default-tab"
            data-tabs-toggle="#default-tab-content"
            role="tablist"
          >
            <li className="me-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 rounded-t-lg"
                id="create-new-tab"
                data-tabs-target="#create-new"
                type="button"
                role="tab"
                aria-controls="create-new"
                aria-selected="false"
              >
                Create New
              </button>
            </li>
            <li className="me-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                id="execute-expressions-tab"
                data-tabs-target="#execute-expressions"
                type="button"
                role="tab"
                aria-controls="execute-expressions"
                aria-selected="false"
              >
                Execute Expressions
              </button>
            </li>
            <li className="me-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                id="deploy-modules-tab"
                data-tabs-target="#deploy-modules"
                type="button"
                role="tab"
                aria-controls="deploy-modules"
                aria-selected="false"
              >
                Deploy Modules
              </button>
            </li>
          </ul>
        </div>
        <div id="default-tab-content">
          <div className="hidden" id="create-new" role="tabpanel" aria-labelledby="create-new-tab">
            <CreateNew
              computer={computer}
              setShow={setShow}
              setFunctionCallSuccess={setFunctionCallSuccess}
              setFunctionResult={setFunctionResult}
              exampleCode={exampleCode}
            />
          </div>
          <div
            className="hidden"
            id="execute-expressions"
            role="tabpanel"
            aria-labelledby="execute-expressions-tab"
          >
            <ExecuteExpression
              computer={computer}
              setShow={setShow}
              setFunctionCallSuccess={setFunctionCallSuccess}
              setFunctionResult={setFunctionResult}
              exampleExpression={exampleExpression}
            />
          </div>
          <div
            className="hidden"
            id="deploy-modules"
            role="tabpanel"
            aria-labelledby="deploy-modules-tab"
          >
            <DeployModule
              computer={computer}
              setShow={setShow}
              setFunctionCallSuccess={setFunctionCallSuccess}
              setFunctionResult={setFunctionResult}
              exampleModule={exampleModule}
            />
          </div>
        </div>
        <div className="flex mb-4">
          <h4 className="mt-4 text-xl font-bold dark:text-white">Load Examples</h4>
          <button
            type="button"
            title="clear"
            className="ml-4 mt-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => clearExamples()}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={() => loadExamples("nft")}
          >
            NFT
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={() => loadExamples("token")}
          >
            Fungible Token
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={() => loadExamples("chat")}
          >
            Chat
          </button>
        </div>
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

export default Playground
