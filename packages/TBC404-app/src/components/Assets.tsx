import { Auth, Gallery } from "@bitcoin-computer/components"
import { Counter } from "../contracts/counter"

const publicKey = Auth.getComputer().getPublicKey()
const contract = { class: Counter }

export function MyAssets() {
  return <>
    <h2 className="text-4xl font-bold dark:text-white">My Counters</h2>
    <Gallery.WithPagination contract={contract} publicKey={publicKey} />
  </>
}

export function AllAssets() {
  return <>
    <h2 className="text-4xl font-bold dark:text-white">All Counters</h2>
    <Gallery.WithPagination contract={contract}/>
  </>
}