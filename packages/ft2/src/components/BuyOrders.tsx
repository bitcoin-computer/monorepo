import { Computer, Transaction } from "@bitcoin-computer/lib"
import { Buy, BuyHelper, Offer, OfferHelper } from "@bitcoin-computer/swap"
import { Token } from "@bitcoin-computer/TBC20"
import { useEffect, useState } from "react"
import { HiRefresh } from "react-icons/hi"
import {
  VITE_BUY_MOD_SPEC,
  VITE_OFFER_MOD_SPEC,
  VITE_SWAP_MOD_SPEC,
  VITE_TOKEN_MOD_SPEC
} from "../constants/modSpecs"

function CloseButton({ swapTx, computer }: { swapTx: Transaction; computer: Computer }) {
  async function onClick() {
    const buyHelper = new BuyHelper(computer, VITE_SWAP_MOD_SPEC!, VITE_BUY_MOD_SPEC)
    const txId = await buyHelper.settleBuyOrder(swapTx)
    console.log("Closed buy", txId.slice(-6))
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      Close
    </button>
  )
}

function SellButton({ buy, computer }: { buy: Buy; computer: Computer }) {
  const buyHelper = new BuyHelper(computer, VITE_SWAP_MOD_SPEC!, VITE_BUY_MOD_SPEC)
  const offerHelper = new OfferHelper(computer, VITE_OFFER_MOD_SPEC)

  async function onClick() {
    // Find owned tokens that match the offer
    const tokenRevs = await computer.query({
      mod: VITE_TOKEN_MOD_SPEC,
      publicKey: computer.getPublicKey()
    })
    const tokens = (await Promise.all(tokenRevs.map((rev) => computer.sync(rev)))) as Token[]
    const matches = tokens.filter((token: Token) => token.amount === buy.amount)

    // If a match is found, make an offer to sell
    if (matches.length) {
      const { tx: swapTx } = await buyHelper.acceptBuyOrder(matches[0], buy)
      const { tx: offerTx } = await offerHelper.createOfferTx(
        buy._owners[0],
        computer.getUrl(),
        swapTx
      )
      const txId = await computer.broadcast(offerTx)
      console.log("broadcast offer tx", txId.slice(-6))
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      Sell
    </button>
  )
}

function ActionButton({ computer, buy }: { computer: Computer; buy: any }) {
  const [swapTx, setSwapTx] = useState<Transaction>()

  useEffect(() => {
    const fetch = async () => {
      // Buyer looks for an acceptable swap for their offer in the buy object
      const revs = await computer.query({
        mod: VITE_OFFER_MOD_SPEC,
        publicKey: buy && buy._owners ? buy._owners[0] : ""
      })
      const offers = (await Promise.all(revs.map((rev) => computer.sync(rev)))) as Offer[]
      const swapHexes = offers.map((s) => s.txHex)
      const swapTxs = swapHexes.map((t) => Transaction.deserialize(t))
      const swaps = await Promise.all(swapTxs.map((t) => computer.decode(t)))

      const matchingSwapsIndex = await Promise.all(
        swaps.map(async (swap) => {
          const { a: tokenRev, b: buyRev } = swap.env
          if (buy._rev !== buyRev) return false
          const [txId, outNum] = tokenRev.split(":")
          const { result } = await computer.rpcCall("gettxout", `${txId} ${outNum} true`)
          if (!result) return false
          const token = (await computer.sync(tokenRev)) as any
          return buy.amount === token.amount
        })
      )
      const index = swaps.findIndex((swap, i) => matchingSwapsIndex[i])
      if (swapTxs[index]) setSwapTx(swapTxs[index])
    }
    fetch()
  }, [computer, buy])

  return swapTx ? (
    <CloseButton computer={computer} swapTx={swapTx} />
  ) : (
    <SellButton computer={computer} buy={buy} />
  )
}

function BuyOrderRow({ rev, computer }: { rev: string; computer: Computer }) {
  const [buy, setBuy] = useState({ _amount: 0, amount: 0, tokenRoot: "", open: false } as any)

  const fetch = async () => {
    setBuy(await computer.sync(rev))
  }

  useEffect(() => {
    fetch()
  }, [computer])

  if (!buy.open) return <></>
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td
        scope="row"
        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
      >
        {buy._amount / 1e8}
      </td>
      <td className="px-6 py-4">{buy.amount}</td>
      <td className="px-6 py-4">{`...${buy.tokenRoot.slice(-10)}`}</td>
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
}

export function BuyOrderTable({ computer }: { computer: Computer }) {
  const [offerRevs, setOfferRevs] = useState([] as string[])

  const fetch = async () => {
    setOfferRevs(await computer.query({ mod: VITE_BUY_MOD_SPEC }))
  }

  useEffect(() => {
    fetch()
  }, [computer])

  return (
    <div className="mt-4 relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Price
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
            <th scope="col" className="px-6 py-3">
              TokenRoot
            </th>
            <th scope="col" className="px-6 py-3">
              Sell
            </th>
            <th scope="col" className="px-6 py-3">
              <HiRefresh
                onClick={fetch}
                className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {offerRevs.map((rev) => (
            <BuyOrderRow key={rev} rev={rev} computer={computer} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BuyOrderForm({ computer }: { computer: Computer }) {
  const [price, setPrice] = useState("0.1")
  const [amount, setAmount] = useState("100")
  const [root, setRoot] = useState("")

  const onClick = async (e: any) => {
    e.preventDefault()
    const buyHelper = new BuyHelper(computer, VITE_SWAP_MOD_SPEC!, VITE_BUY_MOD_SPEC)
    const buy = await buyHelper.broadcastBuyOrder(
      parseFloat(price) * 1e8,
      parseInt(amount, 10),
      root
    )
    console.log(
      `Created buy offer ${buy._rev.slice(-6)}\nprice ${price}\namount ${amount}\nroot ${root.slice(-6)}`
    )
  }

  return (
    <form>
      <div className="mb-5">
        <label
          htmlFor="amount"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Root
        </label>
        <input
          value={root}
          onChange={(e) => {
            setRoot(e.target.value)
          }}
          type="string"
          id="root"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div className="mb-5">
        <label
          htmlFor="amount"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Amount
        </label>
        <input
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
          }}
          type="number"
          id="amount"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div className="mb-5">
        <label
          htmlFor="price"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Price
        </label>
        <input
          value={price}
          onChange={(e) => {
            setPrice(e.target.value)
          }}
          type="number"
          id="revision"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <button
        onClick={onClick}
        type="submit"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Create Buy Order
      </button>
    </form>
  )
}
