import { useCallback, useContext, useEffect, useState } from 'react'
import { ComputerContext, UtilsContext, getErrorMessage } from '@bitcoin-computer/components'
import { EffectPreviewData } from './EffectPreview'
import { PlaygroundResult } from './types'

const PREVIEW_NOTE = 'Encoded without funding or signing. Nothing was broadcast.'

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

export function asEffectEnv(env: unknown): Record<string, unknown> | undefined {
  return env as Record<string, unknown> | undefined
}

export function usePlaygroundEncode({
  exampleSource,
  disabled,
  reportResult,
  onPreviewDone,
  onBroadcastDone,
  buildEncode,
  onPreview,
  onBroadcast,
  finishBroadcast,
}: {
  exampleSource: string
  disabled: boolean
  reportResult: (result: PlaygroundResult) => void
  onPreviewDone?: () => void
  onBroadcastDone?: () => void
  buildEncode?: (opts: { fund: boolean; sign: boolean }) => EncodePayload
  onPreview?: () => void | Promise<void>
  onBroadcast?: () => void | Promise<void>
  finishBroadcast?: BroadcastFinish
}) {
  const computer = useContext(ComputerContext)
  const { showLoader } = UtilsContext.useUtilsComponents()
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
            env: asEffectEnv(effect?.env),
            txHexLength: tx ? (tx.toHex?.()?.length ?? undefined) : undefined,
            note: PREVIEW_NOTE,
          })
          onPreviewDone?.()
          return
        }
        if (!tx) throw new Error('Transition does not update the state, no transaction created')
        const txId = await computer.broadcast(tx)
        const effectEnv = asEffectEnv(effect?.env)
        const finished = finishBroadcast
          ? await finishBroadcast({
              effect: { res: effect?.res, env: effectEnv },
              txId,
            })
          : {
              result: {
                status: 'success' as const,
                title: 'Success',
                data: { _rev: `${txId}:0`, type: 'objects' },
              },
              res: effect?.res,
              env: effectEnv,
            }
        setEffectPreview({
          kind: 'broadcast',
          res: finished.res ?? effect?.res,
          env: finished.env ?? effectEnv,
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

  return { effectPreview, setEffectPreview, handlePreview, handleBroadcast }
}
