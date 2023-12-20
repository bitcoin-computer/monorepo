import { useEffect, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import SnackBar from "./SnackBar"
import { Config } from "../types/common"
import { Modal } from "./Modal"
import { Modal as ModalClass } from 'flowbite'
import { initFlowbite } from "flowbite"

export function getConf(): Config {
  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const network = localStorage.getItem("NETWORK") || ""
  const url = (network: string) => network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031"
  return ({ chain, network, mnemonic, url: url(network) })
}

export function getComputer(): Computer {
  const config = getConf()
  return new Computer(config)
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("BIP_39_KEY") && !!localStorage.getItem("CHAIN")
}

export function logout() {
  localStorage.removeItem("BIP_39_KEY")
  localStorage.removeItem("CHAIN")
  localStorage.removeItem("NETWORK")
  localStorage.removeItem("PATH")
  // localStorage.removeItem("PASSPHRASE")
  window.location.href = "/"
}

export function getCoinType(chain: string, network: string): number {
  if (['testnet', 'regtest'].includes(network)) return 1

  if (chain === 'BTC') return 0
  if (chain === 'LTC') return 2
  if (chain === 'DOGE') return 3
  if (chain === 'BCH') return 145

  throw new Error(`Unsupported chain ${chain} or network ${network}`)
}

export function getBip44Path({ purpose = 44, coinType = 2, account = 0 } = {}) {
  return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`
}

export function getPath(chain: string, network: string): string {
  return getBip44Path({ coinType: getCoinType(chain, network) })
}

export function Login() {
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [chain, setChain] = useState("LTC")
  const [network, setNetwork] = useState("regtest")
  const [path, setPath] = useState(getPath(chain, network))
  // const [passphrase, setPassphrase] = useState('')

  useEffect(() => {
    initFlowbite()
  }, [])

  const login = () => {
    if (!mnemonic) {
      setMessage("Please provide valid password")
      setSuccess(false)
      setShow(true)
      return
    }
    localStorage.setItem("BIP_39_KEY", mnemonic)
    localStorage.setItem("CHAIN", chain)
    localStorage.setItem("NETWORK", network)
    localStorage.setItem("PATH", path)
    // localStorage.setItem("PASSPHRASE", passphrase)

    const $targetEl = document.getElementById('sign-in-modal');
    const instanceOptions = { id: 'sign-in-modal', override: true }    
    const modal = new ModalClass($targetEl, {}, instanceOptions)
    modal.hide()
    window.location.href = "/"
  }

  const generateMnemonic = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setMnemonic(new Computer().getMnemonic())
  }
  
  const setDefaultPath = (e: React.MouseEvent<HTMLElement>) => {
    console.log('setDefaultPath', chain, network)
    e.stopPropagation()
    e.preventDefault()
    setPath(getPath(chain, network))
  }

  const body = () =>
    <form className="space-y-6" action="#">
      <div>
        {/* Mnemonic */}
        <div className="flex justify-between">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">BIP 39 Mnemonic</label>
          <button onClick={generateMnemonic} className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">Generate in Browser</button>
        </div>
        <input value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />

        {/* Chain */}
        <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Chain</label>
        <fieldset className="flex">
          <legend className="sr-only">Chain</legend>

          <div className="flex items-center mr-4">
            <input onChange={() => setChain('LTC')} checked={chain === 'LTC'} id="chain-ltc" type="radio" name="chain" value="LTC" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"/>
            <label htmlFor="chain-ltc" className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300">LTC</label>
          </div>

          <div className="flex items-center mr-4">
            <input onChange={() => setChain('BTC')} checked={chain === 'BTC'} id="chain-btc" type="radio" name="chain" value="BTC" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"/>
            <label htmlFor="chain-btc" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">BTC</label>
          </div>

          <div className="flex items-center mr-4">
            <input onChange={() => setChain('DOGE')} id="chain-doge" type="radio" name="chain" value="DOGE" className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600" disabled />
            <label htmlFor="chain-doge" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">DOGE</label>
          </div>
        </fieldset>

        {/* Network */}
        <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Network</label>
        <fieldset className="flex">
          <legend className="sr-only">Network</legend>

          <div className="flex items-center mr-4">
            <input onChange={() => setNetwork('mainnet')} checked={network === 'mainnet'} id="network-mainnet" type="radio" name="network" value="Mainnet" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="network-mainnet" className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300">Mainnet</label>
          </div>

          <div className="flex items-center mr-4">
            <input onChange={() => setNetwork('testnet')} checked={network === 'testnet'} id="network-testnet" type="radio" name="network" value="Testnet" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="network-testnet" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Testnet</label>
          </div>

          <div className="flex items-center mr-4">
            <input onChange={() => setNetwork('regtest')} checked={network === 'regtest'} id="network-regtest" type="radio" name="network" value="Regtest" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="network-regtest" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Regtest</label>
          </div>
        </fieldset>

        {/* Path */}
        <div className="mt-4 flex justify-between">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Path</label>
          <button onClick={setDefaultPath} className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">Update BIP 44 Path</button>
        </div>
        <input value={path} onChange={(e) => setPath(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" />

        {/* Passphrase */}
        {/* <div className="mt-4 flex justify-between">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Passphrase</label>
          <span className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Optional</span>
        </div>
        <input value={passphrase} onChange={(e) => setPassphrase(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /> */}


      </div>
    </form>

  const footer = () =>
    <button onClick={login} type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Log In</button>

  return <>
    <Modal title="Sign in" body={body} footer={footer} id="sign-in-modal"/>
    {show && <SnackBar message={message} success={success} setShow={setShow} />}
  </>
}
