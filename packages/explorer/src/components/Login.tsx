import { useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import SnackBar from "./SnackBar"
import { Config } from "../types/common"
import { Modal } from "./Modal"
import { Modal as ModalClass } from 'flowbite'

export function getConf(network: string): Config {
  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const url = (network: string) => network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031"
  return ({ chain, network, mnemonic, url: url(network) })
}

export function getComputer(): Computer {
  const config = getConf("regtest")
  return new Computer(config)
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("BIP_39_KEY") && !!localStorage.getItem("CHAIN")
}

export function Login() {
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [password, setPassword] = useState("")

  const login = () => {
    if (!password) {
      setMessage("Please provide valid password")
      setSuccess(false)
      setShow(true)
      return
    }
    localStorage.setItem("BIP_39_KEY", password)
    localStorage.setItem("CHAIN", "LTC")

    const $targetEl = document.getElementById('sign-in-modal');
    const instanceOptions = { id: 'sign-in-modal', override: true }    
    const modal = new ModalClass($targetEl, {}, instanceOptions)
    modal.hide()
  }

  const body = () =>
    <form className="space-y-6" action="#">
      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sign in with a BIP 39 mnemonic code</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
      </div>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
        Don't have a mnemonic? <a href="https://iancoleman.io/bip39/" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline dark:text-blue-500">Generate one here</a>
      </div>
    </form>

  const footer = () =>
    <button onClick={login} type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Log In</button>

  return <>
    <Modal title="Sign in" body={body} footer={footer} id="sign-in-modal"/>
    {show && <SnackBar message={message} success={success} setShow={setShow} />}
  </>
}
