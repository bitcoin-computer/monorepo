import { Dispatch, useEffect, useRef, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import { initFlowbite } from "flowbite"
import { HiRefresh } from "react-icons/hi"
import { useUtilsComponents } from "./UtilsContext"
import { Modal } from "./Modal"
import type { Chain, Network } from "./common/types"

function isLoggedIn(): boolean {
  return !!localStorage.getItem("BIP_39_KEY")
}

function logout() {
  localStorage.removeItem("BIP_39_KEY")
  localStorage.removeItem("CHAIN")
  localStorage.removeItem("NETWORK")
  localStorage.removeItem("PATH")
  localStorage.removeItem("URL")
  window.location.href = "/"
}

function getCoinType(chain: string, network: string): number {
  if (["testnet", "regtest"].includes(network)) return 1

  if (chain === "BTC") return 0
  if (chain === "LTC") return 2
  if (chain === "DOGE") return 3
  if (chain === "PEPE") return 3434
  if (chain === "BCH") return 145

  throw new Error(`Unsupported chain ${chain} or network ${network}`)
}

function getBip44Path({ purpose = 44, coinType = 2, account = 0 } = {}) {
  return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`
}

function getEnv(name: string) {
  return (typeof process !== "undefined" && process.env[`REACT_APP_${name}`]) || import.meta.env[`VITE_${name}`]
}

function loggedOutConfiguration() {
  return {
    chain: getEnv('CHAIN') as Chain,
    network: getEnv('NETWORK') as Network,
    url: getEnv('URL')
  }
}

function loggedInConfiguration() {
  return {
    mnemonic: localStorage.getItem("BIP_39_KEY"),
    chain: (localStorage.getItem("CHAIN") || getEnv('CHAIN')) as Chain,
    network: (localStorage.getItem("NETWORK") || getEnv('NETWORK')) as Network,
    url: localStorage.getItem("URL") || getEnv('URL')
  }
}

function getComputer(): Computer {
  return new Computer(isLoggedIn() ? loggedInConfiguration() : loggedOutConfiguration())
}

function MnemonicInput({
  mnemonic,
  setMnemonic
}: {
  mnemonic: string
  setMnemonic: Dispatch<string>
}) {
  return (
    <>
      <div className="flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          BIP 39 Mnemonic
        </label>
        <HiRefresh
          onClick={() => setMnemonic(new Computer().getMnemonic())}
          className="w-4 h-4 ml-2 text-sm font-medium text-gray-900 dark:text-white inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
        />
      </div>
      <input
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        required
      />
    </>
  )
}

function ChainInput({ chain, setChain }: { chain: Chain | undefined; setChain: Dispatch<Chain> }) {
  return (
    <>
      <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Chain
      </label>
      <fieldset className="flex">
        <legend className="sr-only">Chain</legend>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("LTC")}
            checked={chain === "LTC"}
            id="chain-ltc"
            type="radio"
            name="chain"
            value="LTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-ltc"
            className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            LTC
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("BTC")}
            checked={chain === "BTC"}
            id="chain-btc"
            type="radio"
            name="chain"
            value="BTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-btc"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            BTC
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("PEPE")}
            id="chain-pepe"
            type="radio"
            name="chain"
            value="PEPE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-pepe"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            PEPE
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("DOGE")}
            id="chain-doge"
            type="radio"
            name="chain"
            value="DOGE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            disabled
          />
          <label
            htmlFor="chain-doge"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            DOGE
          </label>
        </div>
      </fieldset>
    </>
  )
}

function NetworkInput({
  network,
  setNetwork
}: {
  network: Network | undefined
  setNetwork: Dispatch<Network>
}) {
  return (
    <>
      <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Network
      </label>
      <fieldset className="flex">
        <legend className="sr-only">Network</legend>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork("mainnet")}
            checked={network === "mainnet"}
            id="network-mainnet"
            type="radio"
            name="network"
            value="Mainnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-mainnet"
            className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Mainnet
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork("testnet")}
            checked={network === "testnet"}
            id="network-testnet"
            type="radio"
            name="network"
            value="Testnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-testnet"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Testnet
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork("regtest")}
            checked={network === "regtest"}
            id="network-regtest"
            type="radio"
            name="network"
            value="Regtest"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-regtest"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Regtest
          </label>
        </div>
      </fieldset>
    </>
  )
}

function UrlInput({ urlInputRef }: { urlInputRef: React.RefObject<HTMLInputElement> }) {
  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Node Url
        </label>
      </div>
      <input
        ref={urlInputRef}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      />
    </>
  )
}

function LoginButton({ mnemonic, chain, network, path, url, urlInputRef }: any) {
  const { showSnackBar } = useUtilsComponents()

  const login = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isLoggedIn()) showSnackBar("A user is already logged in, please log out first.", false)
    if (mnemonic.length === 0) showSnackBar("Please don't use an empty mnemonic string.", false)
    localStorage.setItem("BIP_39_KEY", mnemonic)
    localStorage.setItem("CHAIN", chain)
    localStorage.setItem("NETWORK", network)
    localStorage.setItem("PATH", path)
    localStorage.setItem("URL", urlInputRef.current?.value || url)

    window.location.href = "/"
  }

  return (
    <>
      <button
        onClick={login}
        type="submit"
        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Log In
      </button>
      {/* {show && <SnackBar message={message} success={success} hideSnackBar={setShow} />} */}
    </>
  )
}

function LoginForm() {
  const [mnemonic, setMnemonic] = useState<string>(new Computer().getMnemonic())
  const [chain, setChain] = useState<Chain | undefined>(
    ((typeof process !== "undefined" && process.env.REACT_APP_CHAIN) ||
      import.meta.env.VITE_CHAIN) as Chain | undefined
  )
  const [network, setNetwork] = useState<Network | undefined>(
    ((typeof process !== "undefined" && process.env.REACT_APP_NETWORK) ||
      import.meta.env.VITE_NETWORK) as Network | undefined
  )
  const [url] = useState<string | undefined>(
    (typeof process !== "undefined" && process.env.REACT_APP_URL) || import.meta.env.VITE_URL
  )
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <div className="max-w-sm mx-auto p-4 md:p-5 space-y-4">
        <form className="space-y-6">
          <div>
            <MnemonicInput mnemonic={mnemonic} setMnemonic={setMnemonic} />
            {!chain && <ChainInput chain={chain} setChain={setChain} />}
            {!network && <NetworkInput network={network} setNetwork={setNetwork} />}
            {!url && <UrlInput urlInputRef={urlInputRef} />}
          </div>
        </form>
      </div>
      <div className="max-w-sm mx-auto flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <LoginButton
          mnemonic={mnemonic}
          chain={chain}
          network={network}
          url={url}
          urlInputRef={urlInputRef}
        />
      </div>
    </>
  )
}

function LoginModal() {
  return <Modal.Component title="Sign in" content={LoginForm} id="sign-in-modal" />
}

export const Auth = {
  isLoggedIn,
  logout,
  getCoinType,
  getBip44Path,
  defaultConfiguration: loggedOutConfiguration,
  browserConfiguration: loggedInConfiguration,
  getComputer,
  LoginForm,
  LoginModal
}
