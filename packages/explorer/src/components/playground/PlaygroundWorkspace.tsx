import { Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from 'react'
import {
  Auth,
  ComputerContext,
  UtilsContext,
  getErrorMessage,
} from '@bitcoin-computer/components'
import { CodeEditor } from './CodeEditor'
import { EffectPanel, EffectPreviewData } from './EffectPreview'
import { ModSpec } from './Modspec'
import {
  ActionBar,
  EditorToolbar,
  EmptyWorkspace,
  Panel,
  PlaygroundResult,
  SourceBadge,
} from './ui'

export type EncodePayload = {
  exp: string
  env?: Record<string, string>
  fund?: boolean
  sign?: boolean
  mod?: string
}

type BroadcastCtx = {
  effect: { res?: unknown; env?: Record<string, unknown> }
  txId: string
}

export type BroadcastFinish = (ctx: BroadcastCtx) => Promise<{
  result: PlaygroundResult
  res?: unknown
  env?: Record<string, unknown>
}>

const PREVIEW_NOTE = 'Encoded without funding or signing. Nothing was broadcast.'

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
  const computer = useContext(ComputerContext)
  const { showLoader } = UtilsContext.useUtilsComponents()
  const loggedIn = Auth.isLoggedIn()
  const [effectPreview, setEffectPreview] = useState<EffectPreviewData | null>(null)

  useEffect(() => {
    setEffectPreview(null)
  }, [exampleSource])

  const runEncode = useCallback(
    async (broadcast: boolean) => {
      if (!buildEncode) return
      try {
        showLoader(true)
        const payload = buildEncode({ fund: broadcast, sign: broadcast })
        const { tx, effect } = await computer.encode(payload)
        if (!broadcast) {
          setEffectPreview({
            kind: 'preview',
            res: effect?.res,
            env: effect?.env as Record<string, unknown> | undefined,
            txHexLength: tx ? tx.toHex?.()?.length ?? undefined : undefined,
            note: PREVIEW_NOTE,
          })
          onPreviewDone?.()
          return
        }
        if (!tx) throw new Error('Transition does not update the state, no transaction created')
        const txId = await computer.broadcast(tx)
        const finished = finishBroadcast
          ? await finishBroadcast({
              effect: {
                res: effect?.res,
                env: effect?.env as Record<string, unknown> | undefined,
              },
              txId,
            })
          : {
              result: {
                status: 'success' as const,
                title: 'Success',
                data: { _rev: `${txId}:0`, type: 'objects' },
              },
              res: effect?.res,
              env: effect?.env as Record<string, unknown> | undefined,
            }
        setEffectPreview({
          kind: 'broadcast',
          res: finished.res ?? effect?.res,
          env: finished.env ?? (effect?.env as Record<string, unknown> | undefined),
          txId,
        })
        reportResult(finished.result)
        onBroadcastDone?.()
      } catch (error: unknown) {
        if (!broadcast) setEffectPreview(null)
        reportResult({
          status: 'error',
          title: broadcast ? 'Error' : 'Preview failed',
          data: getErrorMessage(error),
        })
      } finally {
        showLoader(false)
      }
    },
    [
      buildEncode,
      computer,
      finishBroadcast,
      onBroadcastDone,
      onPreviewDone,
      reportResult,
      showLoader,
    ],
  )

  const handlePreview = useCallback(() => {
    if (onPreview) {
      void onPreview()
      return
    }
    if (disabled) return
    void runEncode(false)
  }, [disabled, onPreview, runEncode])

  const handleBroadcast = useCallback(() => {
    if (onBroadcast) {
      void onBroadcast()
      return
    }
    if (disabled) return
    void runEncode(true)
  }, [disabled, onBroadcast, runEncode])

  const onKeyDown = (e: React.KeyboardEvent) => {
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

  const advanced = showModSpec && onModSpecChange ? (
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
