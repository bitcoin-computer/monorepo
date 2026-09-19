import { Dispatch, useEffect, useRef, useState } from 'react'
import { Computer } from '@bitcoin-computer/lib'
import { initFlowbite } from 'flowbite'
import { HiRefresh } from 'react-icons/hi'
import { Modal } from './Modal'
import type { Chain, Network, ModuleStorageType } from './common/types'
import {
  asNonEmpty,
  compactUndefined,
  getEnv,
  validChain,
  validModuleStorageType,
  validNetwork,
  validPath,
  validUrl,
} from './common/utils'

export type TBCChain = 'LTC' | 'BTC' | 'PEPE' | 'DOGE'
export type TBCNetwork = 'testnet' | 'mainnet' | 'regtest'
export type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr'

export type ComputerOptions = Partial<{
  chain: TBCChain
  mnemonic: string
  network: TBCNetwork
  passphrase: string
  path: string
  url: string
  satPerByte: number
  addressType: AddressType
  moduleStorageType: ModuleStorageType
  thresholdBytes: number
  mode: 'prod' | 'dev'
}>

function isLoggedIn(): boolean {
  return !!asNonEmpty(localStorage.getItem('BIP_39_KEY'))
}

function logout() {
  localStorage.removeItem('BIP_39_KEY')
  localStorage.removeItem('CHAIN')
  localStorage.removeItem('NETWORK')
  localStorage.removeItem('PATH')
  localStorage.removeItem('URL')
  window.location.href = '/'
}

function getCoinType(chain: string = 'LTC', network: string = 'regtest'): number {
  if (['testnet', 'regtest'].includes(network)) return 1

  if (chain === 'BTC') return 0
  if (chain === 'LTC') return 2
  if (chain === 'DOGE') return 3
  if (chain === 'PEPE') return 3434
  if (chain === 'BCH') return 145
  if (chain === 'WOJAK') return 20760

  throw new Error(`Unsupported chain ${chain} or network ${network}`)
}

