import { useContext, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { ComputerContext } from './ComputerContext'
import {
  classifyDecodeFailure,
  errorMessage,
  readOnChainMeta,
  type DecodeFailureKind,
} from './common/transition'
import {
  inputsComponent,
  outputsComponent,
  transitionComponent,
  TransitionUnavailable,
} from './Transaction'

type MyRouteParams = {
  txn?: string
}

export function DecodeTransactionComponent() {
  const location = useLocation()
  const params = useParams<MyRouteParams>()
  const computer = useContext(ComputerContext)
  const [txnData, setTxnData] = useState<any | null>(null)
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null)
  const [transition, setTransition] = useState<any | null>(null)
  const [decodeFailure, setDecodeFailure] = useState<DecodeFailureKind | null>(null)
  const [decodeError, setDecodeError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const txnDeserialized = BCTransaction.deserialize(params.txn as string)
      setTxnData(txnDeserialized)
      const result = await computer.rpc('decoderawtransaction', `${txnDeserialized.toHex()} false`)
      setRPCTxnData(result)
    }
    fetch()
  }, [computer, location, params.txn])

  useEffect(() => {
    const fetch = async () => {
      if (!txnData) return
      try {
        setTransition(await computer.decode(txnData))
        setDecodeFailure(null)
        setDecodeError(null)
      } catch (err) {
        setTransition(null)
        setDecodeFailure(classifyDecodeFailure(readOnChainMeta(txnData), err))
        setDecodeError(errorMessage(err) || 'Failed to decode transaction metadata.')
      }
    }
    fetch()
  }, [computer, txnData])

  const txId = typeof txnData?.getId === 'function' ? String(txnData.getId()) : undefined

  return (
    <>
      <div className="w-full space-y-4">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
            Transaction
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Decoded transaction</h1>
        </header>

        {transition ? transitionComponent({ transition }) : null}

        {!transition && decodeFailure ? (
          <TransitionUnavailable kind={decodeFailure} error={decodeError ?? undefined} txn={txId} />
        ) : null}

        {rpcTxnData?.vin && inputsComponent({ rpcTxnData, checkForSpentInput: true })}

        {rpcTxnData?.vout && outputsComponent({ rpcTxnData, txn: undefined })}
      </div>
    </>
  )
}

export const DecodeTransaction = { Component: DecodeTransactionComponent }
