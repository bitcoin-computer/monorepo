import { Auth } from "@bitcoin-computer/components"
import { REACT_APP_NFT_MOD_SPEC } from "../constants/modSpecs"
import { Gallery } from "./Gallery"

const publicKey = Auth.getComputer().getPublicKey()

export function MyAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My NFTs</h2>
      <Gallery.WithPagination mod={REACT_APP_NFT_MOD_SPEC} publicKey={publicKey} />
    </>
  )
}

export function AllAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All NFTs</h2>
      <Gallery.WithPagination mod={REACT_APP_NFT_MOD_SPEC} />
    </>
  )
}
