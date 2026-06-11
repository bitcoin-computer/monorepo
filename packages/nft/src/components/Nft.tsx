import { Dispatch, useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Modal, UtilsContext, ComputerContext, bigIntToStr } from '@bitcoin-computer/components'
import { Computer } from '@bitcoin-computer/lib'
import { TxWrapperHelper, PaymentHelper, PaymentMock, SaleHelper } from '@bitcoin-computer/swap'
import { NFT } from '@bitcoin-computer/TBC721'
import {
  VITE_TX_WRAPPER_MOD_SPEC,
  VITE_PAYMENT_MOD_SPEC,
  VITE_SALE_MOD_SPEC,
} from '../constants/modSpecs'
import { Loader } from '../utils'

const modalId = 'smart-object-bought-modal'

const getPrice = async (computer: Computer, nft: NFT) => {
  const txWrapperHelper = new TxWrapperHelper(computer, VITE_TX_WRAPPER_MOD_SPEC)
  const saleHelper = new SaleHelper(computer, VITE_SALE_MOD_SPEC)
  const saleTxn = await txWrapperHelper.decodeTx(nft.offerTxRev)
  return saleHelper.checkSaleTx(saleTxn)
}

function isListed(nft: NFT) {
  return nft && nft.offerTxRev
}

function isMine(computer: Computer, nft: NFT) {
  return nft && nft._owners[0] === computer.getPublicKey()
}

function ShowOwner({ computer, nft }: { computer: Computer; nft: NFT }) {
  if (!nft) throw new Error('NFT not found')

  return (
    <p className="my-3 text-gray-500 dark:text-gray-400">
      Owned by{' '}
      <Link
        to={`/?publicKey=${nft._owners[0]}`}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        onClick={() => {
          Modal.hideModal(modalId)
        }}
      >
        {nft._owners[0] == computer.getPublicKey()
          ? 'you'
          : `${nft._owners[0].substring(0, 18)}... `}
      </Link>
      .
    </p>
  )
}

const List = ({ computer, nft }: { computer: Computer; nft: NFT }) => {
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { showSnackBar } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!amount) showSnackBar('Provide valid amount', false)

    try {
      setIsLoading(true)
      const txWrapperHelper = new TxWrapperHelper(computer, VITE_TX_WRAPPER_MOD_SPEC)
      const { tx: wrappedTx } = await txWrapperHelper.createWrappedTx(
        computer.getPublicKey(),
        computer.getUrl(),
      )
      const offerTxId = await computer.broadcast(wrappedTx)
      await nft.list(offerTxId)

      const saleHelper = new SaleHelper(computer, VITE_SALE_MOD_SPEC)
      const parsedSatoshis = Number(amount) * 1e8
      if (!parsedSatoshis) {
        showSnackBar('Please provide a valid amount.', false)
        return
      }
      const mock = new PaymentMock(BigInt(parsedSatoshis))
      const { tx: saleTx } = await saleHelper.createSaleTx(nft, mock)
      if (!saleTx) {
        showSnackBar('Failed to list NFT for sale.', false)
        return
      }

      const { tx: offerTxWithSaleTx } = await txWrapperHelper.addSaleTx(offerTxId, saleTx)

      await computer.broadcast(offerTxWithSaleTx)
      showSnackBar('Successfully listed NFT for sale.', true)
      setAmount('')
      setIsLoading(false)
      showSnackBar(`You listed this NFT for ${amount} ${computer.getChain()}`, true)
    } catch {
      setIsLoading(false)
      showSnackBar('Failed to create sell offer', false)
    }
  }

  const ButtonLabel = () =>
    isLoading ? (
      <>
        Listing <Loader />
      </>
    ) : (
      <>List for Sale</>
    )

  return (
    <>
      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <form className="flex flex-row items-center" onSubmit={onSubmit}>
        <input
          type="number"
          id="list-for-sale"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
          }}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block flex-1 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={`Amount in ${computer.getChain()}`}
          required
        />
        <button
          type="submit"
          className="ml-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          disabled={isLoading}
        >
          <ButtonLabel />
        </button>
      </form>
    </>
  )
}

const UnList = ({ nft }: { nft: NFT }) => {
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onClick = async () => {
    try {
      setIsLoading(true)
      await nft.unlist()
      showSnackBar(`You unlisted this NFT.`, true)
      setIsLoading(false)
    } catch {
      setIsLoading(false)
      showSnackBar('Failed to unlist nft', false)
    }
  }

  const ButtonLabel = () =>
    isLoading ? (
      <>
        Un-Listing <Loader />
      </>
    ) : (
      <>Un-List</>
    )

  return (
    <>
      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />

      <button
        type="button"
        onClick={onClick}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        disabled={isLoading}
      >
        <ButtonLabel />
      </button>
    </>
  )
}

