import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

export default function NavbarNew({ setIsOpen, computer, setShowLogin }) {
  const [publicKeyInput, setPublicKeyInput] = useState("")
  const [showNavBar, setShowNavBar] = useState(true)
  const [dropDownHidden, setDropDownHidden] = useState(true)

  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("BIP_39_KEY")
    localStorage.removeItem("CHAIN")
    setPublicKeyInput("")
    setLoggedIn(false)
    setIsOpen(false)
    window.location.reload()
  }
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("BIP_39_KEY") !== null)

  useEffect(() => {
    setLoggedIn(localStorage.getItem("BIP_39_KEY") !== null)
  }, [loggedIn, computer])

  const search = (event) => {
    var code = event.keyCode || event.which
    if (code === 13) {
      navigate('/nfts', { search: new URLSearchParams({ publicKey: publicKeyInput }).toString() });
      window.location.reload()
    }
  }

  const openMenu = (evt) => {
    evt.preventDefault()
    setShowNavBar(!showNavBar)
  }

  const openDrowdown = (evt) => {
    evt.preventDefault()
    setDropDownHidden(!dropDownHidden)
  }

  return (
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
      <div className="flex items-center justify-between mx-auto">
        <a href="/" className="flex items-center">
          <img src="/logo.png" className="h-8 mr-3 sm:h-9" alt="Flowbite Logo" />
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
                placeholder="Search Public Key"
                value={publicKeyInput}
                onChange={(e) => setPublicKeyInput(e.target.value)}
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
            <li>
              <NavLink
                to="/art/mint"
                className="block py-2 pl-3 pr-4 text-gray-700 rounded md:bg-transparent hover:text-gray-900 cursor-pointer md:p-0 dark:text-white"
                onClick={() => setPublicKeyInput("")}
              >
                Mint
              </NavLink>
            </li>
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
                Mine
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
                className="z-10 absolute font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
                hidden={dropDownHidden}
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-400"
                  aria-labelledby="dropdownLargeButton"
                >
                  <li>
                    <NavLink
                      to={ computer ? `nfts?${new URLSearchParams({publicKey: computer.getPublicKey()}).toString()}` : '#'}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded md:bg-transparent hover:text-gray-900 cursor-pointer dark:text-white"
                    >
                      Nfts
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/payments"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded md:bg-transparent hover:text-gray-900 cursor-pointer dark:text-white"
                      onClick={() => setPublicKeyInput("")}
                    >
                      Payments
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/offers"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded md:bg-transparent hover:text-gray-900 cursor-pointer dark:text-white"
                      onClick={() => setPublicKeyInput("")}
                    >
                      Offers
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/royalties"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded md:bg-transparent hover:text-gray-900 cursor-pointer dark:text-white"
                      onClick={() => setPublicKeyInput("")}
                    >
                      Royalties
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded md:bg-transparent hover:text-gray-900 cursor-pointer dark:text-white"
                      onClick={() => {
                        if (loggedIn) {
                          logout()
                        } else {
                          setShowLogin(true)
                        }
                      }}
                    >
                      {loggedIn ? "Log Out" : "Log In"}
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
                Wallet
              </span>
            </li>
            {/* <li>
              <button
                onClick={() => {
                  if (loggedIn) {
                    logout();
                  } else {
                    setShowLogin(true);
                  }
                }}
                type="button"
                className="block py-2 pl-3 pr-4 text-gray-700 rounded md:bg-transparent hover:text-gray-900 cursor-pointer md:p-0 dark:text-white"
              >
                {loggedIn ? "Log Out" : "Log In"}
              </button>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  )
}
