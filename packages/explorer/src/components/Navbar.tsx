import { Link } from 'react-router-dom'
import { Modal, Auth, Drawer, ComputerContext } from '@bitcoin-computer/components'
import { useContext, useEffect } from 'react'
import { initFlowbite } from 'flowbite'
import { SearchBar } from './SearchBar'

const DOCS_URL = 'https://docs.bitcoincomputer.io/'

const navLinkClass =
  'block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'

const navListClass =
  'flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700'

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
      <li className="py-2">
        <Link to="/" className={navLinkClass}>
          Objects
        </Link>
      </li>
      <li className="py-2">
        <Link to="/playground" className={navLinkClass}>
          Playground
        </Link>
      </li>
      <li className="py-2">
        <Link to="/modules" className={navLinkClass}>
          Modules
        </Link>
      </li>
      <li className="py-2">
        <Link to={utxosPath} className={navLinkClass}>
          UTXOs
        </Link>
      </li>
      <li className="py-2">
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={navLinkClass}
        >
          Docs
        </a>
      </li>
    </>
  )
}

function AuthNavItem() {
  if (Auth.isLoggedIn()) {
    return (
      <li className="py-2">
        <label className={navLinkClass}>
          <Drawer.ShowDrawer text="Wallet" id="wallet-drawer" />
        </label>
      </li>
    )
  }
  return (
    <li className="py-2">
      <label className={navLinkClass}>
        <Modal.ShowButton text="Sign in" id="sign-in-modal" />
      </label>
    </li>
  )
}

function NavMenu() {
  return (
    <ul className={navListClass}>
      <PrimaryNavLinks />
      <AuthNavItem />
      <li>
        <SearchBar />
      </li>
    </ul>
  )
}

export default function Navbar() {
  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link to={`/`} className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
            <img src="/logo.png" className="h-10 shrink-0" alt="Bitcoin Computer Logo" />
            <span className="self-center text-xl sm:text-2xl font-semibold whitespace-nowrap dark:text-white truncate">
              Bitcoin Computer Explorer
            </span>
          </Link>

          <button
            data-collapse-toggle="navbar-dropdown"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-dropdown"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>

          <div className="hidden w-full md:block md:w-auto" id="navbar-dropdown">
            <NavMenu />
          </div>
        </div>
      </nav>
    </>
  )
}
