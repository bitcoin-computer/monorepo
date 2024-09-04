import { Link } from "react-router-dom"
import { Modal, Auth, Drawer } from "@bitcoin-computer/components"
import { useEffect } from "react"
import { initFlowbite } from "flowbite"

function Item({ dest }: { dest: string }) {
  return (
    <Link to={`/${dest}`} className="flex items-center space-x-3 rtl:space-x-reverse">
      <span className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
        {dest.charAt(0).toUpperCase() + dest.slice(1)}
      </span>
    </Link>
  )
}

export function NotLoggedMenu() {
  return (
    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
      <li className="py-2">
        <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
          <Modal.ShowButton text="Sign in" id="sign-in-modal" />
        </label>
      </li>
    </ul>
  )
}

export function LoggedInMenu() {
  return (
    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
      <Item dest={"mine"} />
      <Item dest={"mint"} />
      <li className="py-2">
        <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
          <Drawer.ShowDrawer text="Wallet" id="wallet-drawer" />
        </label>
      </li>
    </ul>
  )
}

export function Logo({ name = "Bitcoin Computer CRA Template" }) {
  return (
    <Link to={`/`} className="flex items-center space-x-3 rtl:space-x-reverse">
      <img src="/logo.png" className="h-10" alt="Bitcoin Computer Logo" />
      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
        {name}
      </span>
    </Link>
  )
}

export function Navbar() {
  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Logo />
          <div className="hidden w-full md:block md:w-auto" id="navbar-dropdown">
            {Auth.isLoggedIn() ? <LoggedInMenu /> : <NotLoggedMenu />}
          </div>
        </div>
      </nav>
    </>
  )
}
