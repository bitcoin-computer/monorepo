import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Loader from "../util/loader"
import { Computer } from "@bitcoin-computer/lib"

function ArtworkDetails({ computer, nftModSpec, paymentModSpec, offerModSpec }) {
  const navigate = useNavigate()
  let params = useParams()
  const [artwork, setArtwork] = useState({})
  const [txnId] = useState(params.txnId)
  const [outNum] = useState(params.outNum)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(0.1)

  useEffect(() => {
    (async () => {
      if (computer) {
        try {
          const artwork = await computer.sync(`${txnId}/${outNum}`)
          console.log('Synced to artwork')
          setArtwork(artwork)
          setLoading(false)
        } catch (error) {
          console.log(error)
        }
      }
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const target = await computer.sync(artwork._rev)

    console.log(`Creating the payment`)
    // broadcast the payment
    const paymentTx = await computer.encode({
      exp: `new Payment('${artwork._owners[0]}', ${amount*1e8})`, mod: paymentModSpec })
    await computer.fund(paymentTx)
    await computer.sign(paymentTx)
    const paymentTxId = await computer.broadcast(paymentTx)
    const payment = await computer.sync(`${paymentTxId}/0`)
    console.log('Created payment', payment)

    // build the swap transaction
    const txB = await computer.encodeCall({
      target,
      property: "sell",
      args: [payment]
    })
    await computer.fund(txB)
    await computer.sign(txB)
    console.log('Partially signed swap tx', txB)

    // build the offer transaction
    const txJsonB = txB.toObject(true);
    const txStringB = JSON.stringify(txJsonB);
    const txOfferB = await computer.encode({ exp: `new Offer('${txStringB}', '${artwork._owners[0]}', 'https://node.bitcoincomputer.io')`, mod: offerModSpec })


    for(let tries = 0; tries < 3; tries++) {
      try { 
        await computer.fund(txOfferB, { exclude: await computer.getUtxos(txB) });
        break
      } catch (error) {
        // prepare the utxo set
        await computer.send(70000, computer.getAddress())
        console.log(`Retrying funding the offer transaction...`)
      }
    }

    await computer.sign(txOfferB);
    const offerTxId = await computer.broadcast(txOfferB);
    console.log('broadcasted offer', offerTxId)
    const offer = await computer.sync(`${offerTxId}/0`);
    console.log('Sent offer', offer)
  };

  return (
    <div className="mt-36 pl-36">
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="mb-4">
          <p className="text-gray-400 text-xs pb-2">
            {txnId}/{outNum}
          </p>
          <h1 className="text-5xl font-extrabold dark:text-white">
            {artwork.title}
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full">
            {loading ? <Loader /> : <img
              className="w-full h-auto"
              src={artwork.url || artwork.imageUrl}
              alt={artwork.title}
            />}
          </div>
          <div className="h-96 pr-32">
            <div className="space-y-2">
              <p className="text-gray-400 text-xs">Artist</p>
              <h2 className="text-4xl font-bold dark:text-white">
                {artwork.artist}
              </h2>
              <h4 className="text-2xl font-bold dark:text-white pt-16">
                Make an Offer
              </h4>
              <form>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    required
                  />
                  <label
                    htmlFor="amount"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Amount in LTC
                  </label>
                </div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtworkDetails
