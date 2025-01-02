import { useContext, useState } from 'react'
import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { Link } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import { VITE_CHESS_GAME_MOD_SPEC } from '../constants/modSpecs'
import { createGame } from '../services/game.service'

function SuccessContent(id: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div>
          Congratiolations! You have created a new game. Click{' '}
          <Link
            to={`/game/${id}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal('success-modal')
            }}
          >
            here
          </Link>{' '}
          to start playing it.
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
      <div className="p-4 md:p-5">
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

function MintForm(props: {
  computer: Computer
  setSuccessRev: React.Dispatch<React.SetStateAction<string>>
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>
}) {
  const { computer, setSuccessRev, setErrorMsg } = props
  const [name, setName] = useState('')
  const [secondPlayerPublicKey, setSecondPlayerPublicKey] = useState('')
  const [secondPlayerUserName, setSecondPlayerUserName] = useState('')
  const { showLoader } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const { tx, effect } = await computer.encode({
        exp: `new ChessGame("white", "${computer.getPublicKey()}", "${secondPlayerPublicKey}", "${name}", "${secondPlayerUserName}")`,
        mod: VITE_CHESS_GAME_MOD_SPEC,
      })

      await computer.broadcast(tx)
      setSuccessRev((effect.res as { _id: string })?._id)
      await createGame({
        gameId: (effect.res as { _id: string })?._id,
        firstPlayerPubKey: computer.getPublicKey(),
        secondPlayerPubKey: secondPlayerPublicKey,
      })

      showLoader(false)
      Modal.showModal('success-modal')
    } catch (err) {
      showLoader(false)
      if (err instanceof Error) {
        setErrorMsg(err.message)
        Modal.showModal('error-modal')
      }
    }
  }
  return (
    <>
      <form onSubmit={onSubmit} className="w-full lg:w-1/2">
        <div className="grid gap-6 mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Let's Play</h2>
          <p className="text-lg text-gray-500">Start a new game and invite your friend.</p>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Your User Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Second Player User Name
            </label>
            <input
              type="text"
              id="name"
              value={secondPlayerUserName}
              onChange={(e) => setSecondPlayerUserName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Second Player Public Key
            </label>
            <input
              type="text"
              id="name"
              value={secondPlayerPublicKey}
              onChange={(e) => setSecondPlayerPublicKey(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Game
        </button>
      </form>
    </>
  )
}

export default function CreateNewGame() {
  const computer = useContext(ComputerContext)
  const [successRev, setSuccessRev] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  return (
    <>
      <MintForm computer={computer} setSuccessRev={setSuccessRev} setErrorMsg={setErrorMsg} />
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
