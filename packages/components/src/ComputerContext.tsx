import { Computer } from '@bitcoin-computer/lib'
import { createContext } from 'react'

export const ComputerContext = createContext(new Computer())