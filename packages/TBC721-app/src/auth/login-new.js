import React, { useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import SnackBar from "../components/util/snackBar"

function LoginNew(props) {
  const { config, setComputer, showLogin, setShowLogin } = props
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")

  // Clear the local storage
  localStorage.removeItem("BIP_39_KEY")
  localStorage.removeItem("CHAIN")

  // const navigate = useNavigate();
  const [password, setPassword] = useState("")
  const [chain, setChain] = useState("LTC")

  const closeModal = () => {
    setShowLogin(false)
  }

  const login = () => {
    if (!password) {
      setMessage("Please provide valid password")
      setSuccess(false)
      setShow(true)
      return
    }
    localStorage.setItem("BIP_39_KEY", password)
    localStorage.setItem("CHAIN", chain)
    console.log({
      ...config,
      chain: chain,
      mnemonic: localStorage.getItem("BIP_39_KEY"),
    })
    const computer = new Computer({
      ...config,
      chain: chain,
      mnemonic: localStorage.getItem("BIP_39_KEY"),
    })
    setComputer(computer)
    setShowLogin(false)
  }

  return (
    <>
      {showLogin && (
        <div
          id="defaultModal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed flex justify-center items-center top-0 left-0 right-0 z-50 w-full p-4 items-center overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full bg-slate-600	bg-opacity-40	"
        >
          <div className="relative w-full h-full max-w-xl md:h-auto m-auto">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Litecoin ART
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="defaultModal"
                  onClick={closeModal}
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <p className="font-sans">Don&apost forget to write down your seed.</p>
                  {/*link to generate BIP39 Seed*/}
                  <small>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://iancoleman.io/bip39/"
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                    >
                      Generate BIP39 Seed
                    </a>
                  </small>
                  {/*the input field for password*/}
                  <input
                    type="string"
                    placeholder="Password (BIP39 Seed)"
                    className="block  py-3 px-4 rounded-lg w-full border outline-none hover:shadow-inner"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/*dropdown to select the crypto*/}
                  <select
                    value={chain}
                    onChange={(e) => {
                      setChain(e.target.value)
                    }}
                    id="chain"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="LTC">LTC</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
                {/*login button*/}
                <div className="text-center mt-6">
                  <button
                    onClick={login}
                    className="py-3 w-64 text-xl text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {show && <SnackBar message={message} success={success} setShow={setShow} />}
    </>
  )
}

export default LoginNew
