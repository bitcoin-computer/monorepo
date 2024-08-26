import React, { createContext, useState, useContext, ReactNode } from "react"

interface BalanceContextProps {
  setBalance: (amount: number) => void
  balance: number
}

const balanceContext = createContext<BalanceContextProps | undefined>(undefined)

interface BalanceProviderProps {
  children: ReactNode
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState(0)

  return (
    <balanceContext.Provider value={{ balance, setBalance }}>{children}</balanceContext.Provider>
  )
}

export const useBalance = (): BalanceContextProps => {
  const context = useContext(balanceContext)
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider")
  }
  return context
}

export const BalanceContext = {
  BalanceProvider,
  useBalance
}
