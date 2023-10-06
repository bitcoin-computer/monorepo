import { Dispatch, SetStateAction, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import SnackBar from "./SnackBar"
import { Config } from "../types/common"

function Login(props: {
  config: Config
  setComputer: Dispatch<SetStateAction<Computer>>
  setShowLogin: Dispatch<SetStateAction<boolean>>
  showLogin: boolean
}) {
  const { config, setComputer, showLogin, setShowLogin } = props
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")

  const [password, setPassword] = useState("")

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
    localStorage.setItem("CHAIN", "LTC")
    const computer = new Computer({
      ...config,
      chain: "LTC",
      mnemonic: localStorage.getItem("BIP_39_KEY") as any,
    })
    setComputer(computer)
    setShowLogin(false)
  }

  return (<>
    {showLogin && (
      <div id="defaultModal" tabIndex={-1} aria-hidden="true" className="fixed flex justify-center items-center top-0 left-0 right-0 z-50 w-full p-4 items-center overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full bg-slate-600	bg-opacity-40">
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button onClick={closeModal} type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in</h3>
              <form className="space-y-6" action="#">
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sign in with a BIP 39 mnemonic code</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Don't have a mnemonic? <a href="https://iancoleman.io/bip39/" className="text-blue-700 hover:underline dark:text-blue-500">Generate one here</a>
                </div>
                <button onClick={login} type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Log In</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}
    {show && <SnackBar message={message} success={success} setShow={setShow} />}
    </>)
}

export default Login
