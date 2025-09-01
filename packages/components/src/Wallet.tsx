import { useCallback, useContext, useEffect, useState } from 'react'
import { HiRefresh, HiOutlineInformationCircle } from 'react-icons/hi'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { Computer } from '@bitcoin-computer/lib'
import { Auth } from './Auth'
import { Drawer } from './Drawer'
import { UtilsContext } from './UtilsContext'
import { ComputerContext } from './ComputerContext'
import { getEnv, bigIntToStr } from './common/utils'
import { VITE_WITHDRAW_MOD_SPEC } from './common/modSpecs'
import { bufferUtils, payments as paymentsUtils } from '@bitcoin-computer/nakamotojs'

const Balance = ({
  computer,
  modSpecs,
  isOpen,
}: {
  computer: Computer
  modSpecs: string[]
  isOpen: boolean
}) => {
  const [balance, setBalance] = useState<bigint>(0n)
  const [paymentsWrapper, setPaymentsWrapper] = useState<any[]>([])
  const [, setChain] = useState<string>(localStorage.getItem('CHAIN') || 'LTC')
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const [address, setAddress] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true)
      showLoader(true)
      if (!address || !address.trim()) {
        showSnackBar('Please input valid address', false)
        return
      }
      const expParams = paymentsWrapper.map((_, i) => `p${i}`).join(', ')
      const envParams = Object.fromEntries(
        paymentsWrapper.map((payment, i) => [`p${i}`, payment._rev]),
      )
      const { tx } = await computer.encode({
        exp: `Withdraw.exec([${expParams}])`,
        env: envParams,
        fund: false,
        mod: VITE_WITHDRAW_MOD_SPEC,
      })

      const utxos = await computer.db.wallet.restClient.getFormattedUtxos(computer.getAddress())
      utxos.forEach((utxo) => {
        tx.addInput(bufferUtils.reverseBuffer(Buffer.from(utxo.txId, 'hex')), utxo.vout)
      })

      await computer.fund(tx)

      const changeOutputIndex = tx.outs.length - 1

      const network = computer.db.wallet.restClient.networkObj
      const p2pkh = paymentsUtils.p2pkh({ address, network })

      tx.updateOutput(changeOutputIndex, { scriptPubKey: p2pkh.output })

      await computer.sign(tx)
      await computer.broadcast(tx)

      showSnackBar('Congratulations! Balance withdrawn to address.', true)
    } catch (err) {
      if (err instanceof Error) {
        showSnackBar(`Something went wrong, ${err.message}`, false)
      }
    } finally {
      setWithdrawing(false)
      showLoader(false)
    }
  }

  const refreshBalance = useCallback(async () => {
    try {
      showLoader(true)
      const publicKey = computer.getPublicKey()
      const allPayments: any[] = []
      const balances: bigint[] = await Promise.all(
        modSpecs.map(async (mod) => {
          const paymentRevs = modSpecs ? await computer.query({ publicKey, mod }) : []
          const payments = (await Promise.all(
            paymentRevs.map((rev: string) => computer.sync(rev)),
          )) as any[]
          allPayments.push(...payments) // Accumulate payments
          return payments && payments.length
            ? payments.reduce(
                (total, pay) => total + (pay._satoshis - BigInt(computer.getMinimumFees())),
                0n,
              )
            : 0n
        }),
      )
      const amountsInPayments: bigint = balances.reduce((acc, curr) => acc + BigInt(curr), 0n)
      const walletBalance = await computer.getBalance()
      setBalance(walletBalance.balance + amountsInPayments)
      setPaymentsWrapper(allPayments)
      setChain(computer.getChain())
      showLoader(false)
    } catch (err) {
      showLoader(false)
      showSnackBar('Error fetching wallet details', false)
    }
  }, [computer, modSpecs])

  const fund = async () => {
    const amount = computer.getChain() === 'PEPE' ? 10e8 : 1e8
    await computer.faucet(amount)
    setBalance((await computer.getBalance()).balance)
  }

  useEffect(() => {
    if (isOpen) refreshBalance()
  }, [isOpen, refreshBalance])

  return (
    <>
      <div
        id="dropdown-cta"
        className="relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900"
        role="alert"
      >
        <div className="text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400">
          {bigIntToStr(balance)} {computer.getChain()}{' '}
          <HiRefresh
            onClick={refreshBalance}
            className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
          />
        </div>
        <div className="text-center uppercase text-xs text-blue-800 dark:text-blue-400">
          {computer.getNetwork()}
        </div>
        {computer.getNetwork() === 'regtest' && (
          <button
            id="fund-wallet"
            type="button"
            onClick={fund}
            className="absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
          >
            Fund
          </button>
        )}
      </div>
      <Address computer={computer} />
      {!!VITE_WITHDRAW_MOD_SPEC && (
        <div className="mb-4">
          <h6 className="text-lg font-bold dark:text-white mb-1">Withdraw to Address</h6>
          <p className="mb-1 font-mono text-xs text-gray-500 dark:text-gray-400">
            Complete balance will be withdrawn, Some of your balance might be locked in the tokens.
            Use withdraw to unlock.
          </p>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="block w-full px-3 py-2 mb-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter recipient address"
          />
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          >
            Withdraw
          </button>
        </div>
      )}
    </>
  )
}

