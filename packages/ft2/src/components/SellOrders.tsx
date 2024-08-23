import { Computer, Transaction } from "@bitcoin-computer/lib"
import { OfferHelper, PaymentMock, SaleHelper, Payment } from "@bitcoin-computer/swap"
import { useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import { REACT_APP_OFFER_MOD_SPEC, REACT_APP_SALE_MOD_SPEC } from "../constants/modSpecs"

function BuyButton({ computer, deserialized, price }: { computer: Computer, deserialized: any, price: number }) {
  async function onClick() {
    const payment = await computer.new(Payment, [price])
    const finalTx = SaleHelper.finalizeSaleTx(deserialized, payment, computer.toScriptPubKey()!)
    await computer.fund(finalTx)
    await computer.sign(finalTx)
    const txId = await computer.broadcast(finalTx)
    console.log('broadcast swap transaction', txId)
  }

  return <button type="button" onClick={onClick} className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
    Buy
  </button>
}

function SellOrderRow({ rev, computer }: { rev: string, computer: Computer }) {
  const saleHelper = new SaleHelper(computer, REACT_APP_SALE_MOD_SPEC)
  const [price, setPrice] = useState(0)
  const [available, setAvailable] = useState(0)
  const [name, setName] = useState(0)
  const [symbol, setSymbol] = useState(0)
  const [deserialized, setDeserialized] = useState(new Transaction()) 

  const fetch = async () => {
    const { txHex } = await computer.sync(rev) as { txHex: any }
    const d = Transaction.deserialize(txHex)
    setDeserialized(d)
    setPrice(await saleHelper.checkSaleTx(d))
    const { env } = await computer.decode(d)
    const object = await computer.sync(env.o) as any
    setName(object.name)
    setSymbol(object.symbol)
    setAvailable(object.tokens)
  }

  useEffect(() => {
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
    <BuyButton computer={computer} deserialized={deserialized} price={price} />
    </td>
    <td className="px-6 py-4">
      <HiRefresh
        onClick={fetch}
        className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
        />
    </td>
  </tr>)
}

function SellOrderTable({ computer }: { computer: Computer }) {
  const [revs, setRevs] = useState([] as string[])
  const saleHelper = new SaleHelper(computer, REACT_APP_SALE_MOD_SPEC)

  const fetch = async () => {
    const r = await computer.query({ mod: REACT_APP_OFFER_MOD_SPEC })
    const results = await Promise.all(r.map(async (rev) => {
      const { txHex } = await computer.sync(rev) as { txHex: any }
      const d = Transaction.deserialize(txHex)
      try {
        return await saleHelper.checkSaleTx(d)
      } catch(err) {
        if (err instanceof Error && err.message === 'Unexpected expression')
          return false
        throw err
      }
    }))
    setRevs(r.filter((_, i) => results[i]))
  }

  useEffect(() => {
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
        <th scope="col" className="px-6 py-3">
          <HiRefresh
            onClick={fetch}
            className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {revs.map((rev) => <SellOrderRow rev={rev} computer={computer} />)}
    </tbody>
  </table>
  )
}

export function SellOrders({ computer }: { computer: Computer }) {
  return (<div className="mt-4 relative overflow-x-auto">
    <SellOrderTable computer={computer}/> 
  </div>)
}

export function SellOrderForm({ computer }: { computer: Computer }) {
  const [rev, setRev] = useState('')
  const [amount, setAmount] = useState('')
  const saleHelper = new SaleHelper(computer, REACT_APP_SALE_MOD_SPEC)
  const offerHelper = new OfferHelper(computer, REACT_APP_OFFER_MOD_SPEC)

  const onClick = async (e: any) => {
    e.preventDefault()
    const mock = new PaymentMock(parseFloat(amount) * 1e8)
    const publicKey = computer.getPublicKey()
    const url = computer.getUrl()
    const { tx: saleTx } = await saleHelper.createSaleTx({ _rev: rev }, mock)
    const { tx: offerTx } = await offerHelper.createOfferTx(publicKey, url, saleTx)
    await computer.broadcast(offerTx)
    console.log('created offer tx', offerTx.getId())
  }

  return <form>
    <div className="mb-5">
      <label htmlFor="revision" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Revision
      </label>
      <input value={rev} onChange={(e) => { setRev(e.target.value) }} type="string" id="revision" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    </div>
    <div className="mb-5">
      <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Price
      </label>
      <input value={amount} onChange={(e) => { setAmount(e.target.value) }} type="number" id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    </div>
    <button onClick={onClick} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
      Create Sell Order
    </button>
  </form>
}