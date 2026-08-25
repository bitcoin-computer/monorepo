import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiOutlineTrash } from 'react-icons/hi'
import { Computer } from '@bitcoin-computer/lib'
import { Auth, UtilsContext, getErrorMessage, isValidRev } from '@bitcoin-computer/components'
import { ModSpec } from './Modspec'
import { CodeEditor } from './CodeEditor'
import { EffectPanel, EffectPreviewData } from './EffectPreview'
import {
  ActionBar,
  EditorToolbar,
  EmptyWorkspace,
  inputClassName,
  Panel,
  PlaygroundResult,
  secondaryBtnClassName,
} from './ui'
import { loadDraft, saveDraft, useDebouncedDraft } from './usePlaygroundDraft'

interface ExpressionArgument {
  name: string
  value: string
  hidden: boolean
}

const ExecuteExpression = (props: {
  computer: Computer
  reportResult: (result: PlaygroundResult) => void
  exampleExpression: string
  exampleLoaded: boolean
  onLoadCounter?: () => void
  onPreviewDone?: () => void
  onBroadcastDone?: () => void
}) => {
  const {
    computer,
    exampleExpression,
    reportResult,
    exampleLoaded,
    onLoadCounter,
    onPreviewDone,
    onBroadcastDone,
  } = props

  const [expression, setExpression] = useState<string>('')
  const [modSpec, setModSpec] = useState<string>()
  const [expressionArgumentsList, setExpressoinArgumentsList] = useState<ExpressionArgument[]>([])
  const [effectPreview, setEffectPreview] = useState<EffectPreviewData | null>(null)
  const [restored, setRestored] = useState(false)
  const { showLoader } = UtilsContext.useUtilsComponents()
  const loggedIn = Auth.isLoggedIn()

  useEffect(() => {
    if (restored) return
    if (exampleExpression) {
      setRestored(true)
      return
    }
    const d = loadDraft('execute')
    if (d?.expression?.trim()) setExpression(d.expression)
    if (d?.modSpec) setModSpec(d.modSpec)
    setRestored(true)
  }, [exampleExpression, restored])

  useEffect(() => {
    setExpression(exampleExpression || '')
    setEffectPreview(null)
  }, [exampleExpression])

  useDebouncedDraft('execute', 'expression', expression, restored && !exampleLoaded)

  useEffect(() => {
    if (!restored || exampleLoaded) return
    saveDraft('execute', {
      expression,
      modSpec,
      code: undefined,
      module: undefined,
    })
  }, [expression, modSpec, restored, exampleLoaded])

  const handleExpressoinArgumentChange = (
    index: number,
    field: 'name' | 'value',
    value: string,
  ) => {
    const updatedExpressionArguments = [...expressionArgumentsList]
    updatedExpressionArguments[index][field] = value
    setExpressoinArgumentsList(updatedExpressionArguments)
  }

  const removeExpressionArgument = (index: number) => {
    const newExpressionArgumentsList = [...expressionArgumentsList]
    newExpressionArgumentsList[index] = { ...newExpressionArgumentsList[index], hidden: true }
    setExpressoinArgumentsList(newExpressionArgumentsList)
  }

  const handleAddExpressionArgument = () => {
    setExpressoinArgumentsList([...expressionArgumentsList, { name: '', value: '', hidden: false }])
  }

  const buildEnv = () => {
    const revMap: { [key: string]: string } = {}
    expressionArgumentsList
      .filter((argument) => !argument.hidden)
      .forEach((argument) => {
        if (isValidRev(argument.value)) revMap[argument.name] = argument.value
      })
    return revMap
  }

  const handlePreview = useCallback(async () => {
    try {
      showLoader(true)
      const expressionCode = expression?.trim()
      const { tx, effect } = await computer.encode({
        exp: `${expressionCode}`,
        env: buildEnv(),
        fund: false,
        sign: false,
        ...(modSpec ? { mod: modSpec } : {}),
      })
      setEffectPreview({
        kind: 'preview',
        res: effect?.res,
        env: effect?.env as Record<string, unknown> | undefined,
        txHexLength: tx ? tx.toHex?.()?.length : undefined,
        note: 'Encoded without funding or signing. Nothing was broadcast.',
      })
      onPreviewDone?.()
    } catch (error: unknown) {
      setEffectPreview(null)
      reportResult({
        status: 'error',
        title: 'Preview failed',
        data: getErrorMessage(error),
      })
    } finally {
      showLoader(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer, expression, modSpec, expressionArgumentsList, onPreviewDone, reportResult, showLoader])

  const handleExpressionCall = useCallback(async () => {
    try {
      showLoader(true)
      const expressionCode = expression?.trim()
      const revMap = buildEnv()
      const { tx, effect } = await computer.encode({
        exp: `${expressionCode}`,
        env: { ...revMap },
        fund: true,
        sign: true,
        ...(modSpec ? { mod: modSpec } : {}),
      })
      if (!tx) throw new Error('Transition does not update the state, no transaction created')
      const txId = await computer.broadcast(tx)
      setEffectPreview({
        kind: 'broadcast',
        res: effect?.res,
        env: effect?.env as Record<string, unknown> | undefined,
        txId,
      })
      reportResult({
        status: 'success',
        title: 'Expression executed',
        data: { _rev: `${txId}:0`, type: 'objects', res: effect.res },
      })
      onBroadcastDone?.()
    } catch (error: unknown) {
      reportResult({
        status: 'error',
        title: 'Error',
        data: getErrorMessage(error),
      })
    } finally {
      showLoader(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer, expression, modSpec, expressionArgumentsList, onBroadcastDone, reportResult, showLoader])

  const isCallDisabled = useMemo(
    () =>
      !expression?.trim() ||
      expressionArgumentsList.some((arg) => !arg.hidden && !arg.name.trim()),
    [expressionArgumentsList, expression],
  )

  const visibleArgs = expressionArgumentsList.filter((a) => !a.hidden)
  const showEmpty = !expression?.trim() && !exampleLoaded

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        if (!isCallDisabled) void handlePreview()
      } else if (loggedIn && !isCallDisabled) {
        void handleExpressionCall()
      }
    }
  }

  return (
    <div className="space-y-4">
      {showEmpty ? <EmptyWorkspace onPickExample={onLoadCounter} /> : null}

      <div className="xl:grid xl:grid-cols-5 xl:gap-4 xl:items-start space-y-4 xl:space-y-0">
        <div className="xl:col-span-3 space-y-4 min-w-0">
          <Panel
            title="Expression"
            badge={
              exampleLoaded ? (
                <span className="text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  Example loaded
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  Custom
                </span>
              )
            }
            actions={
              <EditorToolbar
                canClear={Boolean(expression?.trim())}
                canReset={Boolean(exampleExpression?.trim())}
                onCopy={() => {
                  if (expression) navigator.clipboard.writeText(expression)
                }}
                onReset={() => setExpression(exampleExpression || '')}
                onClear={() => setExpression('')}
              />
            }
            bodyClassName="p-2 sm:p-3"
          >
            <CodeEditor
              id="expression-textarea"
              value={expression}
              onChange={setExpression}
              placeholder="new Counter() or other JS expression"
              minHeight={280}
              onKeyDown={onKeyDown}
              aria-label="Expression source"
            />
          </Panel>

          <Panel title="Environment">
            {visibleArgs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Bind names used in the expression to revision strings (revs).
              </p>
            ) : (
              <div className="space-y-2 mb-3">
                {expressionArgumentsList.map(
                  (argument: ExpressionArgument, index) =>
                    !argument.hidden && (
                      <div key={index} className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          id={`playground-expression-argument-name-${index}`}
                          value={argument.name}
                          onChange={(e) =>
                            handleExpressoinArgumentChange(index, 'name', e.target.value)
                          }
                          className={`${inputClassName} w-full sm:w-40`}
                          placeholder="Name"
                          required
                        />
                        <input
                          type="text"
                          id={`playground-expression-argument-${index}`}
                          value={argument.value}
                          onChange={(e) =>
                            handleExpressoinArgumentChange(index, 'value', e.target.value)
                          }
                          className={`${inputClassName} min-w-[10rem] flex-1`}
                          placeholder="Rev (txid:vout)"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeExpressionArgument(index)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                          aria-label="Remove env binding"
                          title="Remove"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    ),
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleAddExpressionArgument}
              className={secondaryBtnClassName}
            >
              Add environment variable
            </button>
          </Panel>

          <Panel title="Advanced">
            <ModSpec modSpec={modSpec} setModSpec={setModSpec} />
          </Panel>
        </div>

        {/* Effect column: sticky on desktop; on mobile stacks between form and broadcast bar */}
        <div className="xl:col-span-2 min-w-0 xl:sticky xl:top-24">
          <EffectPanel
            data={effectPreview}
            onPreview={() => void handlePreview()}
            previewDisabled={isCallDisabled}
            onDismiss={() => setEffectPreview(null)}
          />
        </div>

        <div className="xl:col-span-3 min-w-0">
          <ActionBar
            primaryLabel="Execute expression"
            onPrimary={handleExpressionCall}
            primaryDisabled={isCallDisabled}
            loggedIn={loggedIn}
          />
        </div>
      </div>
    </div>
  )
}

export default ExecuteExpression
