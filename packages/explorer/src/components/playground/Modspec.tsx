import { Dispatch, SetStateAction } from 'react'
import { inputClassName } from './ui'

export const ModSpec = ({
  modSpec,
  setModSpec,
}: {
  modSpec: string | undefined
  setModSpec: Dispatch<SetStateAction<string | undefined>>
}) => (
  <div>
    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
      Module specifier <span className="font-normal text-gray-400">(optional)</span>
    </label>
    <input
      type="text"
      value={modSpec ?? ''}
      onChange={(e) => setModSpec(e.target.value || undefined)}
      className={`${inputClassName} max-w-xl`}
      placeholder="txid:vout"
    />
  </div>
)
