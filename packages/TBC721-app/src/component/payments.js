import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'

function Payments({ computer, paymentModSpec }) {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])

  useEffect(() => {
    if (!computer) navigate('/')

    console.log('paymentModSpec in payment', paymentModSpec)

    const fetch =  async () => {
      const revs = await computer.query({
        mod: paymentModSpec,
        publicKey: computer.getPublicKey()
      })
      setPayments(await Promise.all(revs.map(rev => computer.sync(rev))))
    }
    fetch()
  }, [navigate])

  useEffect(() => console.log('Payments', payments), [payments])

  return (
    <div className="relative overflow-x-auto mt-48">
      <h2 className="text-4xl font-extrabold dark:text-white mb-4">Payments</h2>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Artwork
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => {
            return (
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  Todo
                </th>
                <td className="px-6 py-4">
                  {payment._amount/1e8}
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
