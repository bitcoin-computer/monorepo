import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PaymentRow from "./paymentRow"

function Payments({ computer, paymentModSpec }) {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [paymentRevs, setPaymentRevs] = useState([])

  useEffect(() => {
    if (!computer) navigate("/")

    const fetch = async () => {
      const mod = paymentModSpec
      const publicKey = computer.getPublicKey()
      setPaymentRevs(await computer.query({ mod, publicKey }))
    }
    fetch()
  }, [navigate, computer, paymentModSpec])

  useEffect(() => console.log("Payments", payments), [payments])

  return (
    <div className="m-16 relative overflow-x-auto">
      <h2 className="text-4xl font-extrabold dark:text-white mb-4">Offers Sent</h2>
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
          {paymentRevs.map((paymentRev) => <PaymentRow computer={computer} paymentRev={paymentRev} key={paymentRev}/>)}
        </tbody>
      </table>
    </div>
  )
}

export default Payments
