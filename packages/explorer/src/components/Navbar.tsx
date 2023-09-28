import { Computer } from "@bitcoin-computer/lib"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"

export default function Navbar(props: {
  computer: Computer
  setIsOpen: Dispatch<SetStateAction<boolean>>
  setShowLogin: Dispatch<SetStateAction<boolean>>
}) {
  const navigate = useNavigate()
  const { setIsOpen, computer, setShowLogin } = props
  const [transaction, setTransactionInput] = useState("")
  const [showNavBar, setShowNavBar] = useState(true)
  const [dropDownHidden, setDropDownHidden] = useState(true)

  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("BIP_39_KEY") !== null)

  const logout = () => {
    localStorage.removeItem("BIP_39_KEY")
    localStorage.removeItem("CHAIN")
    setTransactionInput("")
    setLoggedIn(false)
    setIsOpen(false)
    window.location.href = "/"
  }

  useEffect(() => {
    setLoggedIn(localStorage.getItem("BIP_39_KEY") !== null)
  }, [loggedIn, computer])

  const search = async (event: any) => {
    var code = event.keyCode || event.which
    if (code === 13) {
      if (transaction === "") {
        navigate("/")
      } else if (transaction.includes(":")) {
        navigate(`/outputs/${transaction}`)
      } else {
        navigate(`/transactions/${transaction}`)
      }
    }
  }

  const openMenu = (evt: any) => {
    evt.preventDefault()
    setShowNavBar(!showNavBar)
  }

  const openDrowdown = (evt: any) => {
    evt.preventDefault()
    setDropDownHidden(!dropDownHidden)
  }

  return (
    <nav className="bg-white border-gray-200 rounded dark:bg-gray-900">
      <div className="flex items-center justify-between mx-auto">
        <a href="/" className="flex items-center">
          <img src="/logo.png" className="h-8 mr-3 sm:h-9" alt="Bitcoin Computer" />
        </a>
        <div className="flex grow md:order-1">
          <>
            <div className="relative grow md:block">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Search icon</span>
              </div>
              <input
                type="search"
                id="search-navbar"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search Transaction"
                value={transaction}
                onChange={(e) => setTransactionInput(e.target.value)}
                onKeyDown={(e) => search(e)}
              />
            </div>
            <button
              data-collapse-toggle="navbar-search"
              type="button"
              className="inline-flex items-center p-2 ml-4 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-search"
              aria-expanded="false"
              onClick={openMenu}
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </>
        </div>
        <div
          className="absolute items-center justify-between w-full mt-60 md:flex md:w-auto md:order-2 md:mt-0 md:relative "
          id="navbar-search"
          hidden={showNavBar}
        >
          <ul className="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {!loggedIn && (
              <li>
                <button
                  className="block py-2 pl-3 pr-4 text-gray-700 rounded md:bg-transparent hover:text-gray-900 cursor-pointer md:p-0 dark:text-white"
                  onClick={() => setShowLogin(true)}
                >
                  Sign In
                </button>
              </li>
            )}
            {loggedIn && (
              <>
                <li
                  onMouseEnter={() => setDropDownHidden(false)}
                  onMouseLeave={() => setDropDownHidden(true)}
                >
                  <button
                    id="dropdownNavbarLink"
                    data-dropdown-toggle="dropdownNavbar"
                    className="flex items-center justify-between w-full py-2 pl-3 pr-4 font-medium text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-gray-400 dark:hover:text-white dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                    onClick={openDrowdown}
                  >
                    <svg
                      height="1.4rem"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      ></path>
                    </svg>
                    <svg
                      className="w-5 h-5 ml-1"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                  <div
                    id="dropdownNavbar"
                    className="z-10 absolute font-normal bg-white divide-y divide-gray-100 rounded-lg w-44 dark:bg-gray-700 dark:divide-gray-600"
                    hidden={dropDownHidden}
                  >
                    <ul
                      className="py-2 text-sm text-gray-700 dark:text-gray-400"
                      aria-labelledby="dropdownLargeButton"
                    >
                      <li>
                        <Link
                          to="/blocks"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded md:bg-transparent hover:text-gray-900 cursor-pointer dark:text-white"
                        >
                          Blocks
                        </Link>
                      </li>
                      <li>
                        <NavLink
                          to="/"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded md:bg-transparent hover:text-gray-900 cursor-pointer dark:text-white"
                          onClick={() => {
                            logout()
                          }}
                        >
                          Log Out
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>

                <li>
                  <span
                    onClick={() => {
                      setIsOpen(true)
                    }}
                    className="block py-2 pl-3 pr-4 text-gray-700 rounded md:bg-transparent hover:text-gray-900 cursor-pointer md:p-0 dark:text-white"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      height="1.4rem"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                      ></path>
                    </svg>
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
