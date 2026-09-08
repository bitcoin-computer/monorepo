import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { HiRefresh, HiChevronDown, HiChevronRight } from 'react-icons/hi'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { Computer } from '@bitcoin-computer/lib'
import QRCode from 'qrcode'
import { Auth } from './Auth'
import { Drawer } from './Drawer'
import { UtilsContext } from './UtilsContext'
import { ComputerContext } from './ComputerContext'
import { getEnv, bigIntToStr, strToBigInt } from './common/utils'
import {
  isValidAddressForComputer,
  signAndBroadcastSpendUtxos,
} from './common/spendUtxos'
import { VITE_WITHDRAW_MOD_SPEC } from './common/modSpecs'

/* ─── shared UI tokens ─────────────────────────────────────────────── */

const inputClass =
  'block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white'

const btnSecondary =
  'inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'

const btnPrimary =
  'inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-500'

const btnDanger =
  'inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-600'

const sectionLabel =
  'text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2'

/* ─── types ────────────────────────────────────────────────────────── */

type PaymentLike = {
  _rev: string
  _satoshis: bigint
}

type BalanceState =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      total: bigint
      wallet: bigint
      apps: bigint
    }

/* ─── primitives ───────────────────────────────────────────────────── */

const Spinner = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={`inline animate-spin text-gray-300 dark:text-gray-600 fill-blue-600 ${className}`}
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
)

function Section({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`mb-4 ${className}`}>
      {title ? <p className={sectionLabel}>{title}</p> : null}
      {children}
    </section>
  )
}

function Collapsible({
  title,
  defaultOpen = false,
  children,
  tone = 'default',
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
  tone?: 'default' | 'danger'
}) {
  const [open, setOpen] = useState(defaultOpen)
  const titleColor =
    tone === 'danger'
      ? 'text-red-700 dark:text-red-400'
      : 'text-gray-900 dark:text-white'

  return (
    <div
      className={`rounded-lg border mb-3 ${
        tone === 'danger'
          ? 'border-red-200 dark:border-red-900/50'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold"
        aria-expanded={open}
      >
        <span className={titleColor}>{title}</span>
        {open ? (
          <HiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <HiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>
      {open ? <div className="px-3 pb-3 pt-0 space-y-3">{children}</div> : null}
    </div>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyFailed(false)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyFailed(true)
      setTimeout(() => setCopyFailed(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label={`Copy ${label.toLowerCase()}`}
      title={copyFailed ? 'Could not copy' : 'Copy'}
    >
      {copied ? (
        <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
      ) : copyFailed ? (
        <span className="text-[10px] text-red-500 font-medium px-0.5">Fail</span>
      ) : (
        <FiCopy className="w-4 h-4" />
      )}
    </button>
  )
}

function MonoChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-start gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5">
      <p className="flex-1 min-w-0 font-mono text-xs text-gray-700 dark:text-gray-300 break-all leading-relaxed">
        {value}
      </p>
      <CopyButton value={value} label={label} />
    </div>
  )
}

/* ─── Balance ──────────────────────────────────────────────────────── */

function BalanceCard({
  computer,
  balance,
  isRefreshing,
  onRefresh,
  onFund,
}: {
  computer: Computer
  balance: BalanceState
  isRefreshing: boolean
  onRefresh: () => Promise<void>
  onFund: () => Promise<void>
}) {
  const chain = computer.getChain()
  const network = computer.getNetwork()
  const isRegtest = network === 'regtest'

  return (
    <div className="relative flex flex-col p-4 mb-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0 flex-1 text-center">
          {balance.status === 'loading' || balance.status === 'idle' ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="h-8 w-32 rounded-md bg-blue-100 dark:bg-blue-900/60 animate-pulse" />
              <div className="h-3 w-16 rounded bg-blue-100 dark:bg-blue-900/60 animate-pulse" />
            </div>
          ) : null}
          {balance.status === 'error' ? (
            <div className="py-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Could not load balance
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 break-words">
                {balance.message}
              </p>
              <button
                type="button"
                onClick={() => void onRefresh()}
                className={`${btnSecondary} mt-2 text-xs`}
              >
                Retry
              </button>
            </div>
          ) : null}
          {balance.status === 'ready' ? (
            <>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 tabular-nums">
                {bigIntToStr(balance.total)}{' '}
                <span className="text-lg font-semibold">{chain}</span>
              </div>
              <div className="text-center uppercase text-[11px] tracking-wide text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                {network}
              </div>
              {balance.apps > 0n ? (
                <p className="text-[11px] text-blue-700/70 dark:text-blue-400/70 mt-1.5">
                  Spendable {bigIntToStr(balance.wallet)} · In apps{' '}
                  {bigIntToStr(balance.apps)}
                </p>
              ) : null}
              {balance.total === 0n ? (
                <p className="text-xs text-blue-800/70 dark:text-blue-300/70 mt-2">
                  Zero balance — use the deposit address below
                  {isRegtest ? ' or fund from the faucet' : ''}.
                </p>
              ) : null}
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={isRefreshing}
          className="shrink-0 p-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50"
          aria-label="Refresh balance"
          title="Refresh balance"
        >
          <HiRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isRegtest ? (
        <button
          id="fund-wallet"
          type="button"
          onClick={() => void onFund()}
          disabled={isRefreshing}
          className={`${btnSecondary} mt-2 w-full border-blue-300 text-blue-800 dark:border-blue-700 dark:text-blue-200`}
        >
          Fund from faucet
        </button>
      ) : null}
    </div>
  )
}

/* ─── Deposit ──────────────────────────────────────────────────────── */

function DepositAddress({ computer }: { computer: Computer }) {
  const address = computer.getAddress()
  const chain = computer.getChain()
  const network = computer.getNetwork()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(true)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(address, {
      width: 160,
      margin: 1,
      color: { dark: '#111827', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [address])

  return (
    <Section title={`${chain} ${network} deposit`}>
      <MonoChip value={address} label="Deposit address" />
      <div className="mt-2 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showQr ? 'Hide QR' : 'Show QR'}
        </button>
        {showQr && qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR code for deposit address ${address}`}
            className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white p-1 w-40 h-40"
            width={160}
            height={160}
          />
        ) : null}
      </div>
    </Section>
  )
}

