export const getFnParamNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : []
}

export function isValidRevString(outId: string): boolean {
  return /^[0-9A-Fa-f]{64}:\d+$/.test(outId)
}

export function isValidRev(value: string | number | true | null | undefined): boolean {
  return typeof value === 'string' && isValidRevString(value)
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

type Json = JBasic | JObject | JArray
type JBasic = undefined | null | boolean | number | string | symbol | bigint
type JArray = Json[]
type JObject = { [x: string]: Json }

const isJUndefined = (a: unknown): a is undefined => typeof a === 'undefined'
const isJNull = (a: unknown): a is null => a === null
const isJBoolean = (a: unknown): a is boolean => typeof a === 'boolean'
const isJNumber = (a: unknown): a is number => typeof a === 'number'
const isJString = (a: unknown): a is string => typeof a === 'string'
const isJSymbol = (a: unknown): a is symbol => typeof a === 'symbol'
const isJBigInt = (a: unknown): a is bigint => typeof a === 'bigint'
const isJBasic = (a: unknown): a is JBasic =>
  isJNull(a) ||
  isJUndefined(a) ||
  isJNumber(a) ||
  isJString(a) ||
  isJBoolean(a) ||
  isJSymbol(a) ||
  isJBigInt(a)
const isJObject = (a: unknown): a is JObject => !isJBasic(a) && !Array.isArray(a)
const isJArray = (a: unknown): a is JArray => !isJBasic(a) && Array.isArray(a)

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
  // eslint-disable-next-line
  const { _id, _root, _rev, _satoshis, _owners, ...rest } = value
  return rest
}

export const chunk = (arr: string[], chunkSize = 4): string[][] => {
  const chunks = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  return chunks
}

export const getValueForType = (type: string, stringValue: string) => {
  switch (type) {
    case 'number':
      return Number(stringValue)
    case 'string':
      return stringValue
    case 'boolean':
      return true // make this dynamic
    case 'undefined':
      return undefined
    case 'null':
      return null
    case 'object':
      return stringValue
    default:
      return Number(stringValue)
  }
}

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const isValidHexadecimalPrivateKey = (privateKey: string): boolean => {
  if (!privateKey) return false
  const trimmedPrivateKey = privateKey.trim()
  return trimmedPrivateKey.length === 64 || trimmedPrivateKey.length === 66
}

export interface ErrorResponse {
  response?: {
    data?: {
      error?: string
    }
  }
  message?: string
}

export const getErrorMessage = (error: ErrorResponse): string => {
  if (
    error?.response?.data?.error ===
    'mandatory-script-verify-flag-failed (Operation not valid with the current stack size)'
  ) {
    return 'You are not authorised to make changes to this smart object'
  }
  if (error?.response?.data?.error) {
    return error?.response?.data?.error
  }
  return error.message ? error.message : 'Error occurred'
}
