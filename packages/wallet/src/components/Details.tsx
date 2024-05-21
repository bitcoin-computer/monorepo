import { useState } from "react"
import { Auth } from "@bitcoin-computer/components"
import { Computer } from "@bitcoin-computer/lib"

export const Details = () => {
  const [computer] = useState<Computer>(Auth.getComputer())

  const Mnemonic = ({ computer }: any) => {
    const [showMnemonic, setShowMnemonic] = useState(false)

    const Heading = () => <h4 className="mt-4 text-2xl font-bold dark:text-white">Mnemonic</h4>

    if (showMnemonic)
      return (
        <div className="mb-4">
          <Heading />
          <p className="font-mono text-gray-500 dark:text-gray-400">
            {/* @ts-ignore */}
            {computer.getMnemonic()}
          </p>

          <button
            onClick={() => setShowMnemonic(false)}
            className="font-mono text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
          >
            Hide
          </button>
        </div>
      )
    else
      return (
        <div className="mb-4">
          <Heading />
          <button
            onClick={() => setShowMnemonic(true)}
            className="font-mono text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
          >
            Show
          </button>
          <br />
        </div>
      )
  }

  return (
    <>
      <h2 className="mb-8 text-4xl font-bold dark:text-white">Wallet Details</h2>

      <h4 className="mt-4 text-2xl font-bold dark:text-white">Address</h4>
      <p className="font-mono text-gray-500 dark:text-gray-400">{computer.getAddress()}</p>

      <h4 className="mt-4 text-2xl font-bold dark:text-white">Public Key</h4>
      <p className="font-mono text-gray-500 dark:text-gray-400">{computer.getPublicKey()}</p>

      <h4 className="mt-4 text-2xl font-bold dark:text-white">Chain</h4>
      <p className="font-mono text-gray-500 dark:text-gray-400">{computer.getChain()}</p>

      <h4 className="mt-4 text-2xl font-bold dark:text-white">Network</h4>
      <p className="font-mono text-gray-500 dark:text-gray-400">{computer.getNetwork()}</p>

      <h4 className="mt-4 text-2xl font-bold dark:text-white">Path</h4>
      <p className="font-mono text-gray-500 dark:text-gray-400">
        {/* @ts-ignore */}
        {computer.getPath() as any}
      </p>

      <h4 className="mt-4 text-2xl font-bold dark:text-white">Url</h4>
      <p className="font-mono text-gray-500 dark:text-gray-400">
        {/* @ts-ignore */}
        {computer.getUrl() as any}
      </p>

      <Mnemonic computer={computer} />
    </>
  )
}
