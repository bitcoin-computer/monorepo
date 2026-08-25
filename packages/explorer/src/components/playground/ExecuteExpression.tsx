import { useEffect, useMemo, useState } from 'react'
import { isValidRev } from '@bitcoin-computer/components'
import { PlaygroundWorkspace } from './PlaygroundWorkspace'
import {
  inputClassName,
  Panel,
  PlaygroundResult,
  RemoveRowButton,
  secondaryBtnClassName,
} from './ui'
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
          {envBindings.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Bind names used in the expression to revision strings (revs).
            </p>
          ) : (
            <div className="space-y-2 mb-3">
              {envBindings.map((argument, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    id={`playground-expression-argument-name-${index}`}
                    value={argument.name}
                    onChange={(e) =>
                      setEnvBindings((prev) => {
                        const next = [...prev]
                        next[index] = { ...next[index], name: e.target.value }
                        return next
                      })
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
                      setEnvBindings((prev) => {
                        const next = [...prev]
                        next[index] = { ...next[index], value: e.target.value }
                        return next
                      })
                    }
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
            </div>
          )}
          <button
            type="button"
            onClick={() => setEnvBindings((prev) => [...prev, { name: '', value: '' }])}
            className={secondaryBtnClassName}
          >
            Add environment variable
          </button>
        </Panel>
      }
    />
  )
}

export default ExecuteExpression
