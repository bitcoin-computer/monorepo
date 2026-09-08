import { Link, useLocation } from 'react-router-dom'
import { Modal, Auth, Drawer, ComputerContext } from '@bitcoin-computer/components'
import { useContext, useEffect, useRef, useState } from 'react'
import { ExplorerSearch } from './SearchBar'
import { ChevronDownIcon, MenuIcon } from './ui/icons'
import { tryGet } from '../utils'

const DOCS_URL = 'https://docs.bitcoincomputer.io/'

const navLinkClass =
  'block py-1.5 px-2 text-sm text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-200 dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-400 whitespace-nowrap'

function BlockchainMenu({ mobile }: { mobile?: boolean }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const active =
    pathname.startsWith('/block') ||
    pathname === '/transactions' ||
    pathname.startsWith('/transactions/') ||
    pathname.startsWith('/utxos/')

  useEffect(() => {
    if (mobile) return undefined
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [mobile])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (mobile) {
    return (
      <>
        <li className="pt-1">
          <span className="block px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Blockchain
          </span>
        </li>
        <li>
          <Link to="/blocks" className={navLinkClass}>
            Blocks
          </Link>
        </li>
        <li>
          <Link to="/transactions" className={navLinkClass}>
            Transactions
          </Link>
        </li>
        <li>
          <UtxosLink />
        </li>
      </>
    )
  }

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${navLinkClass} inline-flex items-center gap-1 ${
          active ? 'text-blue-700 dark:text-blue-400' : ''
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Blockchain
        <ChevronDownIcon className="w-3 h-3 opacity-70" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 z-50 min-w-[10rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <Link
            to="/blocks"
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Blocks
          </Link>
          <Link
            to="/transactions"
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Transactions
          </Link>
          <UtxosLink className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700" />
        </div>
      ) : null}
    </li>
  )
}

function UtxosLink({ className }: { className?: string }) {
  const computer = useContext(ComputerContext)
  const utxosPath = tryGet(() => `/utxos/${computer.getAddress()}`, '/')
  return (
    <Link to={utxosPath} className={className || navLinkClass}>
      UTXOs
    </Link>
  )
}

function PrimaryNavLinks({ mobile }: { mobile?: boolean }) {
  return (
    <>
      <li>
        <Link to="/" className={navLinkClass}>
          Objects
        </Link>
      </li>
      <li>
        <Link to="/modules" className={navLinkClass}>
          Modules
        </Link>
      </li>
      <BlockchainMenu mobile={mobile} />
      <li>
        <Link to="/playground" className={navLinkClass}>
          Playground
        </Link>
      </li>
      <li>
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={navLinkClass}>
          Docs
        </a>
      </li>
    </>
  )
}

function AuthNavItem() {
  if (Auth.isLoggedIn()) {
    return (
      <li>
        <span className={navLinkClass}>
          <Drawer.ShowDrawer text="Wallet" id="wallet-drawer" />
        </span>
      </li>
    )
  }
  return (
    <li>
      <span className={navLinkClass}>
        <Modal.ShowButton text="Sign in" id="sign-in-modal" />
      </span>
    </li>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
          <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0">
            <img src="/logo.png" className="h-8 sm:h-9 shrink-0" alt="Bitcoin Computer Logo" />
            <span className="hidden sm:inline text-base sm:text-lg font-semibold whitespace-nowrap dark:text-white truncate max-w-[11rem] lg:max-w-none">
              Bitcoin Computer Explorer
            </span>
            <span className="sm:hidden text-base font-semibold dark:text-white">BC Explorer</span>
          </Link>

          {!isHome ? (
            <div className="hidden md:flex flex-1 min-w-0 max-w-xl mx-1 lg:mx-2">
              <ExplorerSearch variant="nav" />
            </div>
          ) : (
            <div className="hidden md:block flex-1" />
          )}

          <button
            type="button"
            className="inline-flex items-center p-2 w-9 h-9 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 ml-auto"
            aria-controls="navbar-dropdown"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Open main menu</span>
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="hidden md:flex md:items-center md:shrink-0">
            <ul className="flex flex-row items-center gap-3 lg:gap-4">
              <PrimaryNavLinks />
              <AuthNavItem />
            </ul>
          </div>

          <div
            className={`${menuOpen ? 'block' : 'hidden'} w-full md:hidden`}
            id="navbar-dropdown"
          >
            {!isHome ? (
              <div className="px-1 pt-3 pb-2">
                <ExplorerSearch variant="nav" />
              </div>
            ) : null}
            <ul className="flex flex-col gap-1 p-2 mt-1 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <PrimaryNavLinks mobile />
              <AuthNavItem />
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
