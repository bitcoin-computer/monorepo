import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { truncateHex, truncateRev } from '../../utils/rpc'

const explorerLinkClass = 'text-blue-600 dark:text-blue-400 hover:underline'

type Pair = readonly [number, number]

function hexText(value: string, spec: Pair | 'full' | 'default'): string {
  if (spec === 'full') return value
  if (spec === 'default') return truncateHex(value)
  return truncateHex(value, spec[0], spec[1])
}

export function HexLink({
  to,
  value,
  className = explorerLinkClass,
  mobile,
  desktop = 'default',
  children,
}: {
  to: string
  value: string
  className?: string
  mobile?: Pair
  desktop?: Pair | 'full' | 'default'
  children?: ReactNode
}) {
  const body =
    children ??
    (mobile ? (
      <>
        <span className="sm:hidden">{hexText(value, mobile)}</span>
        <span className="hidden sm:inline">{hexText(value, desktop)}</span>
      </>
    ) : (
      hexText(value, desktop)
    ))

  return (
    <Link to={to} title={value} className={className}>
      {body}
    </Link>
  )
}

export function RevLink({
  to,
  rev,
  className = 'font-medium text-blue-600 dark:text-blue-500 hover:underline font-mono text-xs',
}: {
  to: string
  rev: string
  className?: string
}) {
  return (
    <HexLink to={to} value={rev} className={className}>
      {truncateRev(rev)}
    </HexLink>
  )
}
