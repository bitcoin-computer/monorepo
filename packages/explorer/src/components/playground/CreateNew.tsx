import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiOutlineTrash } from 'react-icons/hi'
import { Computer, Contract } from '@bitcoin-computer/lib'
import {
  Auth,
  UtilsContext,
  TypeSelectionDropdown,
  getErrorMessage,
  isValidRev,
  sleep,
} from '@bitcoin-computer/components'
import { getValueForType } from '../../utils'
import { ModSpec } from './Modspec'
import { CodeEditor } from './CodeEditor'
import { TypedValueInput } from './TypedValueInput'
import { EffectPanel, EffectPreviewData } from './EffectPreview'
import {
  ActionBar,
  EditorToolbar,
  EmptyWorkspace,
  Panel,
  PlaygroundResult,
  secondaryBtnClassName,
} from './ui'
import {
  loadDraft,
  saveDraft,
  useDebouncedDraft,
} from './usePlaygroundDraft'

interface Argument {
  type: string
  value: string
  hidden: boolean
}

function buildEncodePayload(
  code: string,
  argumentsList: Argument[],
  modSpec?: string,
  opts?: { fund?: boolean; sign?: boolean },
) {
  const createClassFunction = new Function(`return ${code.trim()}`)
  const dynamicClass = createClassFunction()
  if (
    !(
      dynamicClass &&
      typeof dynamicClass === 'function' &&
      dynamicClass.prototype &&
      dynamicClass.prototype instanceof Contract
    )
  ) {
    throw new Error('Please check the code you provided — class must extend Contract.')
  }

  const revMap: { [key: string]: string } = {}
  argumentsList
    .filter((argument) => !argument.hidden)
    .forEach((argument, index) => {
      if (isValidRev(argument.value)) revMap[`param${index}`] = argument.value
    })

  return {
    exp: `
          ${dynamicClass} 
          new ${dynamicClass.name}(${argumentsList
            .filter((argument) => !argument.hidden)
            .map((argument, index) => {
              const argValue = getValueForType(argument.type, argument.value)
              if (isValidRev(argValue)) return `param${index}`
              if (typeof argValue === 'string') return `'${argValue}'`
              if (typeof argValue === 'bigint') return `${argValue}n`
              return argValue
            })})
          `,
    env: { ...revMap },
    fund: opts?.fund ?? true,
    sign: opts?.sign ?? true,
    ...(modSpec ? { mod: modSpec } : {}),
  }
}

