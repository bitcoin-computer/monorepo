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
  const [expr, setExpr] = useState<any | null>(null)
  console.log("rpcTxnData", rpcTxnData)
  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        // @ts-ignore
        const [res] = await computer.wallet.restClient.getRawTxs([txn])

        const rpcRes = await computer.rpcCall("getrawtransaction", `${txn} 2`)
        // @ts-ignore
        const tx = await computer.txFromHex({ hex: res })
        setRPCTxnData(rpcRes.result)
        setTxnData(tx.tx)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log(error)
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
          const expr = await computer.decode(txnData)
          setExpr(expr)
          setIsLoading(false)
        }
      } catch (error) {
        setExpr(null)
        setIsLoading(false)
        console.log(error)
      }
    }
    fetch()
  }, [computer, txnData])

  return (
    <>
      {txn && txnData && (
        <div className="pt-4">
          {expr && (
            <div className="pb-8 pl-2">
              <h1 className="text-2xl font-bold pb-4">Expression</h1>
              <dl className="text-gray-900 divide-y divide-gray-200">
                <div className="flex flex-col pb-3">
                  <dt className="mb-1 text-gray-500 md:text-md ">Expression</dt>
                  <dd className="text-md">
                    <pre>{expr.exp}</pre>
                  </dd>
                </div>
                <div className="flex flex-col py-3">
                  <dt className="mb-1 text-gray-500 md:text-md">Mod</dt>
                  <dd className="text-md">{expr.mod}</dd>
                </div>
                <div className="flex flex-col pt-3">
                  <dt className="mb-1 text-gray-500 md:text-md">Env</dt>
                  <dd className="text-md">
                    <pre>{JSON.stringify(expr.env, null, 2)}</pre>
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {rpcTxnData?.vin && (
            <div className="relative overflow-x-auto sm:rounded-lg">
              <h1 className="text-2xl font-bold pb-4">
                {rpcTxnData.vin.length > 1 ? "Inputs" : "Input"}
              </h1>
              <table className="w-full text-sm text-left text-gray-500 ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Script Sig
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rpcTxnData?.vin?.map((input: any) => {
                    return (
                      <tr key={input.txid} className="bg-white border-b hover:bg-gray-50 ">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {input.scriptSig.asm}
                        </th>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {rpcTxnData?.vout && (
            <div className="relative overflow-x-auto sm:rounded-lg">
              <h1 className="text-2xl font-bold pb-4">
                {rpcTxnData.vout.length > 1 ? "Outputs" : "Output"}
              </h1>

              <table className="w-full text-sm text-left text-gray-500 ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
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
                      <tr
                        key={output.n}
                        className="bg-white border-b text-gray-900 hover:bg-gray-50 hover:text-bit-blue"
                      >
                        <Link to={`/outputs/${txn}:${output.n}`}>
                          <th scope="row" className="px-6 py-4 font-medium  whitespace-nowrap">
                            {output.value}
                          </th>
                          <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                            {output.scriptPubKey.type}
                          </th>
                          <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                            {output.scriptPubKey.asm}
                          </th>
                        </Link>
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
