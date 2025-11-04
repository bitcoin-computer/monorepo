import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import reactStringReplace from 'react-string-replace'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { Card } from './Card'
import { ComputerContext } from './ComputerContext'
import { HiOutlineRefresh } from 'react-icons/hi'

function ExpressionCard({ content, env }: { content: string; env: { [s: string]: string } }) {
  const entries = Object.entries(env)
  let formattedContent = content as any
  entries.forEach((entry) => {
    const [name, rev] = entry
    const regExp = new RegExp(`(${name})`, 'g')
    const replacer = (n: string, ind: number) => (
      <Link
        key={`${rev}|${ind}`}
        to={`/objects/${rev}`}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        {n}
      </Link>
    )
    formattedContent = reactStringReplace(formattedContent, regExp, replacer)
  })
  return <Card content={formattedContent} />
}

function SpendsCell({ utxo }: { utxo: string }) {
  const computer = useContext(ComputerContext)
  const [spends, setSpends] = useState<string | undefined | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpends = async () => {
      try {
        const res = await computer.spendingInput(utxo)
        setSpends(res)
      } catch {
        setSpends(undefined)
      } finally {
        setLoading(false)
      }
    }
    fetchSpends()
  }, [computer, utxo])

  if (loading) {
    return <HiOutlineRefresh className="animate-spin text-blue-600 dark:text-blue-500" />
  }

  if (!spends) {
    return <span>N/A</span>
  }

  const [spTxid, spVout] = spends.split(':')
  const trimmed = spTxid ? `${spTxid.slice(0, 6)}...${spTxid.slice(-4)}:${spVout || ''}` : spends

  return (
    <Link
      to={`/objects/${spends}`}
      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      #{trimmed}
    </Link>
  )
}

