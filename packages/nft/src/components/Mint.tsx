import { useContext, useState } from 'react'
import { ComputerContext, Modal } from '@bitcoin-computer/components'
import { NftHelper } from '@bitcoin-computer/TBC721'
import { Link } from 'react-router-dom'
import { VITE_NFT_MOD_SPEC } from '../constants/modSpecs'
import { Loader } from '../utils'
import { useNavigate } from 'react-router-dom'

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

const Image = ({ url }: { url: string }) => {
  if (url)
    return (
      <img
        className="max-h-full rounded-l-lg w-full object-contain"
        src={url}
        alt=""
        crossOrigin="anonymous"
      />
    )
  return (
    <div className="flex items-center justify-center w-full h-full mb-4 bg-gray-300 rounded-sm dark:bg-gray-700">
      <svg
        className="w-10 h-10 text-gray-200 dark:text-gray-600"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 20"
      >
        <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
      </svg>
    </div>
  )
}

export default function Mint() {
  const computer = useContext(ComputerContext)
  const [successRev, setSuccessRev] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const nftHelper = new NftHelper(computer, VITE_NFT_MOD_SPEC)
      const nft = await nftHelper.mint(name, symbol, url)
      setSuccessRev(nft._id)
      setIsLoading(false)
      navigate(`/objects/${nft._id}`, { state: { isNew: true } })
    } catch (err) {
      setIsLoading(false)
      if (err instanceof Error) {
        setErrorMsg(err.message)
        Modal.showModal('error-modal')
      }
    }
  }

  const ButtonLabel = () =>
    isLoading ? (
      <>
        Minting <Loader />
      </>
    ) : (
      <>Mint NFT</>
    )

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4">
      <div className="w-full items-center justify-between">
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="col-span-2 rounded-lg">
            <Image url={url} />
          </div>
          <div className="col-span-1 py-4 pr-4">
            <form onSubmit={onSubmit} className="w-full">
              <div className="grid gap-6 mb-6">
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
                </div>
              </div>
              <button
                type="submit"
                className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <ButtonLabel />
              </button>
            </form>
          </div>
        </div>
      </div>

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
    </div>
  )
}