const CreateNew = (props: {
  computer: Computer
  reportResult: (result: PlaygroundResult) => void
  exampleCode: string
  exampleVars: { name: string; type: string; value: string }[]
  exampleLoaded: boolean
  onLoadCounter?: () => void
  onPreviewDone?: () => void
  onBroadcastDone?: () => void
}) => {
  const {
    computer,
    exampleVars,
    exampleCode,
    reportResult,
    exampleLoaded,
    onLoadCounter,
    onPreviewDone,
    onBroadcastDone,
  } = props
  const [code, setCode] = useState<string>('')
  const [modSpec, setModSpec] = useState<string>()
  const [argumentsList, setArgumentsList] = useState<Argument[]>([])
  const [effectPreview, setEffectPreview] = useState<EffectPreviewData | null>(null)
  const [restored, setRestored] = useState(false)
  const options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'null', 'symbol']
  const { showLoader } = UtilsContext.useUtilsComponents()
  const loggedIn = Auth.isLoggedIn()

  // Restore draft once if no example
  useEffect(() => {
    if (restored) return
    if (exampleCode) {
      setRestored(true)
      return
    }
    const d = loadDraft('create')
    if (d?.code?.trim()) setCode(d.code)
    if (d?.modSpec) setModSpec(d.modSpec)
    setRestored(true)
  }, [exampleCode, restored])

  useEffect(() => {
    const newArgumentsList: Argument[] = []
    if (exampleVars) {
      exampleVars.forEach((exampleVar) => {
        newArgumentsList.push({
          type: exampleVar.type,
          value: exampleVar.value ? exampleVar.value : '',
          hidden: false,
        })
      })
    }
    setArgumentsList(newArgumentsList)
    setCode(exampleCode || '')
    setEffectPreview(null)
  }, [exampleCode, exampleVars])

  useDebouncedDraft('create', 'code', code, restored && !exampleLoaded)

  useEffect(() => {
    if (!restored || exampleLoaded) return
    saveDraft('create', { code, modSpec, expression: undefined, module: undefined })
  }, [modSpec, code, restored, exampleLoaded])

  const handleAddArgument = () => {
    setArgumentsList([...argumentsList, { type: 'string', value: '', hidden: false }])
  }

  const handleArgumentChange = (index: number, field: 'type' | 'value', value: string) => {
    const updatedArguments = [...argumentsList]
    updatedArguments[index][field] = value
    if (field === 'type' && (value === 'undefined' || value === 'null')) {
      updatedArguments[index].value = value
    }
    setArgumentsList(updatedArguments)
  }

  const removeArgument = (index: number) => {
    const newArgumentsList = [...argumentsList]
    newArgumentsList[index] = { ...newArgumentsList[index], hidden: true }
    setArgumentsList(newArgumentsList)
  }

  const handlePreview = useCallback(async () => {
    try {
      showLoader(true)
      const payload = buildEncodePayload(code || '', argumentsList, modSpec, {
        fund: false,
        sign: false,
      })
      const { tx, effect } = await computer.encode(payload)
      setEffectPreview({
        kind: 'preview',
        res: effect?.res,
        env: effect?.env as Record<string, unknown> | undefined,
        txHexLength: tx ? tx.toHex?.()?.length ?? undefined : undefined,
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
  }, [argumentsList, code, computer, modSpec, onPreviewDone, reportResult, showLoader])

  const handleDeploy = useCallback(async () => {
    try {
      showLoader(true)
      const payload = buildEncodePayload(code || '', argumentsList, modSpec, {
        fund: true,
        sign: true,
      })
      const { tx, effect } = await computer.encode(payload)
      if (!tx) throw new Error('Transition does not update the state, no transaction created')
      const txId = await computer.broadcast(tx)
      await sleep(500)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const synced = (await computer.sync(txId)) as any
      const res = synced?.res ?? effect?.res
      const rev = res?._rev ?? `${txId}:0`
      setEffectPreview({
        kind: 'broadcast',
        res: res ?? effect?.res,
        env: effect?.env as Record<string, unknown> | undefined,
        txId,
      })
      reportResult({
        status: 'success',
        title: 'Object created',
        data: { _rev: rev, type: 'objects' },
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
  }, [
    argumentsList,
    code,
    computer,
    modSpec,
    onBroadcastDone,
    reportResult,
    showLoader,
  ])

  const isCallDisabled = useMemo(
    () => !code?.trim() || argumentsList.some((arg) => !arg.hidden && !arg.type.trim()),
    [argumentsList, code],
  )

  const visibleArgs = argumentsList.filter((a) => !a.hidden)
  const showEmpty = !code?.trim() && !exampleLoaded

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        if (!isCallDisabled) void handlePreview()
      } else if (loggedIn && !isCallDisabled) {
        void handleDeploy()
      }
    }
  }

  return (
    <div className="space-y-4">
      {showEmpty ? <EmptyWorkspace onPickExample={onLoadCounter} /> : null}

      <div className="xl:grid xl:grid-cols-5 xl:gap-4 xl:items-start space-y-4 xl:space-y-0">
        <div className="xl:col-span-3 space-y-4 min-w-0">
          <Panel
            title="Contract class"
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
                canClear={Boolean(code?.trim())}
                canReset={Boolean(exampleCode?.trim())}
                onCopy={() => {
                  if (code) navigator.clipboard.writeText(code)
                }}
                onReset={() => setCode(exampleCode || '')}
                onClear={() => setCode('')}
              />
            }
            bodyClassName="p-2 sm:p-3"
          >
            <CodeEditor
              id="code-textarea"
              value={code}
              onChange={setCode}
              placeholder="class MyContract extends Contract { … }"
              minHeight={320}
              onKeyDown={onKeyDown}
              aria-label="Contract class source"
            />
          </Panel>

          <Panel title="Constructor arguments">
            {visibleArgs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                No parameters — add one or load an example.
              </p>
            ) : (
              <div className="space-y-2 mb-3">
                {argumentsList.map(
                  (argument: Argument, index) =>
                    !argument.hidden && (
                      <div key={index} className="flex flex-wrap items-center gap-2">
                        <TypedValueInput
                          id={`playground-argument-${index}`}
                          type={argument.type}
                          value={argument.value}
                          onChange={(v) => handleArgumentChange(index, 'value', v)}
                        />
                        <TypeSelectionDropdown
                          id={`playground-dropdown-${index}`}
                          onSelectMethod={(option: string) =>
                            handleArgumentChange(index, 'type', option)
                          }
                          dropdownList={options}
                          selectedType={argument.type}
                        />
                        <button
                          type="button"
                          onClick={() => removeArgument(index)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                          aria-label="Remove argument"
                          title="Remove"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    ),
                )}
              </div>
            )}
            <button type="button" onClick={handleAddArgument} className={secondaryBtnClassName}>
              Add argument
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
            primaryLabel="Create object"
            onPrimary={handleDeploy}
            primaryDisabled={isCallDisabled}
            loggedIn={loggedIn}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateNew
