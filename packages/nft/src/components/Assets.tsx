import { Auth } from '@bitcoin-computer/components'
import { VITE_NFT_MOD_SPEC as mod } from '../constants/modSpecs'
import { Gallery } from './Gallery'

const publicKey = Auth.getComputer().getPublicKey()

export const MyAssets = () => <Gallery.WithPagination mod={mod} publicKey={publicKey} />
export const AllAssets = () => <Gallery.WithPagination mod={mod} />
