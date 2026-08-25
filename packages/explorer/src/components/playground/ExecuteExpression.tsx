import { useEffect, useMemo, useState } from 'react'
import { isValidRev } from '@bitcoin-computer/components'
import { PlaygroundWorkspace } from './PlaygroundWorkspace'
import { FieldList, inputClassName, Panel, PlaygroundResult, RemoveRowButton } from './ui'
import { usePlaygroundDraft } from './usePlaygroundDraft'

interface EnvBinding {
  name: string
  value: string
}

const ExecuteExpression = (props: {
  reportResult: (result: PlaygroundResult) => void
  exampleExpression: string
  exampleLoaded: boolean
  onLoadCounter?: () => void
  onPreviewDone?: () => void
  onBroadcastDone?: () => void
}) => {
  const {
    exampleExpression,
    reportResult,
    exampleLoaded,
    onLoadCounter,
    onPreviewDone,
    onBroadcastDone,
  } = props

  const { source: expression, setSource: setExpression, modSpec, setModSpec } =
    usePlaygroundDraft('execute', 'expression', exampleExpression, exampleLoaded)
  const [envBindings, setEnvBindings] = useState<EnvBinding[]>([])

  useEffect(() => {
    setEnvBindings([])
  }, [exampleExpression])

  const isCallDisabled = useMemo(
    () => !expression?.trim() || envBindings.some((arg) => !arg.name.trim()),
    [envBindings, expression],
  )

  const handleBindingChange = (index: number, field: 'name' | 'value', value: string) => {
    setEnvBindings((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const buildEnv = () => {
    const revMap: { [key: string]: string } = {}
    envBindings.forEach((argument) => {
      if (isValidRev(argument.value)) revMap[argument.name] = argument.value
    })
    return revMap
  }

  return (
    <PlaygroundWorkspace
      source={expression}
      onSourceChange={setExpression}
      exampleSource={exampleExpression}
      exampleLoaded={exampleLoaded}
      editorTitle="Expression"
      editorId="expression-textarea"
      placeholder="new Counter() or other JS expression"
      minHeight={280}
      ariaLabel="Expression source"
      modSpec={modSpec}
      onModSpecChange={setModSpec}
      primaryLabel="Execute expression"
      disabled={isCallDisabled}
      onLoadCounter={onLoadCounter}
      reportResult={reportResult}
      onPreviewDone={onPreviewDone}
      onBroadcastDone={onBroadcastDone}
      buildEncode={({ fund, sign }) => ({
        exp: `${expression?.trim() ?? ''}`,
        env: buildEnv(),
        fund,
        sign,
        ...(modSpec ? { mod: modSpec } : {}),
      })}
      finishBroadcast={async ({ effect, txId }) => ({
        result: {
          status: 'success',
          title: 'Expression executed',
          data: { _rev: `${txId}:0`, type: 'objects', res: effect.res },
        },
        res: effect?.res,
        env: effect?.env,
      })}
      extra={
        <Panel title="Environment">
          <FieldList
            count={envBindings.length}
            empty="Bind names used in the expression to revision strings (revs)."
            addLabel="Add environment variable"
            onAdd={() => setEnvBindings((prev) => [...prev, { name: '', value: '' }])}
          >
            {envBindings.map((argument, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  id={`playground-expression-argument-name-${index}`}
                  value={argument.name}
                  onChange={(e) => handleBindingChange(index, 'name', e.target.value)}
                  className={`${inputClassName} w-full sm:w-40`}
                  placeholder="Name"
                  required
                />
                <input
                  type="text"
                  id={`playground-expression-argument-${index}`}
                  value={argument.value}
                  onChange={(e) => handleBindingChange(index, 'value', e.target.value)}
                  className={`${inputClassName} min-w-[10rem] flex-1`}
                  placeholder="Rev (txid:vout)"
                  required
                />
                <RemoveRowButton
                  label="Remove env binding"
                  onClick={() => setEnvBindings((prev) => prev.filter((_, i) => i !== index))}
                />
              </div>
            ))}
          </FieldList>
        </Panel>
      }
    />
  )
}

export default ExecuteExpression
