import { type ReactNode } from 'react'
import { languages, tokenize, Token } from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/themes/prism.css'

function tokenClassName(type: string, alias?: string | string[]): string {
  const aliases = alias == null ? [] : Array.isArray(alias) ? alias : [alias]
  return ['token', type, ...aliases].filter(Boolean).join(' ')
}

function renderStream(stream: string | Token | (string | Token)[], prefix: string): ReactNode[] {
  const parts = Array.isArray(stream) ? stream : [stream]
  return parts.map((part, i) => {
    const key = `${prefix}${i}`
    if (typeof part === 'string') {
      return <span key={key}>{part}</span>
    }
    return (
      <span key={key} className={tokenClassName(part.type, part.alias)}>
        {renderStream(part.content, `${key}-`)}
      </span>
    )
  })
}

/**
 * Read-only JS highlighting via Prism.tokenize → React spans with Prism token classes.
 * Falls back to plain text if highlighting fails.
 */
export function highlightJs(source: string): ReactNode {
  if (!source) return source
  try {
    const grammar = languages.javascript
    if (!grammar) return source
    return renderStream(tokenize(source, grammar), '')
  } catch {
    return source
  }
}
