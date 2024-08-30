import { Computer, Transaction } from "@bitcoin-computer/lib"
import { BuyHelper, Offer, OfferHelper } from "@bitcoin-computer/swap"
import { Token } from "@bitcoin-computer/TBC20"
import { useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import { REACT_APP_BUY_MOD_SPEC, REACT_APP_OFFER_MOD_SPEC, REACT_APP_SWAP_MOD_SPEC, REACT_APP_TOKEN_MOD_SPEC } from "../constants/modSpecs"

function ActionButton({ computer, buy }: { computer: Computer, buy: any }) {
  const [tx, setTx] = useState<Transaction>()
  
  async function onClick() {
    const buyHelper = new BuyHelper(computer, REACT_APP_SWAP_MOD_SPEC!, REACT_APP_BUY_MOD_SPEC)
    const offerHelper = new OfferHelper(computer, REACT_APP_OFFER_MOD_SPEC)
    if (tx === undefined) {
      // Find my tokens that match the offer
      const revs = await computer.query({ mod: REACT_APP_TOKEN_MOD_SPEC, publicKey: computer.getPublicKey() })
      const tokens = await Promise.all(revs.map((rev) => computer.sync(rev))) as Token[]
      const matches = tokens.filter((token: Token) => token.amount === buy.amount)
      
      // If a match is found, make an offer
      if (matches.length === 0) console.log('No matches found')
      const { tx: swapTx } = await buyHelper.acceptBuyOrder(matches[0], buy)
      const { tx: offerTx } = await offerHelper.createOfferTx(buy._owners[0], computer.getUrl(), swapTx)
      const txId = await computer.broadcast(offerTx)
      console.log('broadcast offer tx', txId)
    } else {
      const txId = await buyHelper.settleBuyOrder(tx)
      console.log('Closed buy', txId)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      // Look for an acceptable offer
      const revs = await computer.query({ mod: REACT_APP_OFFER_MOD_SPEC, publicKey: buy && buy._owners ? buy._owners[0] : '' })
      const offers = await Promise.all(revs.map((rev) => computer.sync(rev))) as Offer[]
      const hexes = offers.map((s) => s.txHex)
      const transactions = hexes.map((t) => Transaction.deserialize(t)) 
      const decoded = await Promise.all(transactions.map((t) => computer.decode(t)))
      const index = decoded.findIndex((d) => d.env.a === buy.tokenRoot)
      setTx(transactions[index])
    }
    fetch()
  }, [computer, buy])

  return <button type="button" onClick={onClick} className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
    {tx ? 'Close' : 'Sell'}
  </button>
}

function BuyOrderRow({ rev, computer }: { rev: string, computer: Computer }) {
  const [open, setOpen] = useState(false)
  const [buy, setBuy] = useState({ _amount: 0, amount: 0, tokenRoot: '' } as any)

  const fetch = async () => {
    setBuy(await computer.sync(rev))
  }

  useEffect(() => {
    fetch()
  }, [computer])

  useEffect(() => {
    (async () => {
      if (buy._id) {
        const [txId, outNum] = buy._id.split(':')
        const { result } = await computer.rpcCall('gettxout', `${txId} ${outNum} true`)
        setOpen(!!result)
      }
    })()
  }, [computer, buy])

  return open ?
    (<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
          {buy._amount/1e8}
      </td>
      <td className="px-6 py-4">{buy.amount}</td>
      <td className="px-6 py-4">{`...${buy.tokenRoot.slice(-12)}`}</td>
      <td className="px-6 py-4">
        <ActionButton computer={computer} buy={buy} />
      </td>
      <td className="px-6 py-4">
        <HiRefresh
            onClick={fetch}
            className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
          />
        </td>
    </tr>
  )
  : <></>
}

export function BuyOrders({ computer }: { computer: Computer }) {
  const [revs, setRevs] = useState([] as string[])

  const fetch = async () => {
    setRevs(await computer.query({ mod: REACT_APP_BUY_MOD_SPEC }))
  }

  useEffect(() => {
    fetch()
  }, [computer])

  return (<div className="mt-4 relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Price</th>
            <th scope="col" className="px-6 py-3">Amount</th>
            <th scope="col" className="px-6 py-3">TokenRoot</th>
            <th scope="col" className="px-6 py-3">Sell</th>
            <th scope="col" className="px-6 py-3">
              <HiRefresh
                onClick={fetch}
                className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {revs.map((rev) => <BuyOrderRow key={rev} rev={rev} computer={computer} />)}
        </tbody>
      </table> 
    </div>)
}

export function BuyOrderForm({ computer }: { computer: Computer }) {
  const [price, setPrice] = useState('1')
  const [amount, setAmount] = useState('100')
  const [root, setRoot] = useState('')
  
  const onClick = async (e: any) => {
    e.preventDefault()
    const buyHelper = new BuyHelper(computer, REACT_APP_SWAP_MOD_SPEC!, REACT_APP_BUY_MOD_SPEC)
    const buyOrder = await buyHelper.broadcastBuyOrder(
      parseFloat(price) * 1e8, 
      parseInt(amount, 10), 
      root
    )
    console.log('Created buy order', buyOrder)
  }

  return <form>
    <div className="mb-5">
      <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Root
      </label>
      <input value={root} onChange={(e) => { setRoot(e.target.value) }} type="string" id="root" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    </div>
    <div className="mb-5">
      <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Amount
      </label>
      <input value={amount} onChange={(e) => { setAmount(e.target.value) }} type="number" id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    </div>
    <div className="mb-5">
      <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Price
      </label>
      <input value={price} onChange={(e) => { setPrice(e.target.value) }} type="number" id="revision" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    </div>
    <button onClick={onClick} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
      Create Buy Order
    </button>
  </form>
}