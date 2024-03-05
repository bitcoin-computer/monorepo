import { useEffect, useState } from 'react'
import CreateNew from './CreateNew'
import ExecuteExpression from './ExecuteExpression'
import DeployModule from './DeployModule'
import { initFlowbite } from 'flowbite'
import {
  chat,
  chatExport,
  chatExpresion,
  chatVars,
  counter,
  counterExport,
  counterExpresion,
  counterVars,
  fungibleToken,
  fungibleTokenExport,
  fungibleTokenExpresion,
  nft,
  nftExport,
  nftExpresion,
  nftVars,
  tokenVars,
} from './examples'
import { Auth, Modal, FunctionResultModalContent } from '@bitcoin-computer/components'

const modalId = 'playground-info-modal'

const Examples = ({ loadExamples, clearExamples }: { loadExamples: any; clearExamples: any }) => {
  return (
    <>
      <div className="flex mb-2">
        <h4 className="mt-4 text-xl font-bold dark:text-white">Load Examples</h4>
      </div>
      <div className="inline-flex rounded-md shadow-sm mb-2" role="group">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
          onClick={() => loadExamples('nft')}
        >
          NFT
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
          onClick={() => loadExamples('token')}
        >
          Fungible Token
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-l border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
          onClick={() => loadExamples('counter')}
        >
          Counter
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
          onClick={() => loadExamples('chat')}
        >
          Chat
        </button>
      </div>
      <button
        type="button"
        className="ml-4 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
        onClick={() => clearExamples()}
      >
        Clear
      </button>
    </>
  )
}

const Tabs = () => {
  return (
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
  )
}

const Playground = () => {
  const [computer] = useState<any>(Auth.getComputer())
  const [functionResult, setFunctionResult] = useState<any>({})
  const [exampleCode, setExampleCode] = useState<string>('')
  const [exampleExpression, setExampleExpresion] = useState<string>('')
  const [exampleModule, setExampleModule] = useState<string>('')
  const [exampleVars, setExampleVars] = useState<any[]>([])
  const [modalTitle, setModalTitle] = useState('')

  const setShow: any = (flag: boolean) => {
    flag ? Modal.get(modalId).show() : Modal.get(modalId).hide()
  }

  useEffect(() => {
    initFlowbite()
  }, [])

  const clearExamples = () => {
    setExampleCode('')
    setExampleExpresion('')
    setExampleModule('')
    setExampleVars([])
  }
  const loadExamples = (type: string) => {
    switch (type) {
      case 'nft':
        setExampleCode(nft)
        setExampleExpresion(nftExpresion)
        setExampleModule(nftExport)
        setExampleVars(nftVars)
        break
      case 'token':
        setExampleCode(fungibleToken)
        setExampleExpresion(fungibleTokenExpresion(computer.getPublicKey()))
        setExampleModule(fungibleTokenExport)
        setExampleVars(tokenVars(computer.getPublicKey()))
        break
      case 'chat':
        setExampleCode(chat)
        setExampleExpresion(chatExpresion)
        setExampleModule(chatExport)
        setExampleVars(chatVars)
        break
      case 'counter':
        setExampleCode(counter)
        setExampleExpresion(counterExpresion)
        setExampleModule(counterExport)
        setExampleVars(counterVars)
        break
      default:
        console.log('Please select valid type')
    }
  }

  return (
    <>
      <div className="pt-4 w-full relative">
        <Tabs />

        <div id="default-tab-content">
          <div className="hidden" id="create-new" role="tabpanel" aria-labelledby="create-new-tab">
            <CreateNew
              computer={computer}
              setShow={setShow}
              setModalTitle={setModalTitle}
              setFunctionResult={setFunctionResult}
              exampleCode={exampleCode}
              exampleVars={exampleVars}
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
              setModalTitle={setModalTitle}
              setFunctionResult={setFunctionResult}
              exampleExpression={exampleExpression}
              exampleVars={exampleVars}
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
              setModalTitle={setModalTitle}
              setFunctionResult={setFunctionResult}
              exampleModule={exampleModule}
            />
          </div>
        </div>

        <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

        <Examples loadExamples={loadExamples} clearExamples={clearExamples} />
      </div>
      <Modal.Component
        title={modalTitle}
        content={FunctionResultModalContent}
        contentData={{ functionResult }}
        id={modalId}
      />
    </>
  )
}

export default Playground
