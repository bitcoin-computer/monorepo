import { useContext, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { ComputerContext } from './ComputerContext'
import { inputsComponent, outputsComponent, transitionComponent } from './Transaction'

export function DecodedransactionComponent() {
  const location = useLocation()
  const params = useParams()
  const computer = useContext(ComputerContext)
  const [txnData, setTxnData] = useState<any | null>(null)
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null)
  const [transition, setTransition] = useState<any | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const txnDeserialized = BCTransaction.deserialize(params.txn as string)
      setTxnData(txnDeserialized)
      const { result } = await computer.rpcCall(
        'decoderawtransaction',
        `${txnDeserialized.toHex()} false`,
      )
      setRPCTxnData(result)
    }
    fetch()
  }, [computer, location, params.txn])

  useEffect(() => {
    const fetch = async () => {
      try {
        if (txnData) {
          setTransition(await computer.decode(txnData))
        }
      } catch (err) {
        if (err instanceof Error) {
          setTransition('')
        }
      }
    }
    fetch()
  }, [computer, txnData])

  return (
    <>
      <div className="pt-8">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Decoded Transaction</h1>

        {transition && transitionComponent({ transition })}

        {rpcTxnData?.vin && inputsComponent({ rpcTxnData, checkForSpentInput: true })}

        {rpcTxnData?.vout && outputsComponent({ rpcTxnData, txn: undefined })}
      </div>
    </>
  )
}

export const Decodedransaction = { Component: DecodedransactionComponent }
