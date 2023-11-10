export const getFnParamNames = function (fn: string) {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",") : []
}

export function isValidRevString(outId: string): boolean {
  return /^[0-9A-Fa-f]{64}:\d+$/.test(outId)
}

export function isValidRev(value: any): boolean {
  return typeof value === "string" && isValidRevString(value)
}

export const isJString = (a: any): a is string => typeof a === "string"

// eslint-disable-next-line
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
