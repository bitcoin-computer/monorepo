import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import Loader from "./Loader"

function Transaction(props: { computer: Computer }) {
  const location = useLocation()
  const { computer } = props
  const params = useParams()
  const [txn] = useState(params.txn)
  const [isLoading, setIsLoading] = useState(false)
  const [txnData, setTxnData] = useState<any | null>(null)
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null)
  const [transition, setTransition] = useState<any | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        // @ts-ignore
        const [res] = await computer.wallet.restClient.getRawTxs([txn])
        // @ts-ignore
        const tx = await computer.txFromHex({ hex: res })
        setTxnData(tx.tx)

        const { result } = await computer.rpcCall("getrawtransaction", `${txn} 2`)
        setRPCTxnData(result)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log('Error loading transaction', error)
      }
    }
    fetch()
  }, [computer, txn, location])

  useEffect(() => {
    const fetch = async () => {
      try {
        if (txnData) {
          setIsLoading(true)
          // @ts-ignore
          setTransition(await computer.decode(txnData))
          setIsLoading(false)
        }
      } catch (error) {
        setTransition(null)
        setIsLoading(false)
        console.log('Error decoding transaction', error)
      }
    }
    fetch()
  }, [computer, txnData])

  return (
    <>
      {txn && txnData && (
        <div className="pt-8">
          <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Transaction</h1>
          <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">{txn}</p>


          {transition && (
            <div>
              <h2 className="mb-2 text-4xl font-bold dark:text-white">Expression</h2>
              <div className="highlight">
                <pre className="mt-4 mb-8 p-6 overflow-x-auto leading-normal text-sm rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-blue-4">
                  <code className=" language-javascript" data-lang="javascript">
                  {transition.exp}
                  </code>
                </pre>
              </div>

              <h2 className="mb-2 text-4xl font-bold dark:text-white">Environment</h2>
              <div className="highlight">
                <pre className="mt-4 mb-8 p-6 overflow-x-auto leading-normal text-sm rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-blue-4">
                  <code className=" language-javascript" data-lang="javascript">
                  {JSON.stringify(transition.env, null, 2)}
                  </code>
                </pre>
              </div>

              {transition.mod && (<>
                <h2 className="mb-2 text-4xl font-bold dark:text-white">Module Specifier</h2>
                <div className="highlight">
                  <pre className="chroma language-javascript">
                    <code className=" language-javascript" data-lang="javascript">
                      {transition.mod}
                    </code>
                  </pre>
                </div></>)
              }
            </div>
          )}

          {rpcTxnData?.vin && (
            <div className="relative overflow-x-auto sm:rounded-lg">
              <h2 className="mb-2 text-4xl font-bold dark:text-white">Inputs</h2>

              <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Transaction Id
                    </th>
                    <th scope="col" className="px-6 py-3 break-keep">
                      Output Number
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Script
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rpcTxnData?.vin?.map((input: any) => {
                    return (
                      <tr key={input.txid} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4">
                          {input.txid}
                        </td>

                        <td className="px-6 py-4">
                          <Link to={`/outputs/${input.txid}:${input.vout}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                            #{input.vout}
                          </Link>
                        </td>

                        <td className="px-6 py-4 break-all">
                          {input.scriptSig.asm}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {rpcTxnData?.vout && (
            <div className="relative overflow-x-auto">
              <h2 className="mb-2 text-4xl font-bold dark:text-white">Outputs</h2>

              <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Number
                    </th>

                    <th scope="col" className="px-6 py-3">
                      Value
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Script PubKey
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rpcTxnData?.vout?.map((output: any) => {
                    return (
                      <tr key={output.n} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 break-all">
                          <Link to={`/outputs/${txn}:${output.n}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                            #{output.n}
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          {output.value}
                        </td>
                        <td className="px-6 py-4">
                          {output.scriptPubKey.type}
                        </td>
                        <td className="px-6 py-4 break-all">
                          {output.scriptPubKey.asm}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {isLoading && <Loader />}
        </div>
      )}
      {!txnData && !isLoading && (
        <div className="flex items-center pt-4 pt-2 w-full">
          <h1 className="text-md">Not a valid transaction hash {txn}</h1>
        </div>
      )}
    </>
  )
}

export default Transaction
