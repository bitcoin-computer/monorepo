import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TypeSelectionDropdown } from './common/TypeSelectionDropdown'
import { getErrorMessage, isValidRev } from './common/utils'
import { UtilsContext } from './UtilsContext'
import { ComputerContext } from './ComputerContext'
import { FieldError } from './InlineAlert'

export { getErrorMessage }

const getValueForType = (type: string, stringValue: string) => {
  switch (type) {
    case 'number':
      return Number(stringValue)
    case 'bigint':
      return BigInt(stringValue)
    case 'string':
      return stringValue
    case 'boolean':
      return stringValue === 'true'
    case 'undefined':
      return undefined
    case 'null':
      return null
    case 'object':
      return stringValue
    case 'symbol':
      return Symbol(stringValue)
    default:
      return Number(stringValue)
  }
}

export const getParameterNames = (fn: ((...args: any[]) => any) | string) => {
  try {
    const match = fn.toString().match(/\(.*?\)/)
    return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : []
  } catch {
    return []
  }
}

const getParameters = (params: string[], fnName: string, formState: any) =>
  params.map((param) => {
    const key = `${fnName}-${param}`
    const paramValue = getValueForType(formState[`${key}--types`], formState[key])

    if (isValidRev(paramValue)) return param
    if (typeof paramValue === 'string') return `'${paramValue}'`
    // BigInt.prototype.toString() drops the `n` suffix, which would otherwise turn this
    // back into a plain number literal once interpolated into the `exp` string below.
    if (typeof paramValue === 'bigint') return `${paramValue}n`
    return paramValue
  })

function resolveMethodFn(smartObject: any, funcName: string): ((...a: unknown[]) => unknown) | null {
  try {
    let proto: object | null = Object.getPrototypeOf(smartObject)
    while (proto && proto !== Object.prototype) {
      try {
        const desc = Object.getOwnPropertyDescriptor(proto, funcName)
        if (desc && 'value' in desc && typeof desc.value === 'function') return desc.value
        const v = (proto as any)[funcName]
        if (typeof v === 'function') return v
      } catch {
        // continue
      }
      try {
        proto = Object.getPrototypeOf(proto)
      } catch {
        break
      }
    }
  } catch {
    return null
  }
  return null
}

export const SmartObjectFunction = ({
  smartObject,
  functionsExist,
  options,
  funcName,
  embedded = false,
}: {
  smartObject: any
  functionsExist: boolean
  options: string[]
  funcName: string
  /** When true, omit outer title (parent panel already shows it) */
  embedded?: boolean
}) => {
  const parameterList = useMemo(() => {
    try {
      const fn = resolveMethodFn(smartObject, funcName)
      if (!fn) return [] as string[]
      return getParameterNames(fn).filter((val) => Boolean(val))
    } catch {
      return [] as string[]
    }
  }, [smartObject, funcName])

  const buildInitialForm = (params: string[]) =>
    Object.fromEntries(
      params.flatMap((key) => [
        [`${funcName}-${key}`, ''],
        // Default type so the call button is not stuck disabled until user picks a type
        [`${funcName}-${key}--types`, 'string'],
      ]),
    )

  const [formState, setFormState] = useState<any>(() => buildInitialForm(parameterList))
  const [formError, setFormError] = useState<string | null>(null)
  const { showLoader, toast } = UtilsContext.useUtilsComponents()
  const computer = useContext(ComputerContext)
  const navigate = useNavigate()

  // Keep form fields in sync if parameter list resolves after mount
  useEffect(() => {
    setFormState(buildInitialForm(parameterList))
    setFormError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when method/params change
  }, [funcName, parameterList.join(',')])

  const handleMethodCall = async (event: any, smartObj: any, fnName: string, params: string[]) => {
    event.preventDefault()
    setFormError(null)
    showLoader(true)
    try {
      const revMap: any = {}

      // Create Rev Map to pass smart objects as params
      params.forEach((param) => {
        const key = `${fnName}-${param}`
        const paramValue = getValueForType(formState[`${key}--types`], formState[key])
        if (isValidRev(paramValue)) {
          revMap[param] = paramValue
        }
      })

      const { tx } = await computer.encode({
        exp: `smartObject.${fnName}(${getParameters(params, fnName, formState)})`,
        env: { smartObject: smartObj._rev, ...revMap },
      })

      await computer.broadcast(tx!)
      await computer.waitForIndexed(tx.txId)
      const rev = await computer.latest(smartObject._id)

      toast.success(`Method “${fnName}” executed. A new revision was created on chain.`, {
        title: 'Success',
        durationMs: 8000,
        action: {
          label: 'View latest revision',
          onClick: () => navigate(`/objects/${rev}`),
        },
      })
    } catch (error: any) {
      const message = getErrorMessage(error)
      setFormError(message)
      toast.error(message, { title: 'Method call failed' })
    } finally {
      showLoader(false)
    }
  }

  const updateForm = (e: any, key: string) => {
    e.preventDefault()
    const value = { ...formState }
    value[key] = e.target.value
    setFormState(value)
    if (formError) setFormError(null)
  }

  const updateTypes = (option: string, key: string) => {
    const value = { ...formState }
    value[`${key}--types`] = option
    setFormState(value)
    if (formError) setFormError(null)
  }

  const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const isDisabled = useMemo(
    () =>
      Object.keys(formState).length > 0 && Object.values(formState).some((value) => value === ''),
    [formState],
  )

  if (!functionsExist) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Methods are not available.</p>
    )
  }

  const inputClass =
    'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'

  return (
    <div id={`function-${funcName}`} className={embedded ? '' : 'mt-6 mb-6'}>
      {!embedded ? (
        <h3 className="my-1.5 text-base font-semibold dark:text-white">
          {capitalizeFirstLetter(funcName)}
        </h3>
      ) : null}
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        {parameterList.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 px-3 py-2.5">
            This method takes no parameters.
          </p>
        ) : (
          parameterList.map((paramName, paramIndex) => (
            <div key={`${funcName}-${paramName}-${paramIndex}`}>
              <label
                htmlFor={`${funcName}-${paramName}`}
                className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {paramName}
              </label>
              <div className="flex flex-row items-center gap-2">
                <input
                  type="text"
                  id={`${funcName}-${paramName}`}
                  value={formState[`${funcName}-${paramName}`] ?? ''}
                  onChange={(e) => updateForm(e, `${funcName}-${paramName}`)}
                  className={`${inputClass} min-w-0 flex-1`}
                  placeholder={`Value for ${paramName}`}
                  required
                  autoComplete="off"
                />
                <div className="shrink-0">
                  <TypeSelectionDropdown
                    id={`${funcName}${paramName}`}
                    dropdownList={options}
                    selectedType={formState[`${funcName}-${paramName}--types`] || 'string'}
                    onSelectMethod={(option: string) =>
                      updateTypes(option, `${funcName}-${paramName}`)
                    }
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {formError ? <FieldError>{formError}</FieldError> : null}

        <button
          id={`${funcName}-call-function-button`}
          type="button"
          disabled={isDisabled}
          className={`w-full sm:w-auto text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none transition
            ${
              isDisabled
                ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600'
                : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
            }
          `}
          onClick={(evt) => handleMethodCall(evt, smartObject, funcName, parameterList)}
        >
          Call method
        </button>
      </form>
    </div>
  )
}
