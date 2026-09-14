import { useState } from 'react'
import { CheckIcon, ClipboardIcon } from './icons'

export function CopyButton({
  text,
  label = 'Copy',
  className = '',
  icon = false,
}: {
  text: string
  label?: string
  className?: string
  icon?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const base = icon
    ? 'inline-flex items-center cursor-pointer p-0.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white focus:outline-none shrink-0'
    : 'inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0'

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${base} ${className}`}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
    >
      {icon ? (
        copied ? (
          <CheckIcon className="w-4 h-4 text-green-500" />
        ) : (
          <ClipboardIcon className="w-4 h-4" />
        )
      ) : copied ? (
        'Copied'
      ) : (
        label
      )}
    </button>
  )
}
