import { useCallback, useEffect, useMemo, useState } from 'react'
import { Computer } from '@bitcoin-computer/lib'
import { Auth, UtilsContext, getErrorMessage } from '@bitcoin-computer/components'
import { CodeEditor } from './CodeEditor'
import {
  ActionBar,
  EditorToolbar,
  EmptyWorkspace,
  Panel,
  PlaygroundResult,
} from './ui'
import { loadDraft, saveDraft, useDebouncedDraft } from './usePlaygroundDraft'

const DeployModule = (props: {
  computer: Computer
  reportResult: (result: PlaygroundResult) => void
  exampleModule: string
  exampleLoaded: boolean
  onLoadCounter?: () => void
  onBroadcastDone?: () => void
}) => {
  const {
    computer,
    exampleModule,
    reportResult,
    exampleLoaded,
    onLoadCounter,
    onBroadcastDone,
  } = props
  const [module, setModule] = useState<string>('')
  const [restored, setRestored] = useState(false)
  const { showLoader } = UtilsContext.useUtilsComponents()
  const loggedIn = Auth.isLoggedIn()

  useEffect(() => {
    if (restored) return
    if (exampleModule) {
      setRestored(true)
      return
    }
    const d = loadDraft('deploy')
    if (d?.module?.trim()) setModule(d.module)
    setRestored(true)
  }, [exampleModule, restored])

  useEffect(() => {
    setModule(exampleModule || '')
  }, [exampleModule])

  useDebouncedDraft('deploy', 'module', module, restored && !exampleLoaded)

  useEffect(() => {
    if (!restored || exampleLoaded) return
    saveDraft('deploy', { module, code: undefined, expression: undefined })
  }, [module, restored, exampleLoaded])

  /** Deploy has no encode dry-run — validate export surface locally. */
  const handlePreview = useCallback(async () => {
    const src = module?.trim() || ''
    if (!src) {
      reportResult({ status: 'error', title: 'Preview failed', data: 'Module source is empty.' })
      return
    }
    const hasExport = /\bexport\s+(class|function|const|let|var|default)\b/.test(src)
    const hasContract = /\bextends\s+Contract\b/.test(src) || /\bContract\b/.test(src)
    if (!hasExport) {
      reportResult({
        status: 'error',
        title: 'Preview',
        data: 'Module should include an export (e.g. export class …). Deploy still broadcasts to the chain.',
      })
      return
    }
    reportResult({
      status: 'success',
      title: 'Module looks valid',
      data: hasContract
        ? 'Found export and Contract reference. Deploy will broadcast on-chain (no off-chain encode preview for modules).'
        : 'Found export. Consider extending Contract for smart objects. Deploy will broadcast on-chain.',
    })
  }, [module, reportResult])

  const handleModuleDeploy = useCallback(async () => {
    try {
      showLoader(true)
      const modSpec = await computer.deploy(module?.trim() as string)
      reportResult({
        status: 'success',
        title: 'Module deployed',
        data: { _rev: modSpec, type: 'modules' },
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
  }, [computer, module, onBroadcastDone, reportResult, showLoader])

  const disabled = useMemo(() => !module?.trim(), [module])
  const showEmpty = !module?.trim() && !exampleLoaded

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) void handlePreview()
      else if (loggedIn && !disabled) void handleModuleDeploy()
    }
  }

  return (
    <div className="space-y-4">
      {showEmpty ? <EmptyWorkspace onPickExample={onLoadCounter} /> : null}

      <Panel
        title="Module source"
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
            canClear={Boolean(module?.trim())}
            canReset={Boolean(exampleModule?.trim())}
            onCopy={() => {
              if (module) navigator.clipboard.writeText(module)
            }}
            onReset={() => setModule(exampleModule || '')}
            onClear={() => setModule('')}
          />
        }
        bodyClassName="p-2 sm:p-3"
      >
        <CodeEditor
          id="module-textarea"
          value={module}
          onChange={setModule}
          placeholder="export class MyContract extends Contract { … }"
          minHeight={320}
          onKeyDown={onKeyDown}
          aria-label="Module source"
        />
      </Panel>

      <ActionBar
        primaryLabel="Deploy module"
        onPrimary={handleModuleDeploy}
        primaryDisabled={disabled}
        loggedIn={loggedIn}
        onPreview={handlePreview}
        previewDisabled={disabled}
        previewLabel="Validate"
      />
    </div>
  )
}

export default DeployModule
