import { useEffect, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import Modal from "../components/Modal"
import CreateNew from "./CreateNew"
import ExecuteExpression from "./ExecuteExpression"
import DeployModule from "./DeployModule"
import { initFlowbite } from "flowbite"

const Playground = (props: { computer: Computer }) => {
  const { computer } = props
  const [show, setShow] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const [functionCallSuccess, setFunctionCallSuccess] = useState(false)

  useEffect(() => {
    initFlowbite()
  }, [])

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
            />
          </div>
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
