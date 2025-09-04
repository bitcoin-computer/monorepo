import { NFT } from '@bitcoin-computer/TBC721'

const SlideOut = ({ nft, userPublicKey }: { nft: NFT; userPublicKey: string }) => {
  if (nft._owners[0] === userPublicKey)
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white py-2 text-center font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
        Your NFT
      </div>
    )

  if (nft.offerTxRev)
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white py-2 text-center font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
        Buy Now
      </div>
    )

  return <></>
}

export function NFTCard({ nft, userPublicKey }: { nft: NFT | undefined; userPublicKey: string }) {
  if (!nft) return <></>

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4 relative overflow-hidden group">
        <img
          className="h-auto rounded-t-lg max-w-full w-full"
          src={nft.url}
          alt="Image Preview"
          crossOrigin="anonymous"
        />
        <div className="p-4">
          <h5
            className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white break-words"
            title={nft.name}
          >
            {nft.name}
          </h5>
          <p
            className="mb-1 font-normal text-gray-700 dark:text-gray-400 break-words"
            title={nft.artist}
          >
            {nft.artist}
          </p>
        </div>
        <SlideOut nft={nft} userPublicKey={userPublicKey} />
      </div>
    </>
  )
}
