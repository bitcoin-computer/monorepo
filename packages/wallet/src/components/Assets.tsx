import { Auth, Gallery } from "@bitcoin-computer/components"

export function Assets() {
  return <>
    <h2 className="text-4xl font-bold dark:text-white">Assets</h2>
    <Gallery.WithPagination publicKey={Auth.getComputer().getPublicKey()} />
  </>
}