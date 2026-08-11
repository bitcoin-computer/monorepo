import { inputClassName } from './ui'

/** Richer typed value input (Phase C5). */
export function TypedValueInput({
  id,
  type,
  value,
  onChange,
  placeholder,
}: {
  id?: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  if (type === 'boolean') {
    return (
      <select
        id={id}
        value={value === 'true' || value === 'false' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClassName} min-w-[10rem] flex-1`}
        aria-label="Boolean value"
      >
        <option value="" disabled>
          Select…
        </option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }

  if (type === 'undefined' || type === 'null') {
    return (
      <input
        id={id}
        type="text"
        value={type}
        readOnly
        className={`${inputClassName} min-w-[10rem] flex-1 opacity-70`}
        aria-label={type}
      />
    )
  }

  const hint =
    type === 'bigint'
      ? 'e.g. 100n or 100'
      : type === 'number'
        ? 'number'
        : type === 'object'
          ? '{"key":"value"}'
          : placeholder || 'Value'

  return (
    <div className="flex-1 min-w-[10rem] flex flex-col gap-0.5">
      <input
        id={id}
        type={type === 'number' ? 'text' : 'text'}
        inputMode={type === 'number' || type === 'bigint' ? 'decimal' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName}
        placeholder={hint}
        required={type !== 'undefined' && type !== 'null'}
        aria-label={type ? `${type} value` : 'Value'}
      />
      {type === 'bigint' ? (
        <span className="text-[10px] text-gray-400">BigInt — trailing n optional</span>
      ) : null}
      {type === 'object' ? (
        <span className="text-[10px] text-gray-400">JSON object or string</span>
      ) : null}
    </div>
  )
}
