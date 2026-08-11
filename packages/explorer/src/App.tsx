import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { initFlowbite } from 'flowbite'
import {
  Auth,
  Gallery,
  SmartObject,
  Transaction,
  Error404,
  UtilsContext,
  Wallet,
  ComputerContext,
  DecodeTransactionComponent,
} from '@bitcoin-computer/components'
import NavBar from './components/Navbar'
import { HomeSearch } from './components/SearchBar'
import Block from './components/Block'
import Blocks from './components/Blocks'
import Modules from './components/Modules'
import Module from './components/Module'
import Playground from './components/playground/Playground'
import UTXODisplay from './components/Utxos'

function AppRoutes() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <>
      {/* Home only: full-width grey search band (outside content padding) */}
      {isHome ? <HomeSearch /> : null}

      {/* Shared content shell — same width/padding on home and internal pages */}
      <div className="w-full max-w-screen-xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Gallery.WithPagination />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/transactions/:txn" element={<Transaction.Component />} />
          <Route path="/decode-txn/:txn" element={<DecodeTransactionComponent />} />
          <Route path="/blocks/:block" element={<Block />} />
          <Route path="/objects/:rev" element={<SmartObject.Component />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/modules/:rev" element={<Module />} />
          <Route path="/utxos/:address" element={<UTXODisplay />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </div>
    </>
  )
}

export default function App() {
  const [computer] = useState(Auth.getComputer())

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <BrowserRouter>
      <span className="bg-gray-900/50 dark:bg-gray-900/80 z-30 inset-0 sr-only"></span>
      <UtilsContext.UtilsProvider>
        <ComputerContext.Provider value={computer}>
          <Auth.LoginModal />
          <Wallet />
          <NavBar />
          <AppRoutes />
        </ComputerContext.Provider>
      </UtilsContext.UtilsProvider>
    </BrowserRouter>
  )
}
