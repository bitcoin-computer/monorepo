const getEnvVar = (key: string): string => {
  const value = process.env[key]
  if (value) return value
  throw new Error(`Please create a .env file.`)
}

export const REACT_APP_NFT_MOD_SPEC: string = getEnvVar('REACT_APP_NFT_MOD_SPEC')
export const REACT_APP_TX_WRAPPER_MOD_SPEC: string = getEnvVar('REACT_APP_TX_WRAPPER_MOD_SPEC')
export const REACT_APP_SALE_MOD_SPEC: string = getEnvVar('REACT_APP_SALE_MOD_SPEC')
export const REACT_APP_PAYMENT_MOD_SPEC: string = getEnvVar('REACT_APP_PAYMENT_MOD_SPEC')
