import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Button from "../util/button"

function Payment({ computer }) {
  let params = useParams()
  const [paymentRev] = useState(params.rev)
  const [paymentNotFound, setPaymentNotFound] = useState(null)
  const [payment, setPayment] = useState(null)
  const [paymentDeleted, setPaymentDeleted] = useState(null)
  const [paymentUnspent, setPaymentUnspent] = useState(null)

  // Fetch the payment
  useEffect(() => {
    const fetch = async () => {
      if (!paymentRev) return
      try {
        setPayment(await computer.sync(paymentRev))
      } catch {
        setPaymentNotFound(true)
      }
    }
    fetch()
  }, [])

  // Check payment status
  useEffect(() => {
    const fetch = async () => {
      if (!payment?._id) return
      const [rev] = await computer.idsToRevs([payment._id])
      setPaymentDeleted(!rev)
      setPaymentUnspent(rev === paymentRev)
    }
    fetch()
  }, [payment])

  const handleAcceptPayment = async (evt) => {
    // evt.preventDefault()
    // try {
    //   computer.sign(swapTx)
    //   const offerTxId = await computer.broadcast(swapTx)
    //   console.log('Accepted offer', offerTxId)
    // } catch (e) {
    //   console.log('Error accepting offer', e.message)
    // } finally {
    //   window.location.reload()
    // }
  }

  const handleDeletePayment = async (evt) => {
    // evt.preventDefault()
    // try {
    //   const txId = await computer.delete([offerRev])
    //   console.log('Deleted offer', txId)
    // } catch (e) {
    //   console.log('Error deleting offer', e.message)
    // } finally {
    //   window.location.reload()
    // }
  }

  const getStatus = () => {
    // if (validating) return 'Validating...'

    if (paymentNotFound) return 'Payment not found'
    if (paymentDeleted) return 'Offer deleted by buyer'
    if (!paymentUnspent) return 'Offer withdrawn by buyer'

    return 'Active'
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    const txId = await computer.delete([paymentRev])
    console.log('Withdrawn to address', computer.getPublicKey(), 'tx id', txId)
  }

  if (paymentNotFound) return (<div className="m-16">
    <h2 className="text-4xl font-bold dark:text-white">Payment not found</h2>
  </div>)

  return (<div className="m-16">
    <h2 className="text-4xl font-bold dark:text-white">Offer Sent</h2>
    <dl className="py-8 max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div className="flex flex-col pb-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Amount</dt>
        <dd className="text-lg font-semibold">{payment ? payment._amount / 1e8 : 'Validating...'}</dd>
      </div>
      <div className="flex flex-col py-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Nft Rev</dt>
        <dd className="text-lg font-semibold">{payment ? payment.nftRev : 'Validating...'}</dd>
      </div>
    </dl>

    <Button color='blue' onClick={handleWithdraw}>Withdraw</Button>
  </div>)
}

export default Payment