/* ─── Send ─────────────────────────────────────────────────────────── */

function SendForm({
  computer,
  modSpecs,
  balance,
  onSuccess,
}: {
  computer: Computer
  modSpecs: string[]
  balance: BalanceState
  onSuccess: () => Promise<void>
}) {
  const { toast } = UtilsContext.useUtilsComponents()
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [sendMax, setSendMax] = useState(false)
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [sending, setSending] = useState(false)
  const chain = computer.getChain()

  const available = balance.status === 'ready' ? balance.total : 0n

  const addressValid =
    address.trim().length > 0 && isValidAddressForComputer(computer, address)

  let amountSatoshis: bigint | null = null
  let amountError: string | null = null
  if (!sendMax && amount.trim()) {
    try {
      amountSatoshis = strToBigInt(amount.trim())
      if (amountSatoshis <= 0n) amountError = 'Amount must be positive'
      else if (balance.status === 'ready' && amountSatoshis > available) {
        amountError = 'Amount exceeds balance'
      }
    } catch {
      amountError = 'Invalid amount'
    }
  }

  const canContinue =
    addressValid &&
    !sending &&
    balance.status === 'ready' &&
    available > 0n &&
    (sendMax || (amountSatoshis != null && amountSatoshis > 0n && !amountError))

  const reset = () => {
    setAddress('')
    setAmount('')
    setSendMax(false)
    setStep('form')
  }

  const handleSend = async () => {
    try {
      setSending(true)
      const txId = await signAndBroadcastSpendUtxos({
        computer,
        modSpecs,
        toAddress: address.trim(),
        amountSatoshis: sendMax ? undefined : amountSatoshis ?? undefined,
        sendMax,
      })
      const amtLabel = sendMax ? 'max' : `${amount.trim()} ${chain}`
      toast.success(
        txId ? `Sent ${amtLabel}. Tx ${txId.slice(0, 10)}…` : `Sent ${amtLabel} successfully`,
      )
      reset()
      await onSuccess()
    } catch (err) {
      if (err instanceof Error) toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  if (step === 'confirm') {
    return (
      <Section title="Confirm send">
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">To</p>
            <p className="font-mono text-xs break-all text-gray-900 dark:text-gray-100">
              {address.trim()}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Amount</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {sendMax ? `Max available (${chain})` : `${amount.trim()} ${chain}`}
            </p>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Network fees are deducted automatically. This may spend multiple UTXOs;
            change returns to your deposit address.
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            className={`${btnSecondary} flex-1`}
            disabled={sending}
            onClick={() => setStep('form')}
          >
            Back
          </button>
          <button
            type="button"
            className={`${btnPrimary} flex-1`}
            disabled={sending}
            onClick={() => void handleSend()}
          >
            {sending ? (
              <>
                <Spinner className="w-4 h-4 mr-2" /> Sending…
              </>
            ) : (
              'Confirm & broadcast'
            )}
          </button>
        </div>
      </Section>
    )
  }

  return (
    <Section title="Send">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
            placeholder={`${chain} address`}
            autoComplete="off"
            spellCheck={false}
          />
          {address.trim() && !addressValid ? (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Invalid address for {chain} {computer.getNetwork()}
            </p>
          ) : null}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <button
              type="button"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40"
              disabled={available <= 0n || balance.status !== 'ready'}
              onClick={() => {
                setSendMax(true)
                setAmount('')
              }}
            >
              Max
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={sendMax ? '' : amount}
              onChange={(e) => {
                setSendMax(false)
                setAmount(e.target.value)
              }}
              disabled={sendMax}
              className={`${inputClass} ${sendMax ? 'opacity-60' : ''}`}
              placeholder={sendMax ? 'Sending maximum' : '0.00'}
            />
            <div className="shrink-0 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-2 text-sm text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              {chain}
            </div>
          </div>
          {sendMax ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Entire balance minus fees will be sent.{' '}
              <button
                type="button"
                className="text-blue-600 dark:text-blue-400 underline"
                onClick={() => setSendMax(false)}
              >
                Enter amount instead
              </button>
            </p>
          ) : null}
          {amountError ? (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{amountError}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setStep('confirm')}
          disabled={!canContinue}
          className={btnPrimary}
        >
          Review send
        </button>
      </div>
    </Section>
  )
}

/* ─── Legacy full withdraw (mod payments) ──────────────────────────── */

function LegacyWithdrawAll({
  computer,
  payments,
  onSuccess,
}: {
  computer: Computer
  payments: PaymentLike[]
  onSuccess: () => Promise<void>
}) {
  const { toast } = UtilsContext.useUtilsComponents()
  const [address, setAddress] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true)
      setFormError(null)
      if (!isValidAddressForComputer(computer, address)) {
        setFormError('Please enter a valid address for this network')
        return
      }
      const revs = payments.map((p) => p._rev)
      if (revs.length) await computer.delete(revs)

      const { balance } = await computer.getBalance()
      const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')))
      const sendAmount = balance - minDust
      if (sendAmount <= 0n) {
        setFormError('Balance too low to withdraw after dust reserve')
        return
      }
      const txId = await computer.send(sendAmount, address.trim())
      setAddress('')
      toast.success(
        typeof txId === 'string' ? `Withdrawn. Tx ${txId.slice(0, 10)}…` : 'Withdrawn successfully',
      )
      await onSuccess()
    } catch (err) {
      if (err instanceof Error) toast.error(err.message)
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Releases app-locked payments then sends the full wallet balance (minus dust) to one
        address. Prefer Send above for normal transfers.
      </p>
      <input
        type="text"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value)
          if (formError) setFormError(null)
        }}
        className={inputClass}
        placeholder="Recipient address"
        aria-invalid={Boolean(formError)}
      />
      {formError ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {formError}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void handleWithdraw()}
        disabled={withdrawing || !address.trim()}
        className={btnSecondary}
      >
        {withdrawing ? (
          <>
            <Spinner className="w-4 h-4 mr-2" /> Working…
          </>
        ) : (
          'Withdraw all'
        )}
      </button>
    </div>
  )
}

