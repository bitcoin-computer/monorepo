import { Dispatch, useEffect, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import { SnackBar } from "./SnackBar"
import { Modal } from "./Modal"
import { initFlowbite } from "flowbite"
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
  if (chain === "BCH") return 145

  throw new Error(`Unsupported chain ${chain} or network ${network}`)
}

function getBip44Path({ purpose = 44, coinType = 2, account = 0 } = {}) {
  return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`
}

function getPath(chain: string, network: string): string {
  return getBip44Path({ coinType: getCoinType(chain, network) })
}

function getUrl(chain: Chain, network: Network) {
  const index = `REACT_APP_${chain.toUpperCase()}_${network.toUpperCase()}_URL`
  const url = process.env[index]
  if (typeof url === "undefined") throw new Error("Cannot find url")
  return url
}

function defaultConfiguration() {
  const chain = (localStorage.getItem("CHAIN") as Chain) || "LTC"
  const network = (localStorage.getItem("NETWORK") as Network) || "regtest"
  const url = getUrl(chain, network)
  return { chain, network, url }
}

function browserConfiguration() {
  const keys = ["BIP_39_KEY", "CHAIN", "NETWORK", "PATH", "URL"]
  const someKeyIsUndefined = keys.some((key) => typeof localStorage.getItem(key) === "undefined")
  if (someKeyIsUndefined) throw new Error("Something went wrong, please log out and log in again")

  return {
    mnemonic: localStorage.getItem("BIP_39_KEY"),
    chain: localStorage.getItem("CHAIN") as Chain,
    network: localStorage.getItem("NETWORK") as Network,
    path: localStorage.getItem("PATH"),
    url: localStorage.getItem("URL"),
  }
}

function getComputer(): Computer {
  const configuration: any = isLoggedIn() ? browserConfiguration() : defaultConfiguration()
  return new Computer(configuration)
}

function MnemonicInput({
  mnemonic,
  setMnemonic,
}: {
  mnemonic: string
  setMnemonic: Dispatch<string>
}) {
  const generateMnemonic = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setMnemonic(new Computer().getMnemonic())
  }

  return (
    <>
      <div className="flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          BIP 39 Mnemonic
        </label>
        <button
          onClick={generateMnemonic}
          className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Generate in Browser
        </button>
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

function ChainInput({ chain, setChain }: { chain: Chain; setChain: Dispatch<Chain> }) {
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
  setNetwork,
}: {
  network: Network
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

function PathInput({
  chain,
  network,
  path,
  setPath,
}: {
  chain: string
  network: string
  path: string
  setPath: Dispatch<string>
}) {
  const setDefaultPath = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setPath(getPath(chain, network))
  }

  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Path</label>
        <button
          onClick={setDefaultPath}
          className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Update BIP 44 Path
        </button>
      </div>
      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      />
    </>
  )
}

function UrlInput({
  chain,
  network,
  url,
  setUrl,
}: {
  chain: Chain
  network: Network
  url: string
  setUrl: Dispatch<string>
}) {
  const setDefaultUrl = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setUrl(getUrl(chain, network))
  }

  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Node Url
        </label>
        <button
          onClick={setDefaultUrl}
          className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Update Node Url
        </button>
      </div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      />
    </>
  )
}

function LoginButton({ mnemonic, chain, network, path, url }: any) {
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")

  const login = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      if (isLoggedIn()) throw new Error("A user is already logged in, please log out first.")

      if (mnemonic.length === 0) throw new Error("Please don't use an empty mnemonic string.")

      new Computer({ mnemonic, chain, network, path, url })
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message)
        setSuccess(false)
        setShow(true)
      }
      return
    }
    localStorage.setItem("BIP_39_KEY", mnemonic)
    localStorage.setItem("CHAIN", chain)
    localStorage.setItem("NETWORK", network)
    localStorage.setItem("PATH", path)
    localStorage.setItem("URL", url)

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
      {show && <SnackBar message={message} success={success} setShow={setShow} />}
    </>
  )
}

function LoginForm() {
  const [mnemonic, setMnemonic] = useState<string>("")
  const [chain, setChain] = useState<Chain>("LTC")
  const [network, setNetwork] = useState<Network>("regtest")
  const [path, setPath] = useState<string>(getPath(chain, network))
  const [url, setUrl] = useState<string>(getUrl(chain, network))

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <div className="p-4 md:p-5 space-y-4">
        <form className="space-y-6">
          <div>
            <MnemonicInput mnemonic={mnemonic} setMnemonic={setMnemonic} />
            <ChainInput chain={chain} setChain={setChain} />
            <NetworkInput network={network} setNetwork={setNetwork} />
            <PathInput chain={chain} network={network} path={path} setPath={setPath} />
            <UrlInput chain={chain} network={network} url={url} setUrl={setUrl} />
          </div>
        </form>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <LoginButton mnemonic={mnemonic} chain={chain} network={network} path={path} url={url} />
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
  getUrl,
  defaultConfiguration,
  browserConfiguration,
  getComputer,
  LoginForm,
  LoginModal,
}
