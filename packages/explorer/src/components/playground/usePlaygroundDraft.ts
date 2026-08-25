import { useEffect, useRef } from 'react'

const PREFIX = 'bc-explorer-playground-draft-v1'

export type DraftMode = 'create' | 'execute' | 'deploy'

type DraftPayload = {
  code?: string
  expression?: string
  module?: string
  modSpec?: string
  updatedAt: number
}

function key(mode: DraftMode) {
  return `${PREFIX}:${mode}`
}

export function loadDraft(mode: DraftMode): DraftPayload | null {
  try {
    const raw = localStorage.getItem(key(mode))
    if (!raw) return null
    return JSON.parse(raw) as DraftPayload
  } catch {
    return null
  }
}

export function saveDraft(mode: DraftMode, payload: Omit<DraftPayload, 'updatedAt'>) {
  try {
    localStorage.setItem(
      key(mode),
      JSON.stringify({ ...payload, updatedAt: Date.now() } satisfies DraftPayload),
    )
  } catch {
    // quota / private mode
  }
}

export function clearDraft(mode: DraftMode) {
  try {
    localStorage.removeItem(key(mode))
  } catch {
    // ignore
  }
}

/** Debounced persist of a single text field for a mode. */
export function useDebouncedDraft(
  mode: DraftMode,
  field: 'code' | 'expression' | 'module',
  value: string,
  enabled = true,
) {
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return undefined
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => {
      const prev = loadDraft(mode) || { updatedAt: 0 }
      saveDraft(mode, { ...prev, [field]: value })
    }, 400)
    return () => {
      if (t.current) clearTimeout(t.current)
    }
  }, [mode, field, value, enabled])
}

