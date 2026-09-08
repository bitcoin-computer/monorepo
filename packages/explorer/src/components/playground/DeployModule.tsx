import { useCallback, useContext, useMemo } from 'react'
import {
  ComputerContext,
  UtilsContext,
  getErrorMessage,
} from '@bitcoin-computer/components'
import { PlaygroundWorkspace } from './PlaygroundWorkspace'
import { PlaygroundResult } from './ui'
import { usePlaygroundDraft } from './usePlaygroundDraft'

const DeployModule = (props: {
  reportResult: (result: PlaygroundResult) => void
  exampleModule: string
  exampleLoaded: boolean
  onLoadCounter?: () => void
  onBroadcastDone?: () => void
}) => {
  const { exampleModule, reportResult, exampleLoaded, onLoadCounter, onBroadcastDone } = props
  const computer = useContext(ComputerContext)
  const { showLoader } = UtilsContext.useUtilsComponents()
  const { source: module, setSource: setModule } = usePlaygroundDraft(
    'deploy',
    'module',
    exampleModule,
    exampleLoaded,
  )

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

  return (
    <PlaygroundWorkspace
      source={module}
      onSourceChange={setModule}
      exampleSource={exampleModule}
      exampleLoaded={exampleLoaded}
      editorTitle="Module source"
      editorId="module-textarea"
      placeholder="export class MyContract extends Contract { … }"
      minHeight={320}
      ariaLabel="Module source"
      showModSpec={false}
      showEffect={false}
      primaryLabel="Deploy module"
      disabled={disabled}
      onLoadCounter={onLoadCounter}
      reportResult={reportResult}
      onBroadcastDone={onBroadcastDone}
      onPreview={handlePreview}
      onBroadcast={handleModuleDeploy}
      previewLabel="Validate"
    />
  )
}

export default DeployModule
