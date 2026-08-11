import { Link, useLocation } from 'react-router-dom'
import { Modal, Auth, Drawer, ComputerContext } from '@bitcoin-computer/components'
import { useContext, useEffect } from 'react'
import { initFlowbite } from 'flowbite'
import { NavbarSearch } from './SearchBar'

const DOCS_URL = 'https://docs.bitcoincomputer.io/'

const navLinkClass =
  'block py-1.5 px-2 text-sm text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-200 dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-400 whitespace-nowrap'

function PrimaryNavLinks() {
  const computer = useContext(ComputerContext)
  let utxosPath = '/'
  try {
    utxosPath = `/utxos/${computer.getAddress()}`
  } catch {
    utxosPath = '/'
  }

  return (
    <>
      <li>
        <Link to="/" className={navLinkClass}>
          Objects
        </Link>
      </li>
      <li>
        <Link to="/playground" className={navLinkClass}>
          Playground
        </Link>
      </li>
      <li>
        <Link to="/modules" className={navLinkClass}>
          Modules
        </Link>
      </li>
      <li>
        <Link to={utxosPath} className={navLinkClass}>
          UTXOs
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

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-2.5">
        {/*
          Desktop: Logo+title | [compact search when not home] | Objects…Wallet
          Mobile: logo + hamburger; search (if any) + links in collapse
        */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0">
            <img src="/logo.png" className="h-8 sm:h-9 shrink-0" alt="Bitcoin Computer Logo" />
            <span className="hidden sm:inline text-base sm:text-lg font-semibold whitespace-nowrap dark:text-white truncate max-w-[11rem] lg:max-w-none">
              Bitcoin Computer Explorer
            </span>
            <span className="sm:hidden text-base font-semibold dark:text-white">BC Explorer</span>
          </Link>

          {/* Compact search between brand and nav tabs (inner pages only) */}
          {!isHome ? (
            <div className="hidden md:flex flex-1 min-w-0 max-w-xl mx-1 lg:mx-2">
              <NavbarSearch />
            </div>
          ) : (
            <div className="hidden md:block flex-1" />
          )}

          <button
            data-collapse-toggle="navbar-dropdown"
            type="button"
            className="inline-flex items-center p-2 w-9 h-9 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 ml-auto"
            aria-controls="navbar-dropdown"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>

          <div
            className="hidden w-full md:flex md:w-auto md:items-center md:shrink-0 md:ml-0"
            id="navbar-dropdown"
          >
            {/* Mobile: search inside menu when not home */}
            {!isHome ? (
              <div className="md:hidden px-1 pt-3 pb-2">
                <NavbarSearch />
              </div>
            ) : null}
            <ul className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 lg:gap-4 p-2 md:p-0 mt-1 md:mt-0 border border-gray-100 md:border-0 rounded-lg bg-gray-50 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700">
              <PrimaryNavLinks />
              <AuthNavItem />
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
