type Json = JBasic | JObject | JArray
type JBasic = undefined | null | boolean | number | string | symbol | bigint
type JArray = Json[]
type JObject = { [x: string]: Json }

const isJUndefined = (a: any): a is undefined => typeof a === "undefined"
const isJNull = (a: any): a is null => a === null
const isJBoolean = (a: any): a is boolean => typeof a === "boolean"
const isJNumber = (a: any): a is number => typeof a === "number"
const isJString = (a: any): a is string => typeof a === "string"
const isJSymbol = (a: any): a is symbol => typeof a === "symbol"
const isJBigInt = (a: any): a is bigint => typeof a === "bigint"
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
    throw new Error("Unsupported type")
  }

  export const strip = (value: Json): Json => {
    if (isJBasic(value)) return value
    if (isJArray(value)) return value.map(strip)
    const { _id, _root, _rev, _amount, _owners, ...rest } = value
    return rest
  }

// https://github.com/GoogleChromeLabs/jsbi/issues/30
export const toObject = (obj: any) =>
  JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2);

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export function isValidRevString(outId: string): boolean {
  return /^[0-9A-Fa-f]{64}:\d+$/.test(outId)
}

export function isValidRev(value: any): boolean {
  return typeof value === "string" && isValidRevString(value)
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
