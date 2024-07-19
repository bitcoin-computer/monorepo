import { Auth } from "@bitcoin-computer/components"
import { nftModSpec } from "../constants/modSpecs"
import { Gallery } from "./Gallery"

const publicKey = Auth.getComputer().getPublicKey()

export function MyAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My NFTs</h2>
      <Gallery.WithPagination mod={nftModSpec} publicKey={publicKey} />
    </>
  )
}

export function AllAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All NFTs</h2>
      <Gallery.WithPagination mod={nftModSpec} />
    </>
  )
}
