import { NavLink, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Navbar({ setIsOpen, computer }) {
  const [publicKeyInput, setPublicKeyInput] = useState("")
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem("BIP_39_KEY")
    localStorage.removeItem("CHAIN")
    setPublicKeyInput("")
    setLoggedIn(false)
    setIsOpen(false)
    navigate("/auth/login")
  }
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("BIP_39_KEY") !== null)
  const [logInPage, setLogInPage] = useState(false)

  useEffect(() => {
    setLoggedIn(localStorage.getItem("BIP_39_KEY") !== null)
    if (window.location.pathname === "/auth/login") {
      setLogInPage(true)
    } else {
      setLogInPage(false)
    }
  }, [loggedIn, computer])

  const search = (event) => {
    var code = event.keyCode || event.which
    if (code === 13) {
      navigate(`/${publicKeyInput}`)
      window.location.reload()
    }
  }
  const myArts = () => {
    setPublicKeyInput("")
  }
  return (
    <div>
      <nav className="bg-white fixed w-full z-20 top-0 left-0 border-b border-gray-200">
        <div className="!p-0 w-full grid grid-cols-12 items-center mx-auto">
          <div className="col-span-1 ml-10 items-center">
            <a href="/">
              <img
                src="/logo.png"
                className="max-w-16 max-h-16  h-auto w-auto block"
                alt="Bitcoin Computer"
              />
            </a>
          </div>
          <div className="col-span-11 mr-10">
            <ul className="flex p-4 mt-4 justify-end rounded-lg mt-0 space-x-4 text-sm font-medium bg-white">
              {!logInPage && (
                <li className="grow">
                  <div className="relative mr-8">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="search"
                      className="block pl-10 p-2 w-full text-gray-900 bg-gray-50 border border-gray-300"
                      placeholder="Search Public Key"
                      value={publicKeyInput}
                      onChange={(e) => setPublicKeyInput(e.target.value)}
                      onKeyDown={(e) => search(e)}
                    />
                  </div>
                </li>
              )}
              {loggedIn && (
                <>
                  <li>
                    <NavLink
                      reloadDocument
                      to={`/${computer.getPublicKey()}`}
                      onClick={myArts}
                      className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                    >
                      My Art
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/art/mint"
                      className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                      onClick={() => setPublicKeyInput("")}
                    >
                      Mint
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/payments"
                      className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                      onClick={() => setPublicKeyInput("")}
                    >
                      Payments
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/offers"
                      className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                      onClick={() => setPublicKeyInput("")}
                    >
                      Offers
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/royalties"
                      className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                      onClick={() => setPublicKeyInput("")}
                    >
                      Royalties
                    </NavLink>
                  </li>
                  <li>
                    <span
                      onClick={() => { setIsOpen(true) }}
                      className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                    >
                      Wallet
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      type="button"
                      className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </li>
                </>
              )}
              {!loggedIn && !logInPage && (
                <li>
                  <button
                    onClick={() => {
                      setLogInPage(true)
                      navigate("/auth/login")
                    }}
                    type="button"
                    className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                  >
                    Log In
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  )
}
