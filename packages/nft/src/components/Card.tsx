import { NFT } from '@bitcoin-computer/TBC721'

export function NFTCard({ nft }: { nft: NFT | undefined }) {
  if (!nft) return <></>

  console.log('nft', nft.url)

  return (
    <>
      {nft && (
        <div className="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4">
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
              className="mb-3 font-normal text-gray-700 dark:text-gray-400 break-words"
              title={nft.artist}
            >
              {nft.artist}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
