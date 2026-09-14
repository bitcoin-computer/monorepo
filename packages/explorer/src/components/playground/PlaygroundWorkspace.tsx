import { Dispatch, KeyboardEvent, ReactNode, SetStateAction } from 'react'
import { Auth } from '@bitcoin-computer/components'
import { CodeEditor } from './CodeEditor'
import { EffectPanel } from './EffectPreview'
import { ModSpec } from './ModSpec'
import {
  ActionBar,
  EditorToolbar,
  EmptyWorkspace,
  Panel,
  PlaygroundResult,
  SourceBadge,
} from './ui'
import { BroadcastFinish, EncodePayload, usePlaygroundEncode } from './usePlaygroundEncode'

export function PlaygroundWorkspace({
  source,
  onSourceChange,
  exampleSource,
  exampleLoaded,
  editorTitle,
  editorId,
  placeholder,
  minHeight = 280,
  ariaLabel,
  extra,
  showModSpec = true,
  modSpec,
  onModSpecChange,
  showEffect = true,
  primaryLabel,
  disabled,
  onLoadCounter,
  reportResult,
  onPreviewDone,
  onBroadcastDone,
  buildEncode,
  onPreview,
  onBroadcast,
  previewLabel,
  finishBroadcast,
}: {
  source: string
  onSourceChange: (value: string) => void
  exampleSource: string
  exampleLoaded: boolean
  editorTitle: string
  editorId: string
  placeholder: string
  minHeight?: number
  ariaLabel: string
  extra?: ReactNode
  showModSpec?: boolean
  modSpec?: string
  onModSpecChange?: Dispatch<SetStateAction<string | undefined>>
  showEffect?: boolean
  primaryLabel: string
  disabled: boolean
  onLoadCounter?: () => void
  reportResult: (result: PlaygroundResult) => void
  onPreviewDone?: () => void
  onBroadcastDone?: () => void
  buildEncode?: (opts: { fund: boolean; sign: boolean }) => EncodePayload
  onPreview?: () => void | Promise<void>
  onBroadcast?: () => void | Promise<void>
  previewLabel?: string
  finishBroadcast?: BroadcastFinish
}) {
  const loggedIn = Auth.isLoggedIn()
  const { effectPreview, setEffectPreview, handlePreview, handleBroadcast } = usePlaygroundEncode({
    exampleSource,
    disabled,
    reportResult,
    onPreviewDone,
    onBroadcastDone,
    buildEncode,
    onPreview,
    onBroadcast,
    finishBroadcast,
  })

  const onKeyDown = (e: KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey) || e.key !== 'Enter') return
    e.preventDefault()
    if (e.shiftKey) {
      handlePreview()
    } else if (loggedIn && !disabled) {
      handleBroadcast()
    }
  }

  const showEmpty = !source?.trim() && !exampleLoaded
  const editor = (
    <Panel
      title={editorTitle}
      badge={<SourceBadge exampleLoaded={exampleLoaded} />}
      actions={
        <EditorToolbar
          canClear={Boolean(source?.trim())}
          canReset={Boolean(exampleSource?.trim())}
          onCopy={() => {
            if (source) navigator.clipboard.writeText(source)
          }}
          onReset={() => onSourceChange(exampleSource || '')}
          onClear={() => onSourceChange('')}
        />
      }
      bodyClassName="p-2 sm:p-3"
    >
      <CodeEditor
        id={editorId}
        value={source}
        onChange={onSourceChange}
        placeholder={placeholder}
        minHeight={minHeight}
        onKeyDown={onKeyDown}
        aria-label={ariaLabel}
      />
    </Panel>
  )

  const advanced =
    showModSpec && onModSpecChange ? (
      <Panel title="Advanced">
        <ModSpec modSpec={modSpec} setModSpec={onModSpecChange} />
      </Panel>
    ) : null

  const actions = (
    <ActionBar
      primaryLabel={primaryLabel}
      onPrimary={handleBroadcast}
      primaryDisabled={disabled}
      loggedIn={loggedIn}
      onPreview={showEffect ? undefined : onPreview ? handlePreview : undefined}
      previewDisabled={disabled}
      previewLabel={previewLabel}
    />
  )

  return (
    <div className="space-y-4">
      {showEmpty ? <EmptyWorkspace onPickExample={onLoadCounter} /> : null}

      {showEffect ? (
        <div className="xl:grid xl:grid-cols-5 xl:gap-4 xl:items-start space-y-4 xl:space-y-0">
          <div className="xl:col-span-3 space-y-4 min-w-0">
            {editor}
            {extra}
            {advanced}
          </div>
          <div className="xl:col-span-2 min-w-0 xl:sticky xl:top-24">
            <EffectPanel
              data={effectPreview}
              onPreview={handlePreview}
              previewDisabled={disabled}
              onDismiss={() => setEffectPreview(null)}
            />
          </div>
          <div className="xl:col-span-3 min-w-0">{actions}</div>
        </div>
      ) : (
        <>
          {editor}
          {extra}
          {advanced}
          {actions}
        </>
      )}
    </div>
  )
}
