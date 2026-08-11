import { useContext, useEffect, useRef, useState } from 'react'
import { Auth, ComputerContext } from '@bitcoin-computer/components'
import CreateNew from './CreateNew'
import ExecuteExpression from './ExecuteExpression'
import DeployModule from './DeployModule'
import { FirstRunChecklist, useChecklist } from './FirstRunChecklist'
import {
  chat,
  chatExport,
  chatExpresion,
  chatVars,
  counter,
  counterExport,
  counterExpresion,
  counterVars,
  fungibleToken,
  fungibleTokenExport,
  fungibleTokenExpresion,
  nft,
  nftExport,
  nftExpresion,
  nftVars,
  tokenVars,
} from './examples'
import { PlaygroundResult, ResultPanel } from './ui'

type Mode = 'create' | 'execute' | 'deploy'
type ExampleId = 'nft' | 'token' | 'counter' | 'chat' | null

const MODES: { id: Mode; label: string; help: string }[] = [
  {
    id: 'create',
    label: 'Create',
    help: 'Define a Contract class and construct an on-chain instance. Preview shows effect.res without broadcast.',
  },
  {
    id: 'execute',
    label: 'Execute',
    help: 'Run a JavaScript expression. Preview runs encode (fund/sign off) and shows new state.',
  },
  {
    id: 'deploy',
    label: 'Deploy',
    help: 'Publish a module (export class …). Validate checks export surface; deploy always broadcasts.',
  },
]

const EXAMPLES: {
  id: NonNullable<ExampleId>
  label: string
  description: string
  modes: Mode[]
}[] = [
  {
    id: 'nft',
    label: 'NFT',
    description: 'Simple non-fungible token with send',
    modes: ['create', 'execute', 'deploy'],
  },
  {
    id: 'token',
    label: 'Token',
    description: 'Fungible token balance pattern',
    modes: ['create', 'execute', 'deploy'],
  },
  {
    id: 'counter',
    label: 'Counter',
    description: 'Minimal state + method call',
    modes: ['create', 'execute', 'deploy'],
  },
  {
    id: 'chat',
    label: 'Chat',
    description: 'Multi-party style contract sketch',
    modes: ['create', 'execute', 'deploy'],
  },
]

