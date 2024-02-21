import { Auth, Gallery } from "@bitcoin-computer/components"

export function MyAssets() {
  return <>
    <h2 className="text-4xl font-bold dark:text-white">My Counters</h2>
    <Gallery.WithPagination publicKey={Auth.getComputer().getPublicKey()} />
  </>
}

export function AllAssets() {
  return <>
    <h2 className="text-4xl font-bold dark:text-white">All Counters</h2>
    <Gallery.WithPagination />
  </>
}