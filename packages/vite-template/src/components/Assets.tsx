import { Auth, Gallery } from '@bitcoin-computer/components'
import { VITE_COUNTER_MOD_SPEC } from '../constants/modSpecs'

const publicKey = Auth.getComputer().getPublicKey()

export function MyAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My Counters</h2>
      <Gallery.WithPagination mod={VITE_COUNTER_MOD_SPEC} publicKey={publicKey} />
    </>
  )
}

export function AllAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All Counters</h2>
      <Gallery.WithPagination mod={VITE_COUNTER_MOD_SPEC} />
    </>
  )
}