const Playground = () => {
  const computer = useContext(ComputerContext)
  const [mode, setMode] = useState<Mode>('create')
  const [activeExample, setActiveExample] = useState<ExampleId>(null)
  const [result, setResult] = useState<PlaygroundResult | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const checklist = useChecklist()

  const [exampleCode, setExampleCode] = useState('')
  const [exampleExpression, setExampleExpresion] = useState('')
  const [exampleModule, setExampleModule] = useState('')
  const [exampleVars, setExampleVars] = useState<
    { name: string; type: string; value: string }[]
  >([])

  const loggedIn = Auth.isLoggedIn()
  let chain = ''
  let network = ''
  try {
    chain = computer.getChain()
    network = computer.getNetwork()
  } catch {
    // ignore
  }

  const clearExamples = () => {
    setActiveExample(null)
    setExampleCode('')
    setExampleExpresion('')
    setExampleModule('')
    setExampleVars([])
    setResult(null)
  }

  const loadExamples = (type: NonNullable<ExampleId>) => {
    setActiveExample(type)
    setResult(null)
    checklist.mark('pickedExample')
    switch (type) {
      case 'nft':
        setExampleCode(nft)
        setExampleExpresion(nftExpresion)
        setExampleModule(nftExport)
        setExampleVars(nftVars)
        break
      case 'token':
        setExampleCode(fungibleToken)
        setExampleExpresion(fungibleTokenExpresion(computer.getPublicKey()))
        setExampleModule(fungibleTokenExport)
        setExampleVars(tokenVars(computer.getPublicKey()))
        break
      case 'chat':
        setExampleCode(chat)
        setExampleExpresion(chatExpresion)
        setExampleModule(chatExport)
        setExampleVars(chatVars)
        break
      case 'counter':
        setExampleCode(counter)
        setExampleExpresion(counterExpresion)
        setExampleModule(counterExport)
        setExampleVars(counterVars)
        break
      default:
        break
    }
  }

  const reportResult = (r: PlaygroundResult) => {
    setResult(r)
  }

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  const exampleLoaded = activeExample !== null
  const modeMeta = MODES.find((m) => m.id === mode)!

  const examplesColumn = (
    <section className="space-y-2" aria-label="Examples">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold dark:text-white">Examples</h2>
        <button
          type="button"
          onClick={clearExamples}
          className="text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        {EXAMPLES.map((ex) => {
          const selected = activeExample === ex.id
          const suited = ex.modes.includes(mode)
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => loadExamples(ex.id)}
              className={`text-left rounded-lg border px-3 py-2.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                selected
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-950/40 dark:border-blue-500'
                  : suited
                    ? 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                    : 'border-gray-100 bg-gray-50/80 opacity-75 hover:opacity-100 dark:border-gray-800 dark:bg-gray-900/50'
              }`}
            >
              <span className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {ex.label}
                </span>
                {selected ? (
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-300">✓</span>
                ) : null}
                {suited ? (
                  <span className="text-[10px] font-medium uppercase tracking-wide rounded px-1 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {mode}
                  </span>
                ) : null}
              </span>
              <span className="block mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-snug">
                {ex.description}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
        Badge shows the active mode. Drafts auto-save when not using an example.
      </p>
    </section>
  )

  return (
    <div className="w-full space-y-4 pb-2">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">Playground</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create objects, run expressions, deploy modules
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {chain || network ? (
            <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200">
              {[chain, network].filter(Boolean).join(' · ')}
            </span>
          ) : null}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              loggedIn
                ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900'
                : 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
            }`}
          >
            {loggedIn ? 'Wallet signed in' : 'Guest — sign in to fund & broadcast'}
          </span>
        </div>
      </header>

      <FirstRunChecklist state={checklist.state} onDismiss={checklist.dismiss} />

      {!loggedIn ? (
        <div
          className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-200"
          role="status"
        >
          You can edit and <strong className="font-semibold">Preview</strong> as a guest. Sign in
          before <strong className="font-semibold">Create / Execute / Deploy</strong> to broadcast.
        </div>
      ) : null}

      <div className="lg:hidden">{examplesColumn}</div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
        <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24">{examplesColumn}</aside>

        <div className="lg:col-span-9 space-y-4 min-w-0">
          <section>
            <div
              className="inline-flex flex-wrap rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-900/50"
              role="tablist"
              aria-label="Playground mode"
            >
              {MODES.map((m) => {
                const selected = mode === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`playground-tab-${m.id}`}
                    aria-controls={`playground-panel-${m.id}`}
                    onClick={() => {
                      setMode(m.id)
                      setResult(null)
                    }}
                    className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selected
                        ? 'bg-white text-blue-700 shadow-sm dark:bg-gray-800 dark:text-blue-300'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" id="playground-mode-help">
              {modeMeta.help}
            </p>
          </section>

          <div
            role="tabpanel"
            id={`playground-panel-${mode}`}
            aria-labelledby={`playground-tab-${mode}`}
          >
            {mode === 'create' ? (
              <CreateNew
                computer={computer}
                reportResult={reportResult}
                exampleCode={exampleCode}
                exampleVars={exampleVars}
                exampleLoaded={exampleLoaded}
                onLoadCounter={() => loadExamples('counter')}
                onPreviewDone={() => checklist.mark('ranPreview')}
                onBroadcastDone={() => checklist.mark('broadcast')}
              />
            ) : null}
            {mode === 'execute' ? (
              <ExecuteExpression
                computer={computer}
                reportResult={reportResult}
                exampleExpression={exampleExpression}
                exampleVars={exampleVars}
                exampleLoaded={exampleLoaded}
                onLoadCounter={() => loadExamples('counter')}
                onPreviewDone={() => checklist.mark('ranPreview')}
                onBroadcastDone={() => checklist.mark('broadcast')}
              />
            ) : null}
            {mode === 'deploy' ? (
              <DeployModule
                computer={computer}
                reportResult={reportResult}
                exampleModule={exampleModule}
                exampleLoaded={exampleLoaded}
                onLoadCounter={() => loadExamples('counter')}
                onBroadcastDone={() => checklist.mark('broadcast')}
              />
            ) : null}
          </div>

          <div aria-live="polite" aria-atomic="true">
            <ResultPanel
              result={result}
              onDismiss={() => setResult(null)}
              panelRef={resultRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Playground
