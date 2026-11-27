import { builtinEnvironments, type Environment } from 'vitest/environments'

// vitest's jsdom environment puts jsdom's ArrayBuffer and typed arrays on the global object.
// They come from jsdom's own realm, and SES lockdown, which new Computer() runs, refuses
// built-ins from another realm. A browser has one realm, so the tests keep this realm's own.
const OWN_REALM = [
  'ArrayBuffer',
  'Uint8Array',
  'Int8Array',
  'Uint16Array',
  'Int16Array',
  'Uint32Array',
  'Int32Array',
  'Uint8ClampedArray',
  'Float32Array',
  'Float64Array',
] as const

const environment: Environment = {
  name: 'jsdom-one-realm',
  viteEnvironment: 'client',
  async setup(global, options) {
    const own = OWN_REALM.map((key) => [key, global[key]] as const)
    const jsdom = await builtinEnvironments.jsdom.setup(global, options)
    for (const [key, value] of own)
      Object.defineProperty(global, key, { value, writable: true, configurable: true })
    return jsdom
  },
}

export default environment
