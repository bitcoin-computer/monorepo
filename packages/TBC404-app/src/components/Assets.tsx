import { Auth, Gallery } from "@bitcoin-computer/components"

const publicKey = Auth.getComputer().getPublicKey()

export function MyAssets() {
  return <>
    <h2 className="text-4xl font-bold dark:text-white">My Tokens</h2>
    <Gallery.WithPagination publicKey={publicKey} />
  </>
}

export function AllAssets() {
  return <>
    <h2 className="text-4xl font-bold dark:text-white">All Tokens</h2>
    <Gallery.WithPagination />
  </>
}