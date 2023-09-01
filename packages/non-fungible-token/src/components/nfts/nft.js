import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../util/loader";
import { Computer } from "@bitcoin-computer/lib";
import MakeOffer from '../offers/makeOffer'

function Nft({
  computer,
  nftModSpec,
  paymentModSpec,
  offerModSpec,
}) {
  const navigate = useNavigate();
  let params = useParams();
  const [nft, setNft] = useState(null);
  const [rev] = useState(params.rev);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ;(async () => {
      if (computer) {
        try {
          const nft = await computer.sync(rev)
          console.log("Synced to nft", nft)
          setNft(nft)
          setLoading(false)
        } catch (error) {
          console.log(error)
        }
      }
    })()
  }, [computer, rev])

  const Title = () => {
    if (!nft)
    return <div class="h-12 bg-gray-200 rounded-full dark:bg-gray-700 w-100"></div>
    return <h1 className="text-5xl font-extrabold dark:text-white">{nft?.title}</h1>
  }

  const Artist = () => {
    if (!nft)
      return <div class="h-8 bg-gray-200 rounded-full dark:bg-gray-700 w-80 my-3"></div>
    return <h2 className="text-4xl dark:text-white py-2">{nft?.artist}</h2>
  }

  const Rev = () => (<code className="text-gray-400 text-xs">{rev}</code>)

  return (
    <div className="mt-24 pl-36">
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="mb-4">
          <Title />
          <Artist />
          <Rev />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full">
            {!nft ? (
              <Loader />
            ) : (
              <img
                className="w-full h-auto"
                src={nft?.url}
                alt={nft?.title}
              />
            )}
          </div>
          {/* <div className="h-96 pr-32">
            <div className="space-y-2">
              <MakeOffer
                computer={computer}
                nft={nft}
                paymentModSpec={paymentModSpec}
                offerModSpec={offerModSpec}
              />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default Nft
