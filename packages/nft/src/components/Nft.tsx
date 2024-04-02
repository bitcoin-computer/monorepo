import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import reactStringReplace from "react-string-replace"
import {
  Auth,
  Card,
  toObject,
  capitalizeFirstLetter,
  Modal,
  UtilsContext,
} from "@bitcoin-computer/components"
import { Computer } from "@bitcoin-computer/lib"
import { PaymentMock } from "@bitcoin-computer/swap"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]
const modalId = "smart-object-info-modal"

const CreateSellOffer = ({ computer, amount }: { computer: Computer; amount: string }) => {
  console.log(computer, amount, typeof amount)
  // console.log(computer.getPublicKey())
  const mock = new PaymentMock(computer.getPublicKey(), parseFloat(amount))
  // console.log(mock)
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
        .filter(([k]) => !keywords.includes(k))
        .map(([key, value], i) => (
          <div key={i} className="sm:w-full">
            <h3 className="mt-2 text-xl font-bold dark:text-white">{capitalizeFirstLetter(key)}</h3>
            <ObjectValueCard content={toObject(value)} />
          </div>
        ))}
    </>
  )
}

const CreateSellOfferComponent = ({ computer }: any) => {
  const [amount, setAmount] = useState<string>("")
  const { showSnackBar } = UtilsContext.useUtilsComponents()

  return (
    <div className="flex">
      <input
        type="number"
        id={`list-for-sale`}
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value)
        }}
        className="flex-1 sm:w-full md:w-2/3 lg:w-1/2 mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Amount"
        required
      />
      <button
        type="button"
        onClick={(e) => {
          if (!amount) {
            showSnackBar("Provide valid amount", false)
          }
          CreateSellOffer({ computer, amount })
        }}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        List for Sale
      </button>
    </div>
  )
}

function SuccessContent(rev: string) {
  return (
    <>
      <div className="p-4 md:p-5">
        <div>
          You created a{" "}
          <Link
            to={`/objects/${rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal("success-modal")
            }}
          >
            nft
          </Link>
        </div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => Modal.hideModal("success-modal")}
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
  const [computer] = useState(Auth.getComputer())
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [functionResult, setFunctionResult] = useState<any>({})

  useEffect(() => {
    const fetch = async () => {
      try {
        showLoader(true)
        const synced = await computer.sync(rev)
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
        <CreateSellOfferComponent computer={computer} />
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
