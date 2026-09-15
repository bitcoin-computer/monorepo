export function getValueForType(type: string, stringValue: string) {
  switch (type) {
    case 'number':
      return Number(stringValue)
    case 'string':
      return stringValue
    case 'boolean':
      return stringValue === 'true' || stringValue === '1'
    case 'bigint': {
      const cleaned = stringValue.trim().replace(/n$/i, '')
      return BigInt(cleaned || '0')
    }
    case 'undefined':
      return undefined
    case 'null':
      return null
    case 'object':
      try {
        return JSON.parse(stringValue)
      } catch {
        return stringValue
      }
    default:
      return stringValue
  }
}
