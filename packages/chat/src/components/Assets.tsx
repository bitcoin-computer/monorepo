import { Auth, Gallery } from '@bitcoin-computer/components'
import { VITE_CHAT_MOD_SPEC } from '../constants/modSpecs'

const publicKey = Auth.getComputer().getPublicKey()

// How to prevent users from accessing other chats
export function MyAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My Chats</h2>
      <Gallery.WithPagination mod={VITE_CHAT_MOD_SPEC} publicKey={publicKey} />
    </>
  )
}
