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
  const [nft, setNft] = useState({});
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

  return (
    <div className="mt-24 pl-36">
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="mb-4">
          <p className="text-gray-400 text-xs pb-2">{rev}</p>
          <h1 className="text-5xl font-extrabold dark:text-white">{nft.title}</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full">
            {loading ? (
              <Loader />
            ) : (
              <img
                className="w-full h-auto"
                src={nft.url}
                alt={nft.title}
              />
            )}
          </div>
          <div className="h-96 pr-32">
            <div className="space-y-2">
              <p className="text-gray-400 text-xs">Artist</p>
              <h2 className="text-4xl font-bold dark:text-white">
                {nft.artist}
              </h2>
              <MakeOffer
                computer={computer}
                nft={nft}
                paymentModSpec={paymentModSpec}
                offerModSpec={offerModSpec}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Nft
