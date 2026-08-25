import { useContext, useEffect, useMemo, useState } from 'react'
import { Contract } from '@bitcoin-computer/lib'
import { ComputerContext, isValidRev, sleep } from '@bitcoin-computer/components'
import { getValueForType } from '../../utils'
import { TypedValueInput } from './TypedValueInput'
import { PlaygroundWorkspace } from './PlaygroundWorkspace'
import {
  Panel,
  PlaygroundResult,
  RemoveRowButton,
  TypeSelect,
  secondaryBtnClassName,
} from './ui'
import { usePlaygroundDraft } from './usePlaygroundDraft'
import { ExampleVar } from './examples'

interface Argument {
  type: string
  value: string
}

const TYPE_OPTIONS = [
  'object',
  'string',
  'number',
  'bigint',
  'boolean',
  'undefined',
  'null',
  'symbol',
]

function buildEncodePayload(code: string, argumentsList: Argument[], modSpec?: string) {
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
  argumentsList.forEach((argument, index) => {
    if (isValidRev(argument.value)) revMap[`param${index}`] = argument.value
  })

  return {
    exp: `
          ${dynamicClass} 
          new ${dynamicClass.name}(${argumentsList.map((argument, index) => {
            const argValue = getValueForType(argument.type, argument.value)
            if (isValidRev(argValue)) return `param${index}`
            if (typeof argValue === 'string') return `'${argValue}'`
            if (typeof argValue === 'bigint') return `${argValue}n`
            return argValue
          })})
          `,
    env: { ...revMap },
    ...(modSpec ? { mod: modSpec } : {}),
  }
}

const CreateNew = (props: {
  reportResult: (result: PlaygroundResult) => void
  exampleCode: string
  exampleVars: ExampleVar[]
  exampleLoaded: boolean
  onLoadCounter?: () => void
  onPreviewDone?: () => void
  onBroadcastDone?: () => void
}) => {
  const {
    exampleVars,
    exampleCode,
    reportResult,
    exampleLoaded,
    onLoadCounter,
    onPreviewDone,
    onBroadcastDone,
  } = props
  const computer = useContext(ComputerContext)
  const { source: code, setSource: setCode, modSpec, setModSpec } = usePlaygroundDraft(
    'create',
    'code',
    exampleCode,
    exampleLoaded,
  )
  const [argumentsList, setArgumentsList] = useState<Argument[]>([])

  useEffect(() => {
    setArgumentsList(
      (exampleVars ?? []).map((exampleVar) => ({
        type: exampleVar.type,
        value: exampleVar.value ? exampleVar.value : '',
      })),
    )
  }, [exampleCode, exampleVars])

  const handleArgumentChange = (index: number, field: 'type' | 'value', value: string) => {
    setArgumentsList((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      if (field === 'type' && (value === 'undefined' || value === 'null')) {
        next[index].value = value
      }
      return next
    })
  }

  const isCallDisabled = useMemo(
    () => !code?.trim() || argumentsList.some((arg) => !arg.type.trim()),
    [argumentsList, code],
  )

  return (
    <PlaygroundWorkspace
      source={code}
      onSourceChange={setCode}
      exampleSource={exampleCode}
      exampleLoaded={exampleLoaded}
      editorTitle="Contract class"
      editorId="code-textarea"
      placeholder="class MyContract extends Contract { … }"
      minHeight={320}
      ariaLabel="Contract class source"
      modSpec={modSpec}
      onModSpecChange={setModSpec}
      primaryLabel="Create object"
      disabled={isCallDisabled}
      onLoadCounter={onLoadCounter}
      reportResult={reportResult}
      onPreviewDone={onPreviewDone}
      onBroadcastDone={onBroadcastDone}
      buildEncode={({ fund, sign }) => ({
        ...buildEncodePayload(code || '', argumentsList, modSpec),
        fund,
        sign,
      })}
      finishBroadcast={async ({ effect, txId }) => {
        await sleep(500)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const synced = (await computer.sync(txId)) as any
        const res = synced?.res ?? effect?.res
        const rev = res?._rev ?? `${txId}:0`
        return {
          result: {
            status: 'success',
            title: 'Object created',
            data: { _rev: rev, type: 'objects' },
          },
          res: res ?? effect?.res,
          env: effect?.env,
        }
      }}
      extra={
        <Panel title="Constructor arguments">
          {argumentsList.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              No parameters — add one or load an example.
            </p>
          ) : (
            <div className="space-y-2 mb-3">
              {argumentsList.map((argument, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <TypedValueInput
                    id={`playground-argument-${index}`}
                    type={argument.type}
                    value={argument.value}
                    onChange={(v) => handleArgumentChange(index, 'value', v)}
                  />
                  <TypeSelect
                    id={`playground-dropdown-${index}`}
                    value={argument.type}
                    options={TYPE_OPTIONS}
                    onChange={(option) => handleArgumentChange(index, 'type', option)}
                  />
                  <RemoveRowButton
                    label="Remove argument"
                    onClick={() =>
                      setArgumentsList((prev) => prev.filter((_, i) => i !== index))
                    }
                  />
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() =>
              setArgumentsList((prev) => [...prev, { type: 'string', value: '' }])
            }
            className={secondaryBtnClassName}
          >
            Add argument
          </button>
        </Panel>
      }
    />
  )
}

export default CreateNew
