import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import {
  toObject,
  capitalizeFirstLetter,
  Modal,
  UtilsContext,
  ComputerContext
} from "@bitcoin-computer/components"
import { Computer } from "@bitcoin-computer/lib"
import { OfferHelper, PaymentHelper, PaymentMock, SaleHelper } from "@bitcoin-computer/swap"
import { NFT } from "@bitcoin-computer/TBC721"
import { offerModSpec, paymentModSpec, saleModSpec } from "../constants/modSpecs"

const modalId = "smart-object-bought-modal"

const BuyNFT = async ({
  computer,
  nft,
  setFunctionResult
}: {
  computer: Computer
  nft: NFT
  setFunctionResult: any
}) => {
  const offerHelper = new OfferHelper(computer, offerModSpec)
  const saleHelper = new SaleHelper(computer, saleModSpec)
  const paymentHelper = new PaymentHelper(computer, paymentModSpec)
  const saleTxn = await offerHelper.decodeOfferTx(nft.offerTxRev)
  const nftAmount = await saleHelper.checkSaleTx(saleTxn)
  const { tx: paymentTx } = await paymentHelper.createPaymentTx(nftAmount)
  const paymentTxId = await computer.broadcast(paymentTx)
  const payment = await paymentHelper.getPayment(paymentTxId)
  const finalTx = await SaleHelper.finalizeSaleTx(
    saleTxn,
    payment,
    computer.toScriptPubKey() as any
  )

  // Buyer funds, signs, and broadcasts to execute the sale
  await computer.fund(finalTx)
  await computer.sign(finalTx)
  await computer.broadcast(finalTx)
  // const test = await computer.sync(txId)
  // need to have a sleep on this to get latest reve
  const [updatedRev] = await computer.query({ ids: [nft._id] })
  setFunctionResult(updatedRev)
  Modal.showModal(modalId)
  return nftAmount
}

