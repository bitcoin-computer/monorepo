import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime'
import { useContext, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { ComputerContext } from './ComputerContext'
import { classifyDecodeFailure, errorMessage, readOnChainMeta } from './common/transition'
import {
  inputsComponent,
  outputsComponent,
  transitionComponent,
  TransitionUnavailable,
} from './Transaction'
export function DecodeTransactionComponent() {
  const location = useLocation()
  const params = useParams()
  const computer = useContext(ComputerContext)
  const [txnData, setTxnData] = useState(null)
  const [rpcTxnData, setRPCTxnData] = useState(null)
  const [transition, setTransition] = useState(null)
  const [decodeFailure, setDecodeFailure] = useState(null)
  const [decodeError, setDecodeError] = useState(null)
  useEffect(() => {
    const fetch = async () => {
      const txnDeserialized = BCTransaction.deserialize(params.txn)
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
  return _jsx(_Fragment, {
    children: _jsxs('div', {
      className: 'w-full space-y-4',
      children: [
        _jsxs('header', {
          children: [
            _jsx('p', {
              className:
                'text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5',
              children: 'Transaction',
            }),
            _jsx('h1', {
              className: 'text-xl sm:text-2xl font-semibold dark:text-white',
              children: 'Decoded transaction',
            }),
          ],
        }),
        transition ? transitionComponent({ transition }) : null,
        !transition && decodeFailure
          ? _jsx(TransitionUnavailable, {
              kind: decodeFailure,
              error: decodeError ?? undefined,
              txn: txId,
            })
          : null,
        rpcTxnData?.vin && inputsComponent({ rpcTxnData, checkForSpentInput: true }),
        rpcTxnData?.vout && outputsComponent({ rpcTxnData, txn: undefined }),
      ],
    }),
  })
}
export const DecodeTransaction = { Component: DecodeTransactionComponent }
