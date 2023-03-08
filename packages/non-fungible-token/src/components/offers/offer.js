import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

function OfferDetails ({ computer }) {
  let params = useParams()
  const [rev] = useState(params.rev)
  const [offer, setOffer] = useState({})
  const [swapTx, setSwapTx] = useState({})
  const [nftRev, setNftRev] = useState('')
  const [paymentRev, setPaymentRev] = useState('')
  const [nft, setNft] = useState({})
  const [payment, setPayment] = useState({})
  const [active, setActive] = useState(undefined)
  const [notFound, setNotFound] = useState(false)

  // Fetch the offer
  useEffect(() => {
    const fetch = async () => {
      try {
        setOffer(await computer.sync(rev))
      } catch {
        setNotFound(true)
      }
    }
    fetch()
  }, [])

  // Parse swapTx from offer
  useEffect(() => {
    const fetch = async () => {
      if (!offer?.swapTx) return
      const swapTxJson = JSON.parse(offer.swapTx)
      setSwapTx(await computer.txFromJSON({ json: swapTxJson }))
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
      setNft(await computer.sync(nftRev))
    }
    fetch()
  }, [nftRev])

  // Fetch the payment
  useEffect(() => {
    const fetch = async () => {
      if (!paymentRev) return
      setPayment(await computer.sync(paymentRev))
    }
    fetch()
  }, [paymentRev])

  // Check payment status
  useEffect(() => {
    const fetch = async () => {
      if (!payment?._id) return
      const [latestRev] = await computer.idsToRevs([payment._id])
      setActive(latestRev === paymentRev)
    }
    fetch()
  }, [payment])

  const handleAcceptOffer = async (evt) => {
    evt.preventDefault()
    console.log('Accepting offer', offer)
    computer.sign(swapTx)
    const offerTxId = await computer.broadcast(swapTx)
    console.log('Accepted offer', offerTxId)
  }

  const isActive = () => {
    if (active === undefined) return 'Loading...'
    return active ? 'Active' : 'Withdrawn'
  }

  const Button = ({ onClick, disabled, children }) => {
    if(disabled)
      return (<button disabled type="button" className="text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center">{children}</button>)
    return (<button onClick={onClick} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">{children}</button>)
  }

  if(notFound) return (<div className="m-16">
    <h2 className="text-4xl font-bold dark:text-white">Offer not found</h2>
  </div>)

  return (<div className="m-16">
    <h2 className="text-4xl font-bold dark:text-white">Offer</h2>
    <dl className="py-8 max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div className="flex flex-col pb-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">NFT</dt>
        <dd className="text-lg font-semibold">{nft?.title ? nft.title : 'Loading...'}</dd>
      </div>
      <div className="flex flex-col py-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Amount</dt>
        <dd className="text-lg font-semibold">{payment?._amount ? payment._amount/1e8 : 'Loading...'}</dd>
      </div>
      <div className="flex flex-col pt-3">
        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Status</dt>
        <dd className="text-lg font-semibold">{isActive()}</dd>
      </div>
    </dl>
    <Button disabled={!active} onClick={handleAcceptOffer}>Accept</Button>
  </div>)
}

export default OfferDetails
