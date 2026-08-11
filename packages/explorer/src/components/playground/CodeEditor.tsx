import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/themes/prism.css'

type Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  onKeyDown?: (e: React.KeyboardEvent) => void
  'aria-label'?: string
}

/**
 * Lightweight Prism-highlighted JS editor (Phase C1).
 */
export function CodeEditor({
  id,
  value,
  onChange,
  placeholder,
  minHeight = 280,
  onKeyDown,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <div
      className="rounded-md border border-gray-200 dark:border-gray-600 overflow-auto bg-slate-50 dark:bg-gray-900 max-h-[min(70vh,520px)]"
      onKeyDown={onKeyDown}
    >
      <Editor
        textareaId={id}
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlight(code, languages.javascript, 'javascript')}
        padding={12}
        placeholder={placeholder}
        textareaClassName="outline-none"
        preClassName="language-javascript"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 13,
          minHeight,
          backgroundColor: 'transparent',
        }}
        aria-label={ariaLabel || 'Code editor'}
      />
    </div>
  )
}