/* ─── Advanced / secrets ───────────────────────────────────────────── */

function PublicKeyField({ computer }: { computer: Computer }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Public key</p>
      <MonoChip value={computer.getPublicKey()} label="Public key" />
    </div>
  )
}

function MnemonicField({ computer }: { computer: Computer }) {
  const [confirmed, setConfirmed] = useState(false)
  const [shown, setShown] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    },
    [],
  )

  const reveal = () => {
    if (!confirmed) return
    setShown(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShown(false), 30_000)
  }

  const hide = () => {
    setShown(false)
    setCopyState('idle')
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }

  const copyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(computer.getMnemonic())
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('failed')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Mnemonic (seed phrase)</p>
      <p className="text-xs text-amber-800 dark:text-amber-200/90 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg px-2.5 py-2">
        Anyone with this phrase can spend your funds. Never share it. Revealing shows it for 30
        seconds. Store copies offline only.
      </p>
      <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => {
            setConfirmed(e.target.checked)
            if (!e.target.checked) hide()
          }}
          className="mt-0.5 rounded border-gray-300"
        />
        <span>I understand this can empty the wallet if leaked</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!confirmed}
          onClick={shown ? hide : reveal}
          className={btnSecondary}
        >
          {shown ? 'Hide' : 'Reveal mnemonic'}
        </button>
        {shown ? (
          <button type="button" onClick={() => void copyMnemonic()} className={btnSecondary}>
            {copyState === 'copied'
              ? 'Copied — store offline'
              : copyState === 'failed'
                ? 'Copy failed'
                : 'Copy'}
          </button>
        ) : null}
      </div>
      {shown ? (
        <p className="font-mono text-xs text-gray-800 dark:text-gray-200 break-words rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-2.5 select-all">
          {computer.getMnemonic()}
        </p>
      ) : (
        <p className="font-mono text-xs text-gray-400 dark:text-gray-500 blur-sm select-none pointer-events-none p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
          ••••• ••••• ••••• ••••• ••••• •••••
        </p>
      )}
    </div>
  )
}

function SimpleInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <p className="font-mono text-xs text-gray-500 dark:text-gray-400 break-all">{value}</p>
    </div>
  )
}

/* ─── Log out ──────────────────────────────────────────────────────── */

function LogOutSection() {
  const [confirming, setConfirming] = useState(false)
  const [backedUp, setBackedUp] = useState(false)

  if (!confirming) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Logging out removes the mnemonic from this browser. You cannot recover funds without a
          backup.
        </p>
        <button type="button" className={btnDanger} onClick={() => setConfirming(true)}>
          Log out…
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3">
      <p className="text-sm font-semibold text-red-800 dark:text-red-300">Confirm log out</p>
      <p className="text-xs text-red-700/90 dark:text-red-300/90">
        This deletes your mnemonic from local storage. Make sure you have written it down.
      </p>
      <label className="flex items-start gap-2 text-xs text-red-900 dark:text-red-200 cursor-pointer">
        <input
          type="checkbox"
          checked={backedUp}
          onChange={(e) => setBackedUp(e.target.checked)}
          className="mt-0.5 rounded border-red-300"
        />
        <span>I have backed up my mnemonic</span>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          className={`${btnSecondary} flex-1`}
          onClick={() => {
            setConfirming(false)
            setBackedUp(false)
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`${btnDanger} flex-1`}
          disabled={!backedUp}
          onClick={() => Auth.logout()}
        >
          Log out now
        </button>
      </div>
    </div>
  )
}

/* ─── Main wallet body ─────────────────────────────────────────────── */