function getBip44Path({ purpose = 44, coinType = 1, account = 0 } = {}) {
  return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`
}

function getPath({ chain, network }: { chain?: Chain; network?: Network }): string {
  return getBip44Path({ coinType: getCoinType(chain, network) })
}

function envThenStorage(name: string, validate: (value: unknown) => string | undefined) {
  return validate(getEnv(name)) || validate(localStorage.getItem(name))
}

function storageThenEnv(name: string, validate: (value: unknown) => string | undefined) {
  return validate(localStorage.getItem(name)) || validate(getEnv(name))
}

function persistUserOrClear(key: string, userValue: string | undefined, envIsValid: boolean) {
  if (!envIsValid && userValue) localStorage.setItem(key, userValue)
  else localStorage.removeItem(key)
}

function loggedOutConfiguration() {
  return compactUndefined({
    chain: validChain(getEnv('CHAIN')) as Chain | undefined,
    network: validNetwork(getEnv('NETWORK')) as Network | undefined,
    url: validUrl(getEnv('URL')),
    path: validPath(getEnv('PATH')),
  })
}

function loggedInConfiguration() {
  return compactUndefined({
    mnemonic: asNonEmpty(localStorage.getItem('BIP_39_KEY')),
    // Node/deploy settings: env wins when valid so a new deploy is not stuck on stale storage.
    chain: envThenStorage('CHAIN', validChain) as Chain | undefined,
    network: envThenStorage('NETWORK', validNetwork) as Network | undefined,
    url: envThenStorage('URL', validUrl),
    // Path is user-owned: valid login value first, then env, else omit (Computer default path).
    path: storageThenEnv('PATH', validPath),
    moduleStorageType: envThenStorage(
      'MODULE_STORAGE_TYPE',
      validModuleStorageType,
    ) as ModuleStorageType | undefined,
  })
}

function getComputer(options: ComputerOptions = {}): Computer {
  const defaultConfiguration = isLoggedIn() ? loggedInConfiguration() : loggedOutConfiguration()
  return new Computer(
    compactUndefined({ ...defaultConfiguration, ...options }) as ComputerOptions,
  )
}

function MnemonicInput({
  mnemonic,
  setMnemonic,
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
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-3 focus:border-blue-3 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
            onChange={() => setChain('LTC')}
            checked={chain === 'LTC'}
            id="chain-ltc"
            type="radio"
            name="chain"
            value="LTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-4 dark:focus:ring-blue-3 dark:focus:bg-blue-3 dark:bg-gray-700 dark:border-gray-600"
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
            onChange={() => setChain('BTC')}
            checked={chain === 'BTC'}
            id="chain-btc"
            type="radio"
            name="chain"
            value="BTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-4 dark:focus:ring-blue-3 dark:focus:bg-blue-3 dark:bg-gray-700 dark:border-gray-600"
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
            onChange={() => setChain('PEPE')}
            id="chain-pepe"
            type="radio"
            name="chain"
            value="PEPE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-4 dark:focus:ring-blue-3 dark:bg-gray-700 dark:border-gray-600"
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
            onChange={() => setChain('DOGE')}
            id="chain-doge"
            type="radio"
            name="chain"
            value="DOGE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-4 dark:focus:ring-blue-3 dark:bg-gray-700 dark:border-gray-600"
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
            onChange={() => setNetwork('mainnet')}
            checked={network === 'mainnet'}
            id="network-mainnet"
            type="radio"
            name="network"
            value="Mainnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-4 dark:focus:ring-blue-3 dark:focus:bg-blue-3 dark:bg-gray-700 dark:border-gray-600"
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
            onChange={() => setNetwork('testnet')}
            checked={network === 'testnet'}
            id="network-testnet"
            type="radio"
            name="network"
            value="Testnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-4 dark:focus:ring-blue-3 dark:focus:bg-blue-3 dark:bg-gray-700 dark:border-gray-600"
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
            onChange={() => setNetwork('regtest')}
            checked={network === 'regtest'}
            id="network-regtest"
            type="radio"
            name="network"
            value="Regtest"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-4 dark:focus:ring-blue-3 dark:focus:bg-blue-3 dark:bg-gray-700 dark:border-gray-600"
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

function UrlInput({ url, setUrl }: { url: string; setUrl: Dispatch<string> }) {
  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Node Url
        </label>
      </div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-3 focus:border-blue-3 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      />
    </>
  )
}

function PathInput({ path, setPath }: { path: string; setPath: Dispatch<string> }) {
  return (
    <>
      <div className="flex justify-between">
        <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Path
        </label>
      </div>
      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-3 focus:border-blue-3 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        required
      />
    </>
  )
}

function LoginButton({
  mnemonic,
  chain,
  network,
  path,
  url,
  urlInputRef,
  onError,
}: {
  mnemonic: string
  chain: Chain | undefined
  network: Network | undefined
  path: string
  url: string | undefined
  urlInputRef: React.RefObject<HTMLInputElement>
  onError: (message: string | null) => void
}) {
  const login = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isLoggedIn()) {
      onError('A user is already logged in, please log out first.')
      return
    }
    if (mnemonic.length === 0) {
      onError("Please don't use an empty mnemonic string.")
      return
    }
    if (chain === undefined) {
      onError('Please select a chain.')
      return
    }
    if (network === undefined) {
      onError('Please select a network.')
      return
    }
    const envPath = validPath(getEnv('PATH'))
    const userPath = validPath(path)
    if (!envPath && !userPath) {
      onError("Path format must be in the form m/44'/0'/0'/0/0.")
      return
    }

    const envUrl = validUrl(getEnv('URL'))
    const userUrl = validUrl(urlInputRef.current?.value || url)
    if (!envUrl && !userUrl) {
      onError('Please enter a valid URL.')
      return
    }
    if (isLoggedIn()) return

    onError(null)
    localStorage.setItem('BIP_39_KEY', mnemonic)
    persistUserOrClear('CHAIN', chain, !!validChain(getEnv('CHAIN')))
    persistUserOrClear('NETWORK', network, !!validNetwork(getEnv('NETWORK')))
    persistUserOrClear('PATH', userPath, !!envPath)
    persistUserOrClear('URL', userUrl, !!envUrl)

    window.location.href = '/'
  }

  return (
    <button
      onClick={login}
      type="submit"
      className="w-full text-white bg-blue-3 hover:brightness-90 focus:ring-4 focus:outline-none focus:ring-blue-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-3 dark:hover:brightness-90 dark:focus:ring-blue-2"
    >
      Log In
    </button>
  )
}

function LoginForm() {
  const [mnemonic, setMnemonic] = useState<string>(() => new Computer().getMnemonic())
  const [chain, setChain] = useState<Chain | undefined>(
    validChain(getEnv('CHAIN')) as Chain | undefined,
  )
  const [network, setNetwork] = useState<Network | undefined>(
    validNetwork(getEnv('NETWORK')) as Network | undefined,
  )
  const [url, setUrl] = useState<string | undefined>(
    validUrl(getEnv('URL')) || 'http://localhost:1031',
  )
  const urlInputRef = useRef<HTMLInputElement>(null)
  const [path, setPath] = useState<string>(
    validPath(getEnv('PATH')) || getPath({ chain, network }),
  )
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <div className="max-w-sm mx-auto p-4 md:p-5 space-y-4">
        <div
          className="p-3 text-sm text-amber-800 border border-amber-300 rounded-lg bg-amber-50 dark:bg-gray-800 dark:text-amber-300 dark:border-amber-800"
          role="alert"
        >
          <p className="font-semibold mb-1">Non-custodial wallet</p>
          <p className="mb-2">
            Your mnemonic is stored only in this browser. We never hold your keys or can recover
            them for you.
          </p>
          <p>
            <strong className="font-semibold">Write down your mnemonic</strong> before you continue.
            Anyone with it can spend your funds; if you lose it, access is gone permanently.
          </p>
        </div>
        <form className="space-y-6">
          <div>
            <MnemonicInput mnemonic={mnemonic} setMnemonic={setMnemonic} />
            {!validChain(getEnv('CHAIN')) && <ChainInput chain={chain} setChain={setChain} />}
            {!validNetwork(getEnv('NETWORK')) && (
              <NetworkInput network={network} setNetwork={setNetwork} />
            )}
            {!validUrl(getEnv('URL')) && <UrlInput url={url || ''} setUrl={setUrl} />}
            {!validPath(getEnv('PATH')) && <PathInput path={path} setPath={setPath} />}
          </div>
          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          ) : null}
        </form>
      </div>
      <div className="max-w-sm mx-auto flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <LoginButton
          mnemonic={mnemonic}
          chain={chain}
          network={network}
          url={url}
          path={path}
          urlInputRef={urlInputRef}
          onError={setFormError}
        />
      </div>
    </>
  )
}

function LoginModal() {
  return <Modal.Component title="Sign in" content={LoginForm} id="sign-in-modal" hideClose={true} />
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
  LoginModal,
}
