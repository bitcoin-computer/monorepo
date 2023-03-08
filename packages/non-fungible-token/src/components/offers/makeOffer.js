import React, { useState } from "react"

function MakeOffer({
  computer,
  nft,
  paymentModSpec,
  offerModSpec,
}) {
  const [amount, setAmount] = useState(0.1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await computer.send(amount * 1e8, computer.getAddress())
    // Create a payment owned by buyer
    const paymentTx = await computer.encode({
      exp: `new Payment('${computer.getPublicKey()}', ${amount * 1e8})`,
      mod: paymentModSpec
    })
    await computer.fund(paymentTx)
    await computer.sign(paymentTx)
    const paymentTxId = await computer.broadcast(paymentTx)
    const payment = await computer.sync(`${paymentTxId}:0`)
    console.log('Created payment', payment)

    // Build the swap transaction
    const swapTx = await computer.encodeCall({
      target: nft,
      property: 'sell',
      args: [payment]
    })

    await computer.fund(swapTx)
    computer.sign(swapTx)
    console.log('Partially signed swap tx', swapTx)

    // Build the offer transaction to send swap transaction to seller
    const swapTxJson = swapTx.toObject(true)
    const swapTxString = JSON.stringify(swapTxJson)
    const offerTx = await computer.encode({
      exp: `new Offer('${nft.title}', ${amount * 1e8}, '${nft._owners[0]}', '${swapTxString}')`,
      mod: offerModSpec
    })
    const exclude = await computer.getUtxos(swapTx)
    await computer.fund(offerTx, { exclude })
    await computer.sign(offerTx)
    const offerTxId = await computer.broadcast(offerTx)
    const offer = await computer.sync(`${offerTxId}:0`)
    console.log('Sent offer', offer)
  }

  return (<>
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
  </>)
}

export default MakeOffer