function WalletContent({
  computer,
  modSpecs,
  isOpen,
}: {
  computer: Computer
  modSpecs: string[]
  isOpen: boolean
}) {
  const { toast } = UtilsContext.useUtilsComponents()
  const [balance, setBalance] = useState<BalanceState>({ status: 'idle' })
  const [payments, setPayments] = useState<PaymentLike[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const fetchGen = useRef(0)

  const refreshBalance = useCallback(async () => {
    const gen = ++fetchGen.current
    setIsRefreshing(true)
    setBalance((prev) => (prev.status === 'ready' ? prev : { status: 'loading' }))
    try {
      const publicKey = computer.getPublicKey()
      const allPayments: PaymentLike[] = []
      const balances: bigint[] = await Promise.all(
        modSpecs.map(async (mod) => {
          const paymentRevs = await computer.getOUTXOs({ publicKey, mod })
          const synced = await Promise.all(
            paymentRevs.map((rev: string) => computer.sync(rev)),
          )
          const paymentsSynced = synced as unknown as PaymentLike[]
          allPayments.push(...paymentsSynced)
          const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')))
          return paymentsSynced.length
            ? paymentsSynced.reduce((total, pay) => total + (pay._satoshis - minDust), 0n)
            : 0n
        }),
      )
      const amountsInPayments = balances.reduce((acc, curr) => acc + curr, 0n)
      const walletBalance = await computer.getBalance()

      if (gen !== fetchGen.current) return

      setPayments(allPayments)
      setBalance({
        status: 'ready',
        total: walletBalance.balance + amountsInPayments,
        wallet: walletBalance.balance,
        apps: amountsInPayments,
      })
    } catch (err) {
      if (gen !== fetchGen.current) return
      const message =
        err instanceof Error ? err.message : 'Could not reach the node or load wallet details'
      // Inline via balance status — do not toast page-load errors
      setBalance({ status: 'error', message })
    } finally {
      if (gen === fetchGen.current) setIsRefreshing(false)
    }
  }, [computer, modSpecs])

  const fund = async () => {
    setIsRefreshing(true)
    try {
      const amount = computer.getChain() === 'PEPE' ? 10e8 : 1e8
      await computer.faucet(amount)
      await refreshBalance()
      toast.success('Wallet funded from faucet')
    } catch (err) {
      if (err instanceof Error) toast.error(`Error funding wallet: ${err.message}`)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isOpen) void refreshBalance()
    else fetchGen.current += 1 // cancel in-flight apply
  }, [isOpen, refreshBalance])

  // Refresh when window regains focus while open
  useEffect(() => {
    if (!isOpen) return undefined
    const onFocus = () => void refreshBalance()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isOpen, refreshBalance])

  return (
    <div className="pb-4">
      {/* Primary */}
      <BalanceCard
        computer={computer}
        balance={balance}
        isRefreshing={isRefreshing}
        onRefresh={refreshBalance}
        onFund={fund}
      />
      <DepositAddress computer={computer} />

      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />

      {/* Actions */}
      <SendForm
        computer={computer}
        modSpecs={modSpecs}
        balance={balance}
        onSuccess={refreshBalance}
      />

      {VITE_WITHDRAW_MOD_SPEC ? (
        <Collapsible title="Advanced withdraw (app payments)">
          <LegacyWithdrawAll
            computer={computer}
            payments={payments}
            onSuccess={refreshBalance}
          />
        </Collapsible>
      ) : null}

      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />

      {/* Advanced */}
      <Collapsible title="Account & security">
        <PublicKeyField computer={computer} />
        <MnemonicField computer={computer} />
        {!getEnv('CHAIN') ? (
          <SimpleInfo label="Chain" value={computer.getChain()} />
        ) : null}
        {!getEnv('NETWORK') ? (
          <SimpleInfo label="Network" value={computer.getNetwork()} />
        ) : null}
        {!getEnv('URL') ? (
          <SimpleInfo label="Node URL" value={computer.getUrl()} />
        ) : null}
        {!getEnv('PATH') ? (
          <SimpleInfo label="Derivation path" value={computer.getPath()} />
        ) : null}
      </Collapsible>

      {/* Danger */}
      <Collapsible title="Log out" tone="danger">
        <LogOutSection />
      </Collapsible>
    </div>
  )
}

export function Wallet({ modSpecs }: { modSpecs?: string[] }) {
  const computer = useContext(ComputerContext)
  const Content = ({ isOpen }: { isOpen: boolean }) => (
    <WalletContent computer={computer} modSpecs={modSpecs || []} isOpen={isOpen} />
  )

  return <Drawer.Component Content={Content} id="wallet-drawer" title="Wallet" />
}