export const outputsComponent = ({
  rpcTxnData,
  txn,
}: {
  rpcTxnData: any
  txn: string | undefined
}) => (
  <div className="relative overflow-x-auto">
    <h2 className="mb-2 text-4xl font-bold dark:text-white">Objects</h2>

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
          <th scope="col" className="px-6 py-3">
            Spent By
          </th>
        </tr>
      </thead>
      <tbody>
        {rpcTxnData?.vout?.map((output: any) => (
          <tr key={output.n} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">
              <Link
                to={`/objects/${txn}:${output.n}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                #{output.n}
              </Link>
            </td>

            <td className="px-6 py-4">{output.value}</td>
            <td className="px-6 py-4">{output.scriptPubKey.type}</td>
            <td className="px-6 py-4 break-all">{output.scriptPubKey.asm}</td>
            <td className="px-6 py-4">
              {txn ? <SpendsCell utxo={`${txn}:${output.n}`} /> : <span>N/A</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

function InputRevCell({ utxo, checkForSpentInput }: { utxo: string; checkForSpentInput: boolean }) {
  const computer = useContext(ComputerContext)
  const [spends, setSpends] = useState<string | null | undefined>(null) // null: loading, undefined: not spent or no check, string: spent
  useEffect(() => {
    if (checkForSpentInput) {
      setSpends(null)
      const fetch = async () => {
        try {
          const res = await computer.spendingInput(utxo)
          setSpends(res || undefined)
        } catch (err) {
          console.error('Error fetching spending input:', err)
          setSpends(undefined)
        }
      }
      fetch()
    } else {
      setSpends(undefined)
    }
  }, [checkForSpentInput, utxo, computer])

  const isLoading = spends === null
  const isSpent = typeof spends === 'string'
  const linkClass = isSpent
    ? 'font-medium text-red-600 dark:text-red-500 hover:underline'
    : 'font-medium text-blue-600 dark:text-blue-500 hover:underline'

  let trimmed = ''
  let spendingTxId = ''
  if (isSpent) {
    const [txId, vIn] = spends.split(':')
    spendingTxId = txId
    trimmed = `${txId.slice(0, 6)}...${txId.slice(-4)}:${vIn || ''}`
  }

  return (
    <div className="relative group inline-block">
      <Link to={`/objects/${utxo}`} className={linkClass}>
        {utxo}
      </Link>
      {isLoading && (
        <HiOutlineRefresh className="inline ml-2 animate-spin text-blue-600 dark:text-blue-500" />
      )}
      {isSpent && (
        <div className="absolute left-1/2 z-10 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 group-hover:opacity-100 bottom-full -translate-x-1/2 mb-3">
          this input have been spent in this transaction{' '}
          <Link
            to={`/transactions/${spendingTxId}`}
            className="font-medium text-blue-400 hover:underline"
          >
            {trimmed}
          </Link>
        </div>
      )}
    </div>
  )
}

export const inputsComponent = ({
  rpcTxnData,
  checkForSpentInput = false,
}: {
  rpcTxnData: any
  checkForSpentInput: boolean
}) => (
  <div className="relative overflow-x-auto sm:rounded-lg">
    <h2 className="mb-2 text-4xl font-bold dark:text-white">Inputs</h2>

    <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Input Rev
          </th>
          <th scope="col" className="px-6 py-3">
            Script
          </th>
        </tr>
      </thead>
      <tbody>
        {rpcTxnData?.vin?.map((input: any, ind: any) => (
          <tr
            key={`${input.txid}|${ind}`}
            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
          >
            <td className="px-6 py-4 break-all">
              <InputRevCell
                utxo={`${input.txid}:${input.vout}`}
                checkForSpentInput={checkForSpentInput}
              />
            </td>

            <td className="px-6 py-4 break-all">{input.scriptSig?.asm}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const envTable = (env: { [s: string]: string }) => (
  <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr>
        <th scope="col" className="px-6 py-3">
          Name
        </th>
        <th scope="col" className="px-6 py-3 break-keep">
          Output
        </th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(env).map(([name, output]) => (
        <tr key={output} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <td className="px-6 py-4 break-all">{name}</td>
          <td className="px-6 py-4">
            <Link
              to={`/objects/${output}`}
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              {output}
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

export const transitionComponent = ({ transition }: { transition: any }) => (
  <div>
    <h2 className="mb-2 text-4xl font-bold dark:text-white">Expression</h2>
    <ExpressionCard content={transition.exp} env={transition.env} />

    <h2 className="mb-2 text-4xl font-bold dark:text-white">Environment</h2>
    {envTable(transition.env)}

    {transition.mod && (
      <>
        <h2 className="mb-2 text-4xl font-bold dark:text-white">Module Specifier</h2>
        <Card content={transition.mod} />
      </>
    )}
  </div>
)

export function TransactionComponent() {
  const location = useLocation()
  const params = useParams()
  const computer = useContext(ComputerContext)
  const [txn, setTxn] = useState(params.txn)
  const [txnData, setTxnData] = useState<any | null>(null)
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null)
  const [transition, setTransition] = useState<any | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setTxn(params.txn)
      const [hex] = await computer.db.wallet.restClient.getRawTxs([params.txn as string])
      const tx = BCTransaction.fromHex(hex)
      setTxnData(tx)
      const { result } = await computer.rpcCall('getrawtransaction', `${params.txn} 2`)
      setRPCTxnData(result)
    }
    fetch()
  }, [computer, txn, location, params.txn])

  useEffect(() => {
    const fetch = async () => {
      try {
        if (txnData) setTransition(await computer.decode(txnData))
      } catch (err) {
        if (err instanceof Error) {
          setTransition('')
        }
      }
    }
    fetch()
  }, [computer, txnData, txn])

  return (
    <>
      <div className="pt-8">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Transaction</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {txn}
        </p>

        {transition && transitionComponent({ transition })}

        {rpcTxnData?.vin && inputsComponent({ rpcTxnData, checkForSpentInput: false })}

        {rpcTxnData?.vout && outputsComponent({ rpcTxnData, txn })}
      </div>
    </>
  )
}

export const Transaction = { Component: TransactionComponent }
