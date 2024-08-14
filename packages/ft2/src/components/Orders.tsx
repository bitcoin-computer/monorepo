import { OfferHelper, PaymentMock, SaleHelper } from "@bitcoin-computer/swap"
import { ComputerContext, Gallery } from "@bitcoin-computer/components"
import { useContext, useState } from "react"
import { REACT_APP_OFFER_MOD_SPEC, REACT_APP_SALE_MOD_SPEC } from "../constants/modSpecs"

export function MyOrders({ publicKey }: { publicKey: string }) {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My Sell Orders</h2>
      <Gallery.WithPagination mod={REACT_APP_OFFER_MOD_SPEC} publicKey={publicKey} />
    </>
  )
}

export function AllOrders() {
  return (
    <div>
      <h2 className="text-4xl font-bold dark:text-white">All Sell Orders</h2>
      <Gallery.WithPagination mod={REACT_APP_OFFER_MOD_SPEC} />
    </div>
  )
}

export default function Orders() {
  const computer = useContext(ComputerContext)
  const saleHelper = new SaleHelper(computer, REACT_APP_SALE_MOD_SPEC)
  const offerHelper = new OfferHelper(computer, REACT_APP_OFFER_MOD_SPEC)
  const [rev, setRev] = useState('')
  const [amount, setAmount] = useState('')

  const onClick = async (e: any) => {
    e.preventDefault()
    const mock = new PaymentMock(parseInt(amount, 10) * 1e8)
    const publicKey = computer.getPublicKey()
    const url = computer.getUrl()
    const { tx: saleTx } = await saleHelper.createSaleTx({ _rev: rev }, mock)
    const { tx: offerTx } = await offerHelper.createOfferTx(publicKey, url, saleTx)
    const offerTxId = await computer.broadcast(offerTx)
    console.log('created offer', offerTxId, offerHelper.mod, REACT_APP_OFFER_MOD_SPEC)
  }

  return (<div>
    <form>
      <div className="mb-5">
        <label htmlFor="revision" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Revision
        </label>
        <input value={rev} onChange={(e) => { setRev(e.target.value) }} type="string" id="revision" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
      </div>
      <div className="mb-5">
        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Amount
        </label>
        <input value={amount} onChange={(e) => { setAmount(e.target.value) }} type="number" id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
      </div>
      <button onClick={onClick} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Create Sell Order
      </button>
    </form>
    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
    <AllOrders />
    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
    <MyOrders publicKey={computer.getPublicKey()} />
  </div>
  )
}