const getEnvVar = (key: string): string => {
  const value = import.meta.env[key]
  if (value) return value
  return ''
}

export const VITE_WITHDRAW_MOD_SPEC: string = getEnvVar('VITE_WITHDRAW_MOD_SPEC')
