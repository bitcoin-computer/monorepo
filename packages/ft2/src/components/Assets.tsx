import { Auth, Gallery } from "@bitcoin-computer/components"
import { REACT_APP_TOKEN_MOD_SPEC } from "../constants/modSpecs"

const publicKey = Auth.getComputer().getPublicKey()

export function MyAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My Assets</h2>
      <Gallery.WithPagination mod={REACT_APP_TOKEN_MOD_SPEC} publicKey={publicKey} />
    </>
  )
}

export function AllAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All Assets</h2>
      <Gallery.WithPagination mod={REACT_APP_TOKEN_MOD_SPEC} />
    </>
  )
}
