const getEnvVar = (key: string): string => {
  const value = process.env[key]
  if (value) return value
  throw new Error(`Please create a .env file.`)
}

export const VITE_NFT_MOD_SPEC: string = getEnvVar('VITE_NFT_MOD_SPEC')
export const VITE_TX_WRAPPER_MOD_SPEC: string = getEnvVar('VITE_TX_WRAPPER_MOD_SPEC')
export const VITE_SALE_MOD_SPEC: string = getEnvVar('VITE_SALE_MOD_SPEC')
export const VITE_PAYMENT_MOD_SPEC: string = getEnvVar('VITE_PAYMENT_MOD_SPEC')
