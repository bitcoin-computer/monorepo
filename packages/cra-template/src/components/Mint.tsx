import { useState } from "react"
import { Auth, Modal } from "@bitcoin-computer/components"
import { Counter } from "../contracts/counter"

function modalContent(message: string) {
  return <>
    <div className="p-4 md:p-5">
      <div>
        {message}
      </div>
    </div>
    <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
      <button
        onClick={() => Modal.hideModal(modalId)}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Close
      </button>
    </div>
  </>
}

const modalId = 'new-counter-modal'

export default function Mint() {
  const [computer] = useState(Auth.getComputer())
  const [modalTitle, setModalTitle] = useState('')
  const [contentData, setContentData] = useState('')

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      name: { value: string }
      count: { value: string }
    }
    const name = target.name.value;
    const count = parseInt(target.count.value, 10)
    try {
      const counter = await computer.new(Counter, [count, name])
      setContentData(`You created a counter with id ${counter._id}`)
      setModalTitle('Success')
    } catch(err) {
      if (err instanceof Error) {
        setContentData(`Something went wrong\n${err.message}`)
        setModalTitle('Error')
      }
    }
    Modal.showModal(modalId)
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Counter Name</label>
          <input type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        <div className="mb-5">
          <label htmlFor="count" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Initial Value</label>
          <input type="text" id="count" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        <button type="submit" className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Mint Counter</button>
      </form>
      <Modal.Component title={modalTitle} content={modalContent} contentData={contentData} id={modalId} />
    </>
  )
}