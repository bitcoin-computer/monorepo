import { off } from "process"
import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import OfferRow from "./offerRow"

function Payments({ computer, offerModSpec }) {
  const navigate = useNavigate()
  const [offerRevs, setOfferRevs] = useState([])

  useEffect(() => {
    if (!computer) navigate('/')
    const fetch =  async () => {
      const mod = offerModSpec
      const publicKey = computer.getPublicKey()
      setOfferRevs(await computer.query({ mod, publicKey }))
      }
      fetch()
  }, [navigate, computer, offerModSpec])

  return (
    <div className="m-16 relative overflow-x-auto">
      <h2 className="text-4xl font-extrabold dark:text-white mb-4">Offers</h2>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              NFT
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
            <th scope="col" className="px-6 py-3">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {offerRevs.map(offerRev => <OfferRow computer={computer} offerRev={offerRev} />)}
        </tbody>
      </table>
    </div>
)
}

export default Payments