const Address = ({ computer }: any) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(computer.getAddress())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <h6 className="text-lg font-bold dark:text-white">Deposit Address</h6>
        <button
          onClick={handleCopy}
          className={`ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`}
          aria-label="Copy address"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
        {computer.getAddress()}
      </p>
    </div>
  )
}

const PublicKey = ({ computer }: any) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(computer.getPublicKey())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <h6 className="text-lg font-bold dark:text-white">Public Key</h6>
        <button
          onClick={handleCopy}
          className={`ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`}
          aria-label="Copy public key"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="mb-4 text-xs font-mono text-gray-500 dark:text-gray-400 break-words">
        {computer.getPublicKey()}
      </p>
    </div>
  )
}

const Mnemonic = ({ computer }: any) => {
  const [mnemonicShown, setMnemonicShown] = useState(false)
  return (
    <div className="mb-4">
      <h6 className="text-lg font-bold dark:text-white">
        Mnemonic{' '}
        <button
          onClick={() => setMnemonicShown(!mnemonicShown)}
          className="text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
        >
          {mnemonicShown ? 'hide' : 'show'}
        </button>
      </h6>
      <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-words">
        {mnemonicShown ? computer.getMnemonic() : ''}
      </p>
    </div>
  )
}

const Url = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Node Url</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getUrl()}
    </p>
  </div>
)

const Chain = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Chain</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getChain()}
    </p>
  </div>
)

const Network = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Network</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getNetwork()}
    </p>
  </div>
)

const Path = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Path</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getPath()}
    </p>
  </div>
)

const LogOut = () => (
  <>
    <div className="mb-6">
      <h6 className="text-lg font-bold dark:text-white">Log out</h6>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        Logging out will delete your mnemonic. Make sure to write it down.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={Auth.logout}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
      >
        Log out
      </button>
    </div>
  </>
)

export function Wallet({ modSpecs }: { modSpecs?: string[] }) {
  const computer = useContext(ComputerContext)
  const Content = ({ isOpen }: { isOpen: boolean }) => (
    <>
      <h4 className="text-2xl font-bold dark:text-white">Wallet</h4>
      <Balance computer={computer} modSpecs={modSpecs || []} isOpen={isOpen} />
      <PublicKey computer={computer} />
      <Mnemonic computer={computer} />
      {!getEnv('CHAIN') && <Chain computer={computer} />}
      {!getEnv('NETWORK') && <Network computer={computer} />}
      {!getEnv('URL') && <Url computer={computer} />}
      {!getEnv('PATH') && <Path computer={computer} />}
      <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
      <LogOut />
    </>
  )

  return <Drawer.Component Content={Content} id="wallet-drawer" />
}

export const WalletComponents = {
  Balance,
  Address,
  PublicKey,
  Mnemonic,
  Chain,
  Network,
  Url,
  LogOut,
}
