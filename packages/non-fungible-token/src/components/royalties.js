import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Royalties({ computer, royaltyModSpec }) {
  const navigate = useNavigate()
  const [royalties, setRoyalties] = useState([])

  useEffect(() => {
    if (!computer) {
      navigate("/")
    } else {
      const fetch = async () => {
        const revs = await computer.query({
          mod: royaltyModSpec,
          publicKey: computer.getPublicKey(),
        })
        setRoyalties(await Promise.all(revs.map((rev) => computer.sync(rev))))
      }
      fetch()
    }
  }, [navigate, computer, royaltyModSpec])

  useEffect(() => console.log("Royalties", royalties), [royalties])

  return (
    <div className="m-16 relative overflow-x-auto">
      <h2 className="text-4xl font-extrabold dark:text-white mb-4">Royalties</h2>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              NFT
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {royalties.map((royalty) => {
            return (
              <tr
                key={royalty._rev}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Todo
                </th>
                <td className="px-6 py-4">{royalty._amount / 1e8}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Royalties
