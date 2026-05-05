import { useContext, useEffect, useState } from 'react'
import { Computer } from '@bitcoin-computer/lib'
import { ComputerContext, UtilsContext } from '@bitcoin-computer/components'
import { Auth } from '@bitcoin-computer/components'
import { Modal } from '@bitcoin-computer/components'
import { VITE_TBC20_MOD_SPEC } from '../constants/modSpecs'
import { signInModal } from './Navbar'
import { HiRefresh } from 'react-icons/hi'

const TOKEN_CLAIM_AMOUNT = 30n
const MINTER_MNEMONIC = import.meta.env.VITE_MINTER_MNEMONIC as string | undefined
const CHESS_TOKEN_ID = import.meta.env.VITE_CHESS_TOKEN_ID as string | undefined

interface TokenInfo {
  _id: string
  _rev: string
  _root: string
  amount: bigint
  name?: string
}

function isTokenInfo(value: unknown): value is TokenInfo {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<TokenInfo>
  console.log(
    'value: ',
    !candidate || typeof candidate !== 'object',
    candidate?._id,
    candidate?._rev,
    candidate?._root,
    candidate?.amount,
  )

  return (
    typeof candidate._id === 'string' &&
    typeof candidate._rev === 'string' &&
    typeof candidate._root === 'string' &&
    typeof candidate.amount === 'bigint'
  )
}

function TokenRow({ token }: { token: TokenInfo }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {token.name ?? 'Token'}
        </p>
        <p
          className="text-xs text-gray-400 dark:text-gray-500 truncate"
          title={token._root || 'unknown'}
        >
          Root: {token._root ? `${token._root.slice(0, 20)}…` : 'unknown'}
        </p>
      </div>
      <span className="ml-4 text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
        {token.amount.toString()}
      </span>
    </div>
  )
}

export function TokenBalance() {
  const computer = useContext(ComputerContext)
  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [totalBalance, setTotalBalance] = useState<bigint>(0n)
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(false)

  const fetchTokens = async () => {
    if (!Auth.isLoggedIn()) return
    setLoading(true)
    showLoader(true)
    try {
      const tokenRevs = await computer.getOUTXOs({
        mod: VITE_TBC20_MOD_SPEC,
        publicKey: computer.getPublicKey(),
      })
      console.log('tokenRevs: ', tokenRevs)
      const synced: unknown[] = await Promise.all(tokenRevs.map((rev) => computer.sync(rev)))

      const tokenInfos: TokenInfo[] = synced.filter(isTokenInfo)
      console.log('tokenInfos: ', tokenInfos)
      setTokens(tokenInfos)
      setTotalBalance(tokenInfos.reduce((sum, t) => sum + t.amount, 0n))
    } catch (err) {
      showSnackBar(err instanceof Error ? err.message : 'Failed to load tokens', false)
    } finally {
      setLoading(false)
      showLoader(false)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [computer])

  const claimTokens = async () => {
    if (!MINTER_MNEMONIC || !CHESS_TOKEN_ID) {
      showSnackBar('Token distributor is not configured yet. Run deploy first.', false)
      return
    }

    setClaiming(true)
    showLoader(true)
    try {
      const minter = new Computer({
        chain: import.meta.env.VITE_CHAIN,
        network: import.meta.env.VITE_NETWORK,
        url: import.meta.env.VITE_URL,
        mnemonic: MINTER_MNEMONIC,
      })

      const latestRev = await minter.latest(CHESS_TOKEN_ID)
      const { tx } = await minter.encode({
        exp: `token.transfer('${computer.getPublicKey()}', ${TOKEN_CLAIM_AMOUNT}n)`,
        env: { token: latestRev },
        mod: VITE_TBC20_MOD_SPEC,
      })
      await minter.broadcast(tx)
      showSnackBar(`Sent ${TOKEN_CLAIM_AMOUNT.toString()} tokens to your wallet`, true)
      await fetchTokens()
    } catch (err) {
      showSnackBar(err instanceof Error ? err.message : 'Failed to claim tokens', false)
    } finally {
      setClaiming(false)
      showLoader(false)
    }
  }

  if (!Auth.isLoggedIn()) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Sign in to view your token balance.
        </p>
        <button
          onClick={() => Modal.showModal(signInModal)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Token Balance</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={claimTokens}
            disabled={claiming || loading}
            className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : 'Get Tokens'}
          </button>
          <button
            onClick={fetchTokens}
            disabled={loading || claiming}
            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Total balance card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-white shadow-lg">
        <p className="text-sm font-medium opacity-80 mb-1">Total Balance</p>
        <p className="text-4xl font-bold">{totalBalance.toString()}</p>
        <p className="text-sm opacity-70 mt-1">tokens across {tokens.length} UTXO(s)</p>
      </div>

      {/* Token list */}
      {tokens.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading…</p>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No tokens found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Tokens will appear here once you receive them.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Token UTXOs
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {tokens.map((token) => (
              <TokenRow key={token._rev} token={token} />
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">How tokens work:</span> Tokens are wagered when you create
          or join a chess game. The winner receives both wagers. Tokens locked in active games will
          appear here after you withdraw them.
        </p>
      </div>
    </div>
  )
}
