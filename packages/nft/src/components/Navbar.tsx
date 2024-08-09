
import { Link, useNavigate } from "react-router-dom"
import { Modal, Auth, Drawer } from "@bitcoin-computer/components"
import { useEffect, useState } from "react"
import { initFlowbite } from "flowbite"

const modalTitle = "Connect to Node"
const modalId = "unsupported-config-modal"

function ModalContent() {
  const [url, setUrl] = useState<string>("")
  function setNetwork(e: React.SyntheticEvent) {
    e.preventDefault()
    localStorage.setItem("URL", url)
  }

  function closeModal() {
    Modal.get(modalId).hide()
  }

  return (
    <form onSubmit={setNetwork}>
      <div className="p-4 md:p-5">
        <div>
          <label
            htmlFor="url"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Please insert the URL of a node for your desired configuration
          </label>

          <input
            onChange={(e) => setUrl(e.target.value)}
            value={url}
            type="text"
            name="url"
            id="url"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="http://127.0.0.1:1031"
            required
          />

          <label className="block mt-4 text-sm font-medium text-gray-900 dark:text-white">
            Want to run your own node? Click&nbsp;
            <Link
              to="https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme"
              target="_blank"
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              here
            </Link>
          </label>
        </div>
      </div>

      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Connect
        </button>
        <button
          onClick={closeModal}
          className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function SignInItem() {
  return (
    <li className="py-2">
      <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
        <Modal.ShowButton text="Sign in" id="sign-in-modal" />
      </label>
    </li>
  )
}

export function NotLoggedMenu() {
  useEffect(() => {
    initFlowbite()
  }, [])


  return (
    <>
      <Modal.Component title={modalTitle} content={ModalContent} id={modalId} />
      <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
        <SignInItem />
      </ul>
    </>
  )
}

function WalletItem() {
  return (
    <li className="py-2">
      <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
        <Drawer.ShowDrawer text="Wallet" id="wallet-drawer" />
      </label>
    </li>
  )
}

const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Item({ dest }: { dest: string }) {
  return (
    <Link to={`/${dest}`} className="flex items-center space-x-3 rtl:space-x-reverse">
      <span className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
        {capitalizeFirstLetter(dest)}
      </span>
    </Link>
  )
}

export function LoggedInMenu() {
  return (
    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
      <Item dest={"mine"} />
      <Item dest={"mint"} />
      <WalletItem />
    </ul>
  )
}

function NavbarDropdownButton() {
  return (
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
  )
}

export function Logo({ name = "Bitcoin Computer NFT" }) {
  const navigate = useNavigate()
  return (
    <Link
      to={`/`}
      onClick={() => {
        navigate(`/`)
        window.location.reload()
      }}
      className="flex items-center space-x-3 rtl:space-x-reverse"
    >
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
          <NavbarDropdownButton />
          <div className="hidden w-full md:block md:w-auto" id="navbar-dropdown">
            {Auth.isLoggedIn() ? <LoggedInMenu /> : <NotLoggedMenu />}
          </div>
        </div>
      </nav>
    </>
  )
}
