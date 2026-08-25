import { useEffect, useRef, useState } from 'react'

const PREFIX = 'bc-explorer-playground-draft-v1'

export type DraftMode = 'create' | 'execute' | 'deploy'

type DraftPayload = {
  code?: string
  expression?: string
  module?: string
  modSpec?: string
  updatedAt: number
}

function storageKey(mode: DraftMode) {
  return `${PREFIX}:${mode}`
}

export function loadDraft(mode: DraftMode): DraftPayload | null {
  try {
    const raw = localStorage.getItem(storageKey(mode))
    if (!raw) return null
    return JSON.parse(raw) as DraftPayload
  } catch {
    return null
  }
}

export function saveDraft(mode: DraftMode, payload: Omit<DraftPayload, 'updatedAt'>) {
  try {
    localStorage.setItem(
      storageKey(mode),
      JSON.stringify({ ...payload, updatedAt: Date.now() } satisfies DraftPayload),
    )
  } catch {
    // quota / private mode
  }
}

export function clearDraft(mode: DraftMode) {
  try {
    localStorage.removeItem(storageKey(mode))
  } catch {
    // ignore
  }
}

/**
 * Restore a draft once (if no example is loaded), apply example source when it
 * changes, and persist `{ field, modSpec }` on a debounce.
 */
export function usePlaygroundDraft(
  mode: DraftMode,
  field: 'code' | 'expression' | 'module',
  exampleSource: string,
  exampleLoaded: boolean,
) {
  const [source, setSource] = useState('')
  const [modSpec, setModSpec] = useState<string>()
  const [ready, setReady] = useState(false)
  const prevExample = useRef<string | null>(null)

  useEffect(() => {
    if (ready) return
    if (exampleSource.trim()) {
      setSource(exampleSource)
      setReady(true)
      return
    }
    const draft = loadDraft(mode)
    const saved = draft?.[field]
    if (typeof saved === 'string' && saved.trim()) setSource(saved)
    if (draft?.modSpec) setModSpec(draft.modSpec)
    setReady(true)
  }, [exampleSource, field, mode, ready])

  useEffect(() => {
    if (prevExample.current === null) {
      prevExample.current = exampleSource
      return
    }
    if (prevExample.current === exampleSource) return
    prevExample.current = exampleSource
    setSource(exampleSource || '')
  }, [exampleSource])

  useEffect(() => {
    if (!ready || exampleLoaded) return undefined
    const t = window.setTimeout(() => {
      saveDraft(mode, { [field]: source, modSpec })
    }, 400)
    return () => window.clearTimeout(t)
  }, [exampleLoaded, field, mode, modSpec, ready, source])

  return { source, setSource, modSpec, setModSpec, ready }
}
