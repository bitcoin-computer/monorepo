import React, { useState, useEffect } from "react"
import { Link } from 'react-router-dom';

function NftCard({ rev, computer }) {
  const [nft, setNft] = useState(null)

  // Fetch the nft
  useEffect(() => {
    const fetch = async () => {
      setNft(await computer.sync(rev))
    }
    fetch()
  }, [])

  const Image = () => {
    if (!nft)
      return (<div className="flex items-center justify-center h-48 bg-gray-300 dark:bg-gray-700">
        <svg className="h-12 text-gray-200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" /></svg>
      </div>)
    return (<img className="w-full" src={nft.url} alt={nft.title} />)
  }

  return (<Link to={`/art/${rev}`}>
    <div className="w-80 m-4 bg-white border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
      <Image />
      <div className="p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{nft ? nft.title : 'Validating...'}</h5>
        <p className="mb-2 font-normal text-gray-700 dark:text-gray-400">{nft ? nft.artist : 'Validating...'}</p>
      </div>
    </div>
  </Link>)
}

export default NftCard
