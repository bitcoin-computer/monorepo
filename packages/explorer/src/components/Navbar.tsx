import { Link } from "react-router-dom"
import { Modal, Auth, UtilsContext, Drawer } from "@bitcoin-computer/components"
import { SearchBar } from "./SearchBar"
import { useEffect, useState } from "react"
import { initFlowbite } from "flowbite"
import { Chain, Network } from "../types/common"

const modalTitle = "Connect to Node"
const modalId = "unsupported-config-modal"

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

function formatChainAndNetwork(chain: string, network: string) {
  const prefix = {
    mainnet: "",
    testnet: "t",
    regtest: "r",
  }[network]
  return `${prefix}${chain}`
}

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

function NotLoggedMenu() {
  const [dropDownLabel, setDropDownLabel] = useState<string>("LTC")
  const { showSnackBar } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    initFlowbite()

    const { chain, network } = Auth.defaultConfiguration()
    setDropDownLabel(formatChainAndNetwork(chain, network))
  }, [])

  const setChainAndNetwork = (chain: Chain, network: Network) => {
    try {
      localStorage.setItem("URL", Auth.getUrl(chain, network))
      localStorage.setItem("CHAIN", chain)
      localStorage.setItem("NETWORK", network)
      setDropDownLabel(formatChainAndNetwork(chain, network))
      window.location.href = "/"
    } catch (err) {
      showSnackBar("Error setting chain and network", false)
      Modal.get(modalId).show()
    }
  }

  return (
    <>
      <Modal.Component title={modalTitle} content={ModalContent} id={modalId} />
      <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
        <li className="py-2">
          <button
            id="dropdownNavbarLink"
            data-dropdown-toggle="dropdownNavbar"
            className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
          >
            {dropDownLabel}
            <svg
              className="w-2.5 h-2.5 ms-2.5"
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
          </button>
          <div
            id="dropdownNavbar"
            className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-400 cursor-pointer"
              aria-labelledby="dropdownLargeButton"
            >
              <li>
                <div
                  onClick={() => setChainAndNetwork("LTC", "mainnet")}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Litecoin
                </div>
              </li>
              <li>
                <div
                  onClick={() => setChainAndNetwork("LTC", "testnet")}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Litecoin Testnet
                </div>
              </li>
              <li>
                <div
                  onClick={() => setChainAndNetwork("LTC", "regtest")}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Litecoin Regtest
                </div>
              </li>
            </ul>
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-400 cursor-pointer"
              aria-labelledby="dropdownLargeButton"
            >
              <li>
                <div
                  onClick={() => setChainAndNetwork("BTC", "mainnet")}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Bitcoin
                </div>
              </li>
              <li>
                <div
                  onClick={() => setChainAndNetwork("BTC", "testnet")}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Bitcoin Testnet
                </div>
              </li>
              <li>
                <div
                  onClick={() => setChainAndNetwork("BTC", "regtest")}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Bitcoin Regtest
                </div>
              </li>
            </ul>
          </div>
        </li>

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
