import { Computer } from "@bitcoin-computer/lib"
import { initFlowbite } from "flowbite"
import { Dispatch, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { explorerURL } from "../config"
import { isValidHexadecimalPrivateKey } from "../utils"

export default function Navbar({
  setShowLogin,
  computer,
}: {
  setShowLogin: Dispatch<boolean>
  computer: Computer
}) {
  const [searchInput, setSearchInput] = useState("")
  const navigate = useNavigate()
  useEffect(() => {
    initFlowbite()
  }, [])

  const isLoggedIn = !!localStorage.getItem("BIP_39_KEY")

  const search = async (event: any) => {
    var code = event.keyCode || event.which
    if (code === 13) {
      if (searchInput === "") navigate("/")
      else if (searchInput.includes(":")) {
        try {
          // @ts-ignore
          await computer.load(searchInput)
          navigate(`/modules/${searchInput}`)
        } catch (error) {
          navigate(`/objects/${searchInput}`)
        }
      } else if (isValidHexadecimalPrivateKey(searchInput))
        navigate(`/?public-key=${searchInput.trim()}`)
      else navigate(`/transactions/${searchInput}`)
    }
  }

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to={`/`} className="flex items-center">
          <img src="/logo.png" className="h-8 mr-3 sm:h-9" alt="Bitcoin Computer" />
          <span className="self-center text-2xl font-extrabold whitespace-nowrap dark:text-white">
            TBC Wallet
          </span>
        </Link>
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
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

        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              {isLoggedIn ? (
                <Link
                  to={`${explorerURL}/playground`}
                  className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Play
                </Link>
              ) : (
                <button
                  className="block py-2 pl-3 pr-4 text-gray-700 rounded md:bg-transparent hover:text-gray-900 cursor-pointer md:p-0 dark:text-white"
                  onClick={() => setShowLogin(true)}
                >
                  Sign In
                </button>
              )}
            </li>
          </ul>
        </div>

        <div className="hidden md:block w-80" id="navbar-default">
          <ul className="font-medium w-80 flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <input
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => search(e)}
                type="text"
                id="search-navbar"
                className="block w-80 p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search..."
              />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