const Buy = ({
  computer,
  nft,
  setFunctionResult,
}: {
  computer: Computer
  nft: NFT
  setFunctionResult: Dispatch<React.SetStateAction<string>>
}) => {
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const [price, setPrice] = useState<bigint>(0n)
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true)
  const [isBuying, setIsBuying] = useState<boolean>(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        setPrice(await getPrice(computer, nft))
      } catch {
        showSnackBar('Failed to fetch price of NFT.', false)
      } finally {
        setIsLoadingPrice(false)
      }
    }
    fetch()
  }, [computer, nft])

  const onClick = async () => {
    try {
      setIsBuying(true)
      const txWrapperHelper = new TxWrapperHelper(computer, VITE_TX_WRAPPER_MOD_SPEC)
      const saleHelper = new SaleHelper(computer, VITE_SALE_MOD_SPEC)
      const paymentHelper = new PaymentHelper(computer, VITE_PAYMENT_MOD_SPEC)
      const saleTxn = await txWrapperHelper.decodeTx(nft.offerTxRev)
      const nftSatoshis = await saleHelper.checkSaleTx(saleTxn)
      const { tx: paymentTx } = await paymentHelper.createPaymentTx(nftSatoshis)
      const paymentTxId = await computer.broadcast(paymentTx)
      const payment = await paymentHelper.getPayment(paymentTxId)
      const finalTx = await SaleHelper.finalizeSaleTx(
        saleTxn,
        payment,
        computer.toScriptPubKey() as Buffer,
      )

      await computer.fund(finalTx)
      await computer.sign(finalTx)
      await computer.broadcast(finalTx)
      setFunctionResult(nft._id)
      Modal.showModal(modalId)
      setIsLoadingPrice(false)
    } catch (error) {
      setIsLoadingPrice(false)
      showSnackBar(error instanceof Error ? error.message : 'Failed to buy nft', false)
    } finally {
      setIsBuying(false)
    }
  }

  const amount = isLoadingPrice ? <Loader /> : <>{bigIntToStr(price)}</>
  const ButtonLabel = () =>
    isBuying ? (
      <>
        Buying <Loader />
      </>
    ) : (
      <>
        Buy for {amount} {computer.getChain()}
      </>
    )

  return (
    <>
      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <button
        type="button"
        onClick={onClick}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        disabled={isBuying}
      >
        <ButtonLabel />
      </button>
    </>
  )
}

function BoughtNft(id: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div className="dark:text-gray-400">
          You bought this NFT{' '}
          <Link
            to={`/objects/${id}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal(modalId)
            }}
          >
            nft
          </Link>
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
  )
}

function NewNFT() {
  return (
    <>
      <div className="p-4 md:p-5">
        <div className="dark:text-gray-400">Congratulations! You minted an nft.</div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => Modal.hideModal('new-modal')}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  )
}

function NftView() {
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const [id] = useState(params.id || '')
  const computer = useContext(ComputerContext)
  const [nft, setNft] = useState<NFT | null>(null)
  const [functionResult, setFunctionResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const isNew = location.state?.isNew || false

  useEffect(() => {
    const fetch = async () => {
      try {
        const latesRev = await computer.getLatestRev(id)
        const synced = (await computer.sync(latesRev)) as NFT
        setNft(synced)
      } catch (err) {
        if (err instanceof Error) console.log(err.stack)
        showSnackBar('Not a valid NFT rev', false)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [computer, id, location, navigate])

  useEffect(() => {
    if (nft && isNew) {
      console.log('is NEW!!!')
      Modal.showModal('new-modal')
    }
  }, [nft, isNew])

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4 animate-pulse">
        <div className="max-w-screen-xl items-center justify-between mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-l-lg bg-gray-300 dark:bg-gray-700 h-96"></div>
            <div className="col-span-1 py-4 pr-4">
              <div className="h-10 bg-gray-200 rounded dark:bg-gray-700 w-3/4 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded dark:bg-gray-700 w-2/3 mb-4"></div>
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
              <div className="flex flex-row items-center">
                <div className="bg-gray-200 rounded-lg dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex-1 h-10"></div>
                <div className="ml-3 bg-gray-200 rounded-lg dark:bg-gray-700 h-10 w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!nft) return <></>

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4">
      <div className="max-w-screen-xl items-center justify-between mx-auto">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-lg">
            <img
              className="h-auto rounded-l-lg max-w-full w-full"
              src={nft.url}
              alt="Image Preview"
              crossOrigin="anonymous"
            />
          </div>
          <div className="col-span-1 py-4 pr-4">
            <h2 className="text-4xl font-bold dark:text-white mb-1">{nft.name}</h2>
            <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
              By {nft.artist}
            </p>

            <ShowOwner computer={computer} nft={nft}></ShowOwner>

            {isMine(computer, nft) && !isListed(nft) && <List computer={computer} nft={nft} />}
            {isMine(computer, nft) && isListed(nft) && <UnList nft={nft} />}
            {!isMine(computer, nft) && isListed(nft) && (
              <Buy computer={computer} nft={nft} setFunctionResult={setFunctionResult} />
            )}
          </div>
        </div>
      </div>

      <Modal.Component
        title={'Success'}
        content={BoughtNft}
        contentData={functionResult}
        id={modalId}
      />

      <Modal.Component title={'Success'} content={NewNFT} id={'new-modal'} />
    </div>
  )
}

export { NftView }
