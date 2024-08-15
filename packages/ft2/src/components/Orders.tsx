import { Computer, Transaction } from "@bitcoin-computer/lib"
import { OfferHelper, PaymentMock, SaleHelper } from "@bitcoin-computer/swap"
import { ComputerContext } from "@bitcoin-computer/components"
import { useContext, useEffect, useState } from "react"
import { REACT_APP_OFFER_MOD_SPEC, REACT_APP_SALE_MOD_SPEC } from "../constants/modSpecs"

function SellOrderRow({ rev, computer }: { rev: string, computer: Computer }) {
  const saleHelper = new SaleHelper(computer, REACT_APP_SALE_MOD_SPEC)
  const [price, setPrice] = useState(0)
  const [available, setAvailable] = useState(0)
  const [name, setName] = useState(0)
  const [symbol, setSymbol] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      const { txHex } = await computer.sync(rev) as { txHex: any }
      const deserialized = Transaction.deserialize(txHex)
      setPrice(await saleHelper.checkSaleTx(deserialized))
      const { env } = await computer.decode(deserialized)
      const objectRev = env.o
      const object = await computer.sync(objectRev) as any
      setName(object.name)
      setSymbol(object.symbol)
      setAvailable(object.tokens)
    }
    fetch()
  }, [computer])

  return (<tr key={rev} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        {name}
    </th>
    <td className="px-6 py-4">
        {symbol}
    </td>
    <td className="px-6 py-4">
        {price/1e8}
    </td>
    <td className="px-6 py-4">
        {available}
    </td>
    <td className="px-6 py-4">
        
    </td>
  </tr>)
}

function SellOrderTable({ computer }: { computer: Computer }) {
  const [revs, setRevs] = useState([] as string[])

  useEffect(() => {
    const fetch = async () => {
      setRevs(await computer.query({ mod: REACT_APP_OFFER_MOD_SPEC }))
    }
    fetch()
  }, [computer])

  return (<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr>
        <th scope="col" className="px-6 py-3">Name</th>
        <th scope="col" className="px-6 py-3">Symbol</th>
        <th scope="col" className="px-6 py-3">Price</th>
        <th scope="col" className="px-6 py-3">Available</th>
        <th scope="col" className="px-6 py-3">Buy</th>
      </tr>
    </thead>
    <tbody>
      {revs.map((rev) => <SellOrderRow rev={rev} computer={computer} />)}
    </tbody>
  </table>
  )
}

export function AllOrders({ computer }: { computer: Computer }) {
  return (
    <div>
      <h2 className="text-4xl font-bold dark:text-white">All Sell Orders</h2>
      <div className="mt-4 relative overflow-x-auto">
        <SellOrderTable computer={computer}/> 
      </div>
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
    await computer.broadcast(offerTx)
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
    <AllOrders computer={computer} />
  </div>
  )
}