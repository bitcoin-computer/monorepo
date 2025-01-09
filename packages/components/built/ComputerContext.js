import { Computer } from '@bitcoin-computer/lib';
import { createContext } from 'react';
export var ComputerContext = createContext(new Computer());
