import { Auth, Gallery } from '@bitcoin-computer/components'
import { VITE_COUNTER_MOD_SPEC } from '../constants/modSpecs'

const publicKey = Auth.getComputer().getPublicKey()

export function MyAssets() {
  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold dark:text-white mb-4">My Counters</h2>
      <Gallery.WithPagination embed mod={VITE_COUNTER_MOD_SPEC} publicKey={publicKey} />
    </div>
  )
}

export function AllAssets() {
  return (
    <div className="w-full">
      <h2 id="all-counters-heading" className="text-4xl font-bold dark:text-white mb-4">
        All Counters
      </h2>
      <Gallery.WithPagination embed mod={VITE_COUNTER_MOD_SPEC} />
    </div>
  )
}
