import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
// import { Bitcore } from 'litecore-lib'

function Payments({ computer, offerModSpec }) {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])

  useEffect(() => {
    if (!computer) navigate('/')

    console.log('offerModSpec in offer', offerModSpec)

    const fetch =  async () => {
      const revs = await computer.query({
        mod: offerModSpec,
        publicKey: computer.getPublicKey()
      })
      setOffers(await Promise.all(revs.map(rev => computer.sync(rev))))
    }
    fetch()
  }, [navigate])

  useEffect(() => console.log('Offers', offers), [offers])

  const handleAccept = (offer) =>
  async (evt) => {
    evt.preventDefault()

    const txA = await computer.txFromJSON({ json: JSON.parse(offer.tx) })

    // computer.sign(txA)
    const txId2 = await computer.broadcast(txA)

    console.log('Accepted offer', txId2)
  }

  return (
    <div className="relative overflow-x-auto mt-48">
      <h2 className="text-4xl font-extrabold dark:text-white mb-4">Offers</h2>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Artwork
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {offers.map(offer => {
            return (
              <tr key={offer._rev} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  Todo
                </th>
                <td className="px-6 py-4">
                  {offer._amount/1e8}
                </td>
                <td className="px-6 py-4 text-left">
                  <a href='#' onClick={handleAccept(offer)}>accept</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

)
}

export default Payments
