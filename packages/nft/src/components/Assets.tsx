import { Auth, Gallery } from "@bitcoin-computer/components"
import { NFT } from "@bitcoin-computer/TBC721"

const publicKey = Auth.getComputer().getPublicKey()
const contract = { class: NFT, args: ["vivek", "VIV"] as any }

export function MyAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My NFTs</h2>
      <Gallery.WithPagination contract={contract} publicKey={publicKey} />
    </>
  )
}

export function AllAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All NFTs</h2>
      <Gallery.WithPagination contract={contract} />
    </>
  )
}
