import React, { useState, useEffect } from "react"
import { Link } from 'react-router-dom';

function OfferRow({ computer, offerRev }) {
  const [offer, setOffer] = useState({})
  const [swapTx, setSwapTx] = useState({})
  const [nftRev, setNftRev] = useState('Loading')

  // Fetch the offer
  useEffect(() => {
    const fetch = async () => {
      setOffer(await computer.sync(offerRev))
    }
    fetch()
  }, [])

  // Parse swapTx from offer
  useEffect(() => {
    const fetch = async () => {
      if(!offer?.swapTx) return
      const swapTxJson = JSON.parse(offer.swapTx)
      setSwapTx(await computer.txFromJSON({ json: swapTxJson }))
    }
    fetch()
  }, [offer])

  // Decode the swapTx to get the nftRev
  useEffect(() => {
    const fetch = async () => {
      if(!swapTx?.inputs) return
      const { env } = await computer.decode(swapTx)
      const nftRev = env.__bc__
      if (nftRev !== undefined) setNftRev(nftRev)
    }
    fetch()
  }, [swapTx])

return (<>
    <tr key={offerRev} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        <Link to={`/art/${nftRev}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{offer.title}</Link>
      </th>
      <td className="px-6 py-4">
        {String(offer.amount / 1e8)}
      </td>
      <td className="px-6 py-4">
        <Link to={`/offer/${offerRev}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">show</Link>
      </td>
    </tr>
  </>)
}

export default OfferRow
