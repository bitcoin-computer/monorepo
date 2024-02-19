import React, { useState, useEffect } from "react"
import { Link } from 'react-router-dom';

function PaymentRow({ computer, paymentRev }) {
  const [payment, setPayment] = useState(null)
  const [nft, setNft] = useState(null)

  // Fetch the payment
  useEffect(() => {
    const fetch = async () => {
      setPayment(await computer.sync(paymentRev))
    }
    fetch()
  }, [])

  useEffect(() => {
    if(!payment) return
    const fetch = async () => {
      setNft(await computer.sync(payment.nftRev))
    }
    fetch()
  }, [payment])

  const NftTitle = () => {
    if(!nft && !payment) return <span>Loading...</span>
    if(!nft && payment) return <a href={`/art/${payment.nftRev}`}>Loading...</a>
    return <Link to={payment.nftRev}>{nft.title}</Link>
  }

  return (<>
    <tr key={paymentRev} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        <NftTitle />
      </th>
      <td className="px-6 py-4">
        {payment ? payment._amount / 1e8 : 'Loading...'}
      </td>
      <td className="px-6 py-4">
        <Link to={`/payment/${paymentRev}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">show</Link>
      </td>
    </tr>
  </>)
}

export default PaymentRow
