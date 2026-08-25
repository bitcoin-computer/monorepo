type Json = JBasic | JObject | JArray
type JBasic = undefined | null | boolean | number | string | symbol | bigint
type JArray = Json[]
type JObject = { [x: string]: Json }

const isJUndefined = (a: any): a is undefined => typeof a === 'undefined'
const isJNull = (a: any): a is null => a === null
const isJBoolean = (a: any): a is boolean => typeof a === 'boolean'
const isJNumber = (a: any): a is number => typeof a === 'number'
const isJString = (a: any): a is string => typeof a === 'string'
const isJSymbol = (a: any): a is symbol => typeof a === 'symbol'
const isJBigInt = (a: any): a is bigint => typeof a === 'bigint'
const isJBasic = (a: any): a is JBasic =>
  isJNull(a) ||
  isJUndefined(a) ||
  isJNumber(a) ||
  isJString(a) ||
  isJBoolean(a) ||
  isJSymbol(a) ||
  isJBigInt(a)
const isJObject = (a: any): a is JObject => !isJBasic(a) && !Array.isArray(a)
const isJArray = (a: any): a is JArray => !isJBasic(a) && Array.isArray(a)

const objectEntryMap =
  (g: (el: [string, Json]) => [string, Json]) =>
  (object: JObject): JObject =>
    Object.fromEntries(Object.entries(object).map(g))

const objectMap =
  (f: (el: Json) => Json) =>
  (object: JObject): JObject =>
    objectEntryMap(([key, value]) => [key, f(value)])(object)

export const jsonMap =
  (g: (el: Json) => Json) =>
  (json: Json): Json => {
    if (isJBasic(json)) return g(json)
    if (isJArray(json)) return g(json.map(jsonMap(g)))
    if (isJObject(json)) return g(objectMap(jsonMap(g))(json))
    throw new Error('Unsupported type')
  }

export const strip = (value: Json): Json => {
  if (isJBasic(value)) return value
  if (isJArray(value)) return value.map(strip)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, _root, _rev, _satoshis, _owners, ...rest } = value
  return rest
}

// https://github.com/GoogleChromeLabs/jsbi/issues/30
export const toObject = (obj: any) =>
  JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export function isValidRevString(outId: string): boolean {
  return /^[0-9A-Fa-f]{64}:\d+$/.test(outId)
}

export function isValidRev(
  value: string | number | bigint | boolean | symbol | null | undefined,
): boolean {
  return typeof value === 'string' && isValidRevString(value)
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const SPENT_INPUT_RE =
  /bad-txns-inputs-missingorspent|missingorspent|missing-inputs/i

const OLD_REVISION_MESSAGE =
  'This revision is already spent. Are you trying to update an old revision? Open the latest revision and try again.'

function collectErrorFragments(error: unknown, depth = 0, acc: string[] = []): string[] {
  if (error == null || depth > 5) return acc
  if (typeof error === 'string') {
    acc.push(error)
    const trimmed = error.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        collectErrorFragments(JSON.parse(trimmed), depth + 1, acc)
      } catch {
        // not JSON
      }
    }
    return acc
  }
  if (typeof error !== 'object') return acc
  const obj = error as Record<string, unknown>
  if (typeof obj.message === 'string' || typeof obj.message === 'object') {
    collectErrorFragments(obj.message, depth + 1, acc)
  }
  if (obj.error != null) collectErrorFragments(obj.error, depth + 1, acc)
  if (obj.response != null) collectErrorFragments(obj.response, depth + 1, acc)
  if (obj.data != null) collectErrorFragments(obj.data, depth + 1, acc)
  return acc
}

/** True when bitcoind rejected the tx because inputs were already spent (typical of calling a method on an old revision). */
export function isMissingOrSpentError(error: unknown): boolean {
  return collectErrorFragments(error).some((s) => SPENT_INPUT_RE.test(s))
}

export const getErrorMessage = (error: any): string => {
  if (isMissingOrSpentError(error)) return OLD_REVISION_MESSAGE
  if (
    error?.response?.data?.error ===
    'mandatory-script-verify-flag-failed (Operation not valid with the current stack size)'
  )
    return 'You are not authorized to make changes to this smart object'
  if (error?.response?.data?.error) return error?.response?.data?.error
  return error.message ? error.message : 'Error occurred'
}

export function getEnv(name: string) {
  return (
    (typeof process !== 'undefined' && process.env[`REACT_APP_${name}`]) ||
    (import.meta.env && import.meta.env[`VITE_${name}`])
  )
}

export function bigIntToStr(a: bigint): string {
  if (a < 0n) throw new Error('Balance must be a non-negative')

  const scale = BigInt(1e8)
  const integerPart = (a / scale).toString()
  const fractionalPart = (a % scale).toString().padStart(8, '0').replace(/0+$/, '')
  return `${integerPart}.${fractionalPart || '0'}`
}

export function strToBigInt(a: string): bigint {
  // Validate number contains at most one dot and is not empty
  if ((a.match(/\./g) || []).length > 1 || a === '.' || a === '') {
    throw new Error('Invalid number')
  }

  const [integerPart, fractionalPart = ''] = a.split('.')

  // Validate integer and fractional part contains only digits (or is empty)
  if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error('Invalid number')
  }

  const paddedFractionalPart = fractionalPart.padEnd(8, '0').slice(0, 8)
  const totalSatoshisStr = integerPart + paddedFractionalPart

  return BigInt(totalSatoshisStr)
}
