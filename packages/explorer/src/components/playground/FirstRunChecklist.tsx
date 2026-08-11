import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bc-explorer-playground-checklist-v1'

export type ChecklistState = {
  dismissed: boolean
  pickedExample: boolean
  ranPreview: boolean
  broadcast: boolean
}

const defaultState: ChecklistState = {
  dismissed: false,
  pickedExample: false,
  ranPreview: false,
  broadcast: false,
}

function load(): ChecklistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return { ...defaultState }
  }
}

function save(s: ChecklistState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

export function useChecklist() {
  const [state, setState] = useState<ChecklistState>(() => load())

  useEffect(() => {
    save(state)
  }, [state])

  return {
    state,
    mark: (key: keyof ChecklistState, value = true) =>
      setState((s) => ({ ...s, [key]: value })),
    dismiss: () => setState((s) => ({ ...s, dismissed: true })),
  }
}

export function FirstRunChecklist({
  state,
  onDismiss,
}: {
  state: ChecklistState
  onDismiss: () => void
}) {
  if (state.dismissed) return null
  if (state.pickedExample && state.ranPreview && state.broadcast) return null

  const steps: { key: keyof ChecklistState; label: string; done: boolean }[] = [
    { key: 'pickedExample', label: 'Load an example', done: state.pickedExample },
    { key: 'ranPreview', label: 'Preview (dry-run encode)', done: state.ranPreview },
    { key: 'broadcast', label: 'Broadcast on-chain', done: state.broadcast },
  ]

  return (
    <div
      className="rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20 px-3 py-2.5"
      role="region"
      aria-label="Getting started"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Getting started</p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Dismiss
        </button>
      </div>
      <ol className="space-y-1">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                s.done
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-500 border border-gray-300 dark:bg-gray-800 dark:border-gray-600'
              }`}
              aria-hidden
            >
              {s.done ? '✓' : i + 1}
            </span>
            <span
              className={
                s.done
                  ? 'text-gray-500 line-through dark:text-gray-500'
                  : 'text-gray-800 dark:text-gray-200'
              }
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
