import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ComputerContext, UtilsContext, bigIntToStr } from '@bitcoin-computer/components'

interface _DbOutput {
  rev: string
  address: string
  satoshis: bigint
  asm: string
  expHash?: string
  mod?: string
  isObject?: boolean
  previous?: string
  blockHash?: string
  blockHeight?: number
  blockIndex?: number
}

const UTXODisplay = () => {
  const params = useParams()
  const [utxos, setUtxos] = useState<_DbOutput[]>([])
  const [totalAmount, setTotalAmount] = useState<bigint>(0n)
  const [address] = useState<string>(params.address || '')
  const computer = useContext(ComputerContext)
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  // Extract address from URL params
  useEffect(() => {
    fetchUTXOs(address)
  }, [address])

  // Fetch UTXOs using bitcoind-rpc
  const fetchUTXOs = async (addr: string) => {
    try {
      showLoader(true)
      const response = await computer.db.wallet.restClient.getUTXOs({
        address: addr,
        verbosity: 1,
        isObject: false,
      })
      setUtxos(response)
      setTotalAmount(response.reduce((total, unspent) => total + unspent.satoshis, 0n))
    } catch (err: unknown) {
      showSnackBar(err instanceof Error ? err.message : 'Error occurred', true)
    } finally {
      showLoader(false)
    }
  }

  return (
    <>
      {utxos && utxos.length > 0 && (
        <>
          <div className="w-full">
            <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Address</h1>
            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
              {address}
            </p>
          </div>

          <div className="w-full">
            <h2 className="mb-2 text-4xl font-bold dark:text-white">Balance</h2>
            <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
              {bigIntToStr(totalAmount)} {computer.getChain()}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-4xl font-bold dark:text-white">UTXOs</h2>

            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      TXID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      VOUT
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount ({computer.getChain()})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {utxos.map((utxo, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {utxo.rev?.split(':')[0]}
                      </th>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {utxo.rev?.split(':')[1]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
                        {bigIntToStr(utxo.satoshis)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default UTXODisplay
