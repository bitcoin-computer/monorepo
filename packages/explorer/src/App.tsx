import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
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
import { ExplorerSearch } from './components/SearchBar'
import Block from './components/Block'
import Blocks from './components/Blocks'
import Transactions from './components/Transactions'
import Modules from './components/Modules'
import Module from './components/Module'
import Playground from './components/playground/Playground'
import UTXODisplay from './components/Utxos'

/** Legacy `/blocks/:id` → `/block/:id` */
function RedirectLegacyBlock() {
  const { block } = useParams()
  return <Navigate to={`/block/${block ?? ''}`} replace />
}

function AppRoutes() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <>
      {isHome ? <ExplorerSearch variant="home" /> : null}

      <div className="w-full max-w-screen-xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Gallery.WithPagination />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/block/:id" element={<Block />} />
          <Route path="/blocks/:block" element={<RedirectLegacyBlock />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:txn" element={<Transaction.Component />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/decode-txn/:txn" element={<DecodeTransactionComponent />} />
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

  return (
    <BrowserRouter>
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
