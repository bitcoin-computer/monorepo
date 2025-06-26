import { useContext, useState } from 'react'
import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { NftHelper } from '@bitcoin-computer/TBC721'
import { Link } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import { VITE_NFT_MOD_SPEC } from '../constants/modSpecs'

function SuccessContent(id: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div className="dark:text-gray-400">
          Congratulations! You minted an nft. Click{' '}
          <Link
            to={`/objects/${id}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal('success-modal')
            }}
          >
            here
          </Link>{' '}
          to see it.
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
  const [symbol, setSymbol] = useState('')
  const [url, setUrl] = useState('')
  const { showLoader } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const nftHelper = new NftHelper(computer, VITE_NFT_MOD_SPEC)
      const nft = await nftHelper.mint(name, symbol, url)
      setSuccessRev(nft._id)
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
          <h2 className="text-2xl font-bold dark:text-white">Mint NFT</h2>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Name
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
              Artist
            </label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {url && (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="w-4/5 md:w-1/2 lg:w-1/2 h-full bg-gray-200 flex items-center justify-center mt-8 dark:bg-gray-700">
                  <img className="max-h-full max-w-full object-contain" src={url} alt="" />
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Mint NFT
        </button>
      </form>
    </>
  )
}

export default function Mint() {
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
