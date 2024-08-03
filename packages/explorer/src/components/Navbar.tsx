import { Link } from 'react-router-dom'
import { Modal, Auth, Drawer } from '@bitcoin-computer/components'
import { useEffect } from 'react'
import { initFlowbite } from 'flowbite'
import { SearchBar } from './SearchBar'

function LoggedInMenu() {
  return (
    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
      <li className="py-2">
        <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
          <Drawer.ShowDrawer text="Wallet" id="wallet-drawer" />
        </label>
      </li>
      <li className="py-2">
        <Link
          to="/playground"
          className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
        >
          Playground
        </Link>
      </li>
      <li>
        <SearchBar />
      </li>
    </ul>
  )
}

function NotLoggedMenu() {
  return (
    <>
      <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
        <li className="py-2">
          <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
            <Modal.ShowButton text="Sign in" id="sign-in-modal" />
          </label>
        </li>
        <li>
          <SearchBar />
        </li>
      </ul>
    </>
  )
}

export default function Navbar() {
  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link to={`/`} className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/logo.png" className="h-10" alt="Bitcoin Computer Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              TBC Explorer
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
            {Auth.isLoggedIn() ? <LoggedInMenu /> : <NotLoggedMenu />}
          </div>
        </div>
      </nav>
    </>
  )
}
