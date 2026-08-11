import { FormEvent, useContext, useRef, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import { ComputerContext } from '@bitcoin-computer/components'
import {
  isPossibleCryptoAddress,
  isTxId,
  isValidHexadecimalPublicKey,
  isValidRevString,
} from '../utils'

export type SearchFilter = 'all' | 'tx' | 'object' | 'address' | 'pubkey' | 'module'

const FILTER_LABELS: Record<SearchFilter, string> = {
  all: 'All Filters',
  tx: 'Transaction',
  object: 'Object / rev',
  address: 'Address',
  pubkey: 'Public Key',
  module: 'Module',
}

const PLACEHOLDER_BY_FILTER: Record<SearchFilter, string> = {
  all: 'Search by TxID / Object rev (txid:vout) / Address / Public Key / Module',
  tx: 'Search by Transaction ID (64-character hex)',
  object: 'Search by object revision (txid:vout)',
  address: 'Search by Bitcoin / Litecoin address',
  pubkey: 'Search by public key (02…/03… compressed, 66 hex)',
  module: 'Search by module specifier (txid:vout)',
}

const SEARCH_HINTS = [
  { label: 'TxID', example: '64-char hex' },
  { label: 'Object', example: 'txid:vout' },
  { label: 'Module', example: 'txid:vout' },
  { label: 'Address', example: 'ltc1… / bc1…' },
  { label: 'Public key', example: '02… / 03…' },
] as const

async function resolveSearch(
  raw: string,
  filter: SearchFilter,
  computer: Computer,
  navigate: NavigateFunction,
): Promise<void> {
  const searchInput = raw.trim()
  if (!searchInput) {
    navigate('/')
    return
  }

  if (filter === 'tx') {
    navigate(`/transactions/${searchInput.toLowerCase()}`)
    return
  }
  if (filter === 'object') {
    navigate(`/objects/${searchInput}`)
    return
  }
  if (filter === 'address') {
    navigate(`/utxos/${searchInput}`)
    return
  }
  if (filter === 'pubkey') {
    navigate(`/?publicKey=${encodeURIComponent(searchInput)}`)
    return
  }
  if (filter === 'module') {
    navigate(`/modules/${searchInput}`)
    return
  }

  if (searchInput.includes(':')) {
    if (!isValidRevString(searchInput)) {
      navigate(`/objects/${encodeURIComponent(searchInput)}`)
      return
    }
    try {
      await computer.getModule(searchInput)
      navigate(`/modules/${searchInput}`)
    } catch {
      navigate(`/objects/${searchInput}`)
    }
    return
  }

  if (isValidHexadecimalPublicKey(searchInput)) {
    navigate(`/?publicKey=${encodeURIComponent(searchInput)}`)
    return
  }

  if (isTxId(searchInput)) {
    navigate(`/transactions/${searchInput.toLowerCase()}`)
    return
  }

  if (isPossibleCryptoAddress(searchInput)) {
    navigate(`/utxos/${searchInput}`)
    return
  }

  navigate(`/transactions/${searchInput}`)
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
      />
    </svg>
  )
}

/**
 * Compact search for the sticky top navbar (non-home pages) — Etherscan-style.
 */
export function NavbarSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const computer = useContext(ComputerContext)
  const navigate = useNavigate()

  const run = async (e?: FormEvent) => {
    e?.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      await resolveSearch(inputRef.current?.value || '', 'all', computer, navigate)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={run} className="relative w-full min-w-0 flex-1">
      <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">
        <SearchIcon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="search"
        name="q"
        autoComplete="off"
        spellCheck={false}
        disabled={busy}
        className="block w-full h-9 ps-8 pe-3 text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-500 dark:text-white dark:focus:bg-gray-900"
        placeholder="TxID / rev / address / pubkey / module"
        aria-label="Search"
      />
    </form>
  )
}

/**
 * Full hero search for the home page only (with filter + format hints).
 */
export function HomeSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<SearchFilter>('all')
  const [focused, setFocused] = useState(false)
  const computer = useContext(ComputerContext)
  const navigate = useNavigate()

  const onSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      await resolveSearch(inputRef.current?.value || '', filter, computer, navigate)
    } finally {
      setBusy(false)
    }
  }

  return (
    /* Full-bleed grey band (Etherscan-style) — distinguish from white content below */
    <div className="w-full border-b border-gray-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-800/80">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <form onSubmit={onSubmit} className="w-full">
          <div
            className={`flex flex-col sm:flex-row w-full rounded-lg border bg-white dark:bg-gray-900 shadow-sm overflow-hidden ${
              focused
                ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="relative shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-600">
              <label htmlFor="search-filter" className="sr-only">
                Search filter
              </label>
              <select
                id="search-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as SearchFilter)}
                className="w-full sm:w-[9.5rem] h-11 appearance-none bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 pl-3 pr-8 border-0 focus:ring-0 cursor-pointer"
              >
                {(Object.keys(FILTER_LABELS) as SearchFilter[]).map((key) => (
                  <option key={key} value={key}>
                    {FILTER_LABELS[key]}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <svg
                  className="w-3 h-3 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </div>
            </div>

            <div className="relative flex-1 min-w-0 flex items-center">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                ref={inputRef}
                type="search"
                name="q"
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="block w-full h-11 ps-9 pe-3 text-sm text-gray-900 bg-transparent border-0 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-white disabled:opacity-60"
                placeholder={PLACEHOLDER_BY_FILTER[filter]}
                aria-label={PLACEHOLDER_BY_FILTER[filter]}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="shrink-0 h-11 px-5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {busy ? '…' : 'Search'}
            </button>
          </div>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-1 gap-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">You can search:</span>
          {SEARCH_HINTS.map((hint, i) => (
            <span key={hint.label} className="inline-flex items-center gap-1">
              {i > 0 ? <span className="text-gray-400 dark:text-gray-600 mx-0.5">·</span> : null}
              <span className="inline-flex items-center rounded-md bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 px-2 py-0.5">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{hint.label}</span>
                <span className="mx-1 text-gray-300 dark:text-gray-600">·</span>
                <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                  {hint.example}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use NavbarSearch or HomeSearch */
export const ExplorerSearch = HomeSearch
export const SearchBar = NavbarSearch
