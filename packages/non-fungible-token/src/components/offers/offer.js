import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Button from "../util/button"

function OfferDetails ({ computer }) {
  let params = useParams()
  const [offerRev] = useState(params.rev)
  const [offerNotFound, setOfferNotFound] = useState(null)
  const [offer, setOffer] = useState(null)
  const [offerDeleted, setOfferDeleted] = useState(null)
  const [offerUnspent, setOfferUnspent] = useState(null)

  const [nftRev, setNftRev] = useState('')
  const [nftNotFound, setNftNotFound] = useState(null)
  const [nft, setNft] = useState(null)
  const [nftDeleted, setNftDeleted] = useState(null)
  const [nftUnspent, setNftUnspent] = useState(null)

  const [paymentRev, setPaymentRev] = useState('')
  const [paymentNotFound, setPaymentNotFound] = useState(null)
  const [payment, setPayment] = useState(null)
  const [paymentUnspent, setPaymentUnspent] = useState(null)
  const [paymentDeleted, setPaymentDeleted] = useState(null)

  const [swapTx, setSwapTx] = useState(null)

  // Fetch the offer
  useEffect(() => {
    const fetch = async () => {
      if (!offerRev) return
      try {
        setOffer(await computer.sync(offerRev))
      } catch {
        setOfferNotFound(true)
      }
    }
    fetch()
  }, [])

  // Check offer status
  useEffect(() => {
    const fetch = async () => {
      if (!offer?._id) return
      const [rev] = await computer.idsToRevs([offer._id])
      setOfferDeleted(!rev)
      setOfferUnspent(rev === offerRev)
    }
    fetch()
  }, [offer])

  // Parse swapTx from offer
  useEffect(() => {
    const fetch = async () => {
      if (!offer?.swapTx) return
      const json = JSON.parse(offer.swapTx)
      setSwapTx(await computer.txFromJSON({ json }))
    }
    fetch()
  }, [offer])

  // Decode the swapTx to get the nftRev and paymentRev
  useEffect(() => {
    const fetch = async () => {
      if (!swapTx?.inputs) return
      const { env } = await computer.decode(swapTx)
      const nftRev = env.__bc__
      if (nftRev !== undefined) setNftRev(nftRev)
      const paymentRev = env.__bc0__
      if (paymentRev !== undefined) setPaymentRev(paymentRev)
    }
    fetch()
  }, [swapTx])

  // Fetch the nft
  useEffect(() => {
    const fetch = async () => {
      if (!nftRev) return
      try {
        setNft(await computer.sync(nftRev))
      } catch {
        setNftNotFound(true)
      }
    }
    fetch()
  }, [nftRev])

  // Check nft status
  useEffect(() => {
    const fetch = async () => {
      if (!nft?._id) return
      const [rev] = await computer.idsToRevs([nft._id])
      setNftDeleted(!rev)
      setNftUnspent(rev === nftRev)
    }
    fetch()
  }, [nft, nftRev])

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
  }, [paymentRev])

  // Check payment status
  useEffect(() => {
    const fetch = async () => {
      if (!payment?._id) return
      const [rev] = await computer.idsToRevs([payment._id])
      setPaymentDeleted(!rev)
      setPaymentUnspent(rev === paymentRev)
    }
    fetch()
  }, [payment, paymentRev])

  const handleAcceptOffer = async (evt) => {
    evt.preventDefault()
    try {
      computer.sign(swapTx)
      const offerTxId = await computer.broadcast(swapTx)
      console.log('Accepted offer', offerTxId)
    } catch (e) {
      console.log('Error accepting offer', e.message)
    } finally {
      window.location.reload()
    }
  }

  const handleDeleteOffer = async (evt) => {
    evt.preventDefault()
    try {
      const txId = await computer.delete([offerRev])
      console.log('Deleted offer', txId)
    } catch (e) {
      console.log('Error deleting offer', e.message)
    } finally {
      window.location.reload()
    }
  }

  const validating = [offer, offerDeleted, offerUnspent,
    nft, nftDeleted, nftUnspent,
    payment, paymentDeleted, paymentUnspent].includes(null)

  const getStatus = () => {
    if (validating) return 'Validating...'

    if (offerNotFound) return 'Offer not found'
    if (offerDeleted) return 'Offer deleted by seller'
    if (!offerUnspent) return 'Offer withdrawn by seller'

    if (paymentNotFound) return 'Payment not found'
    if (paymentDeleted) return 'Offer deleted by buyer'
    if (!paymentUnspent) return 'Offer withdrawn by buyer'

    if (nftNotFound) return 'Nft not found'
    if (nftDeleted) return 'Rejected by seller'
    if (!nftUnspent) return 'Rejected by seller'

    return 'Active'
  }

  if(offerNotFound) return (<div className="m-16">
    <h2 className="text-4xl font-bold dark:text-white">Offer not found</h2>
  </div>)

  return (<div className="m-16">
    <h2 className="text-4xl font-bold dark:text-white">Offer Received</h2>
    <dl className="py-8 max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div className="flex flex-col pb-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">NFT</dt>
        <dd className="text-lg font-semibold">{nft?.title ? nft.title : 'Validating...'}</dd>
      </div>
      <div className="flex flex-col py-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Amount</dt>
        <dd className="text-lg font-semibold">{payment?._amount ? payment._amount/1e8 : 'Validating...'}</dd>
      </div>
      <div className="flex flex-col pt-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Status</dt>
        <dd className="text-lg font-semibold">{getStatus()}</dd>
      </div>
    </dl>

    <Button color='white' disabled={offerNotFound || offerDeleted || !offerUnspent} onClick={handleDeleteOffer}>{getStatus() === 'Active' ? 'Reject' : 'Delete'}</Button>
    <Button color='blue' disabled={getStatus() !== 'Active'} onClick={handleAcceptOffer}>Accept</Button>
  </div>)
}

export default OfferDetails
