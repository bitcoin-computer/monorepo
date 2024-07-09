import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import reactStringReplace from "react-string-replace"
import {
  Card,
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

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]
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
  // const payment = await computer.new(Payment, [nftAmount], paymentModSpec)
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

function ObjectValueCard({ content }: { content: string }) {
  const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g
  const revLink = (rev: string, i: number) => (
    <Link
      key={i}
      to={`/objects/${rev}`}
      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      {rev}
    </Link>
  )
  const formattedContent = reactStringReplace(content, isRev, revLink)

  return <Card content={formattedContent} />
}

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return <></>
  return (
    <>
      {Object.entries(smartObject)
        .filter(([k, v]) => v !== undefined && !keywords.includes(k))
        .map(([key, value], i) => (
          <div key={i} className="sm:w-full">
            <h3 className="mt-2 text-xl font-bold dark:text-white">{capitalizeFirstLetter(key)}</h3>
            <ObjectValueCard content={toObject(value)} />
          </div>
        ))}
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
              showLoader(false)
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
          <h3 className="mt-2 text-xl font-bold dark:text-white">
            NFT Listed At ({computer.getChain()})
          </h3>
          <ObjectValueCard content={toObject(nftAmount / 1e8)} />
        </div>
      )}
    </>
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
            await BuyNFT({ computer, nft: smartObject, setFunctionResult })
            showLoader(false)
          } catch (error) {
            showLoader(false)
            console.log(error)
            showSnackBar("Failed to buy nft", false)
          }
        }}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Buy
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
        {showCreateOffer(computer, smartObject) && (
          <CreateSellOfferComponent computer={computer} smartObject={smartObject} />
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
