export const getFnParamNames = function (fn: string) {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",") : []
}
