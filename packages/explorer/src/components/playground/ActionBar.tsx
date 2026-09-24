import { ReactNode } from 'react'
import { Modal } from '@bitcoin-computer/components'
import { secondaryBtnClassName } from './classes'

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  title,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  title?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-blue-800'
      } ${className}`}
    >
      {children}
    </button>
  )
}

function ActionControls({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  loggedIn,
  onPreview,
  previewDisabled,
  previewLabel,
  compact,
}: {
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  loggedIn: boolean
  onPreview?: () => void
  previewDisabled?: boolean
  previewLabel: string
  compact?: boolean
}) {
  const shownPreviewLabel = compact && previewLabel === 'Preview effect' ? 'Preview' : previewLabel

  return (
    <>
      {onPreview ? (
        <button
          type="button"
          onClick={onPreview}
          disabled={previewDisabled}
          className={compact ? `${secondaryBtnClassName} shrink-0` : secondaryBtnClassName}
          title={compact ? undefined : 'Encode without broadcasting (⌘/Ctrl+Shift+Enter)'}
        >
          {shownPreviewLabel}
        </button>
      ) : null}
      <PrimaryButton
        onClick={onPrimary}
        disabled={primaryDisabled || !loggedIn}
        title={compact ? undefined : 'Broadcast (⌘/Ctrl+Enter)'}
        className={compact ? 'flex-1' : ''}
      >
        {primaryLabel}
      </PrimaryButton>
      {!loggedIn ? (
        compact ? (
          <span className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400 underline">
            <Modal.ShowButton id="sign-in-modal" text="Sign in" />
          </span>
        ) : (
          <Modal.ShowButton id="sign-in-modal" text="Sign in to broadcast" />
        )
      ) : null}
    </>
  )
}

export function ActionBar({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  loggedIn,
  onPreview,
  previewDisabled,
  previewLabel = 'Preview',
}: {
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  loggedIn: boolean
  /** Optional secondary action (e.g. Validate on Deploy). Effect preview lives on EffectPanel. */
  onPreview?: () => void
  previewDisabled?: boolean
  previewLabel?: string
}) {
  const controls = {
    primaryLabel,
    onPrimary,
    primaryDisabled,
    loggedIn,
    onPreview,
    previewDisabled,
    previewLabel,
  }

  return (
    <>
      <div className="hidden sm:flex flex-wrap items-center gap-3">
        <ActionControls {...controls} />
        <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden md:inline">
          {onPreview ? '⌘/Ctrl+Enter run · ⌘/Ctrl+Shift+Enter preview' : '⌘/Ctrl+Enter broadcast'}
        </span>
      </div>

      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-2 max-w-screen-xl mx-auto">
          <ActionControls {...controls} compact />
        </div>
      </div>
      <div className="sm:hidden h-16" aria-hidden />
    </>
  )
}