const CreateSellOffer = async ({
  computer,
  amount,
  nft,
  showSnackBar
}: {
  computer: Computer
  amount: string
  nft: NFT
  showSnackBar: (message: string, success: boolean) => void
}) => {
  const offerHelper = new OfferHelper(computer, offerModSpec)
  const { tx: offerTx } = await offerHelper.createOfferTx(
    computer.getPublicKey(),
    computer.getUrl()
  )
  const offerTxId = await computer.broadcast(offerTx)
  await nft.list(offerTxId)

  const saleHelper = new SaleHelper(computer, saleModSpec)
  const parsedAmount = Number(amount) * 1e8
  if (!parsedAmount) {
    showSnackBar("Please provide a valid amount.", false)
    return
  }
  const mock = new PaymentMock(parsedAmount)
  const { tx: saleTx } = await saleHelper.createSaleTx(nft, mock)
  if (!saleTx) {
    showSnackBar("Failed to list NFT for sale.", false)
    return
  }

  const { tx: offerTxWithSaleTx } = await offerHelper.addSaleTx(offerTxId, saleTx)

  await computer.broadcast(offerTxWithSaleTx)
  showSnackBar("Successfully listed NFT for sale.", true)
}

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return <></>
  return (
    <>
      {smartObject.name && (
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {smartObject.name}
        </h2>
      )}
      {smartObject.artist && (
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {capitalizeFirstLetter(smartObject.artist)}
        </p>
      )}
      {smartObject.url && (
        <div className="w-full h-80 flex items-center justify-center my-4">
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <img
              className="max-h-full max-w-full object-contain"
              src={smartObject.url}
              alt="Image Preview"
            />
          </div>
        </div>
      )}
      {smartObject._owners && smartObject._owners[0] && (
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {capitalizeFirstLetter("owned by:")}{" "}
          <Link
            to={`/?publicKey=${smartObject._owners[0]}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal(modalId)
            }}
          >
            {smartObject._owners[0].substring(0, 8)}...
            {smartObject._owners[0].substring(smartObject._owners[0].length - 2)}
          </Link>
        </p>
      )}
    </>
  )
}

const CreateSellOfferComponent = ({
  computer,
  smartObject
}: {
  computer: Computer
  smartObject: NFT
}) => {
  const [amount, setAmount] = useState<string>("")
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  return (
    <>
      <h2 className="text-xl font-bold dark:text-white mb-2 mt-4">List For Sale</h2>
      <div className="flex">
        <input
          type="number"
          id={`list-for-sale`}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
          }}
          className="flex-1 sm:w-full md:w-2/3 lg:w-1/2 mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={`Amount ${computer.getChain()}`}
          required
        />
        <button
          type="button"
          onClick={async () => {
            if (!amount) {
              showSnackBar("Provide valid amount", false)
            }
            try {
              showLoader(true)
              await CreateSellOffer({ computer, amount, nft: smartObject, showSnackBar })
              setAmount("")
              showLoader(false)
              showSnackBar(`You listed this NFT for ${amount} ${computer.getChain()}`, true)
            } catch (error) {
              showLoader(false)
              showSnackBar("Failed to create sell offer", false)
            }
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          List for Sale
        </button>
      </div>
    </>
  )
}

const ShowSaleOfferComponent = ({ computer, nft }: { computer: Computer; nft: NFT }) => {
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const [nftAmount, setNftAmount] = useState<number>(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        showLoader(true)
        const offerHelper = new OfferHelper(computer, offerModSpec)
        const saleHelper = new SaleHelper(computer, saleModSpec)
        const saleTxn = await offerHelper.decodeOfferTx(nft.offerTxRev)
        const amount = await saleHelper.checkSaleTx(saleTxn)
        setNftAmount(amount)
        showLoader(false)
      } catch (error) {
        showLoader(false)
        showSnackBar("Failed to fetch price of NFT.", false)
      }
    }
    fetch()
  }, [computer, nft])

  return (
    <>
      {nftAmount !== 0 && (
        <div className="sm:w-full">
          <h2 className="mt-3 text-l font-bold dark:text-white">
            NFT Listed At {toObject(nftAmount / 1e8)} {computer.getChain()}
          </h2>
        </div>
      )}
    </>
  )
}

const UnlistNftComponent = ({ smartObject }: { smartObject: NFT }) => {
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  return (
    <div className="flex">
      <button
        type="button"
        onClick={async () => {
          try {
            showLoader(true)
            await smartObject.unlist()
            showSnackBar(`You unlisted this NFT.`, true)
            showLoader(false)
          } catch (error) {
            showLoader(false)
            showSnackBar("Failed to unlist nft", false)
          }
        }}
        className="text-white mt-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Unlist this NFT
      </button>
    </div>
  )
}

const BuyNftComponent = ({
  computer,
  smartObject,
  setFunctionResult
}: {
  computer: Computer
  smartObject: NFT
  setFunctionResult: any
}) => {
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  return (
    <div className="flex">
      <button
        type="button"
        onClick={async () => {
          try {
            showLoader(true)
            const nftAmount = await BuyNFT({ computer, nft: smartObject, setFunctionResult })
            showSnackBar(`You bought this NFT for ${nftAmount / 1e8} ${computer.getChain()}`, true)
            showLoader(false)
          } catch (error) {
            showLoader(false)
            showSnackBar("Failed to buy nft", false)
          }
        }}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Buy this NFT
      </button>
    </div>
  )
}

function showCreateOffer(computer: Computer, smartObject: NFT) {
  return smartObject && smartObject._owners[0] === computer.getPublicKey()
}

function showBuyOffer(computer: Computer, smartObject: NFT) {
  return smartObject && smartObject._owners[0] !== computer.getPublicKey() && smartObject.offerTxRev
}

function SuccessContent(rev: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div>
          You bought this NFT{" "}
          <Link
            to={`/objects/${rev}`}
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

function NftView() {
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const [rev] = useState(params.rev || "")
  const computer = useContext(ComputerContext)
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [functionResult, setFunctionResult] = useState<any>({})

  useEffect(() => {
    const fetch = async () => {
      try {
        showLoader(true)
        const synced = await computer.sync(rev)
        console.log({ synced })
        setSmartObject(synced)
        showLoader(false)
      } catch (error) {
        showLoader(false)
        showSnackBar("Not a valid NFT rev", false)
      }
    }
    fetch()
  }, [computer, rev, location, navigate])

  return (
    <>
      <div>
        <SmartObjectValues smartObject={smartObject} />
        {smartObject && smartObject.offerTxRev && (
          <ShowSaleOfferComponent computer={computer} nft={smartObject} />
        )}
        {showCreateOffer(computer, smartObject) && !smartObject.offerTxRev && (
          <CreateSellOfferComponent computer={computer} smartObject={smartObject} />
        )}
        {showCreateOffer(computer, smartObject) && smartObject.offerTxRev && (
          <UnlistNftComponent smartObject={smartObject} />
        )}
        {showBuyOffer(computer, smartObject) && (
          <BuyNftComponent
            computer={computer}
            smartObject={smartObject}
            setFunctionResult={setFunctionResult}
          />
        )}
        <Modal.Component
          title={"Success"}
          content={SuccessContent}
          contentData={functionResult}
          id={modalId}
        />
      </div>
    </>
  )
}

export { NftView }
