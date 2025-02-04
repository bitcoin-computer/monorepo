import { useContext, useState } from 'react'
import { ComputerContext, Modal } from '@bitcoin-computer/components'
import { Link } from 'react-router-dom'
import { Counter } from '../contracts/counter'
import { VITE_COUNTER_MOD_SPEC } from '../constants/modSpecs'

function SuccessContent(rev: string) {
  return (
    <>
      <div id="mint-success" className="p-4 md:p-5 dark:text-gray-400">
        <div>
          You created a{' '}
          <Link
            id="counter-link"
            to={`/objects/${rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal('success-modal')
            }}
          >
            counter
          </Link>
        </div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => Modal.hideModal('success-modal')}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  )
}

function ErrorContent(msg: string) {
  return (
    <>
      <div className="p-4 md:p-5 dark:text-gray-400">
        <div>
          Something went wrong.
          <br />
          <br />
          {msg}
        </div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => {
            Modal.hideModal('error-modal')
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  )
}

export default function Mint() {
  const computer = useContext(ComputerContext)
  const [successRev, setSuccessRev] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const { tx, effect } = await computer.encode({
        exp: `new Counter()`,
        mod: VITE_COUNTER_MOD_SPEC,
      })
      await computer.broadcast(tx)

      const counter = effect.res as unknown as Counter
      setSuccessRev(counter._id)
      Modal.showModal('success-modal')
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
        Modal.showModal('error-modal')
      }
    }
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <button
          id="mint-counter-button"
          type="submit"
          className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Mint Counter
        </button>
      </form>
      <Modal.Component
        title={'Success'}
        content={SuccessContent}
        contentData={successRev}
        id={'success-modal'}
      />
      <Modal.Component
        title={'Error'}
        content={ErrorContent}
        contentData={errorMsg}
        id={'error-modal'}
      />
    </>
  )
}
