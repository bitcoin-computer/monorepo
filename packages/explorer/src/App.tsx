import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { initFlowbite } from 'flowbite'
import {
  Auth,
  Gallery,
  SmartObject,
  Transaction,
  Error404,
  UtilsContext,
  Wallet,
  ComputerContext
} from '@bitcoin-computer/components'
import NavBar from './components/Navbar'
import Block from './components/Block'
import Blocks from './components/Blocks'
import Module from './components/Module'
import Playground from './components/playground/Playground'

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
          <div className="p-8 max-w-screen-lg flex flex-wrap items-center justify-between mx-auto">
            <Routes>
              <Route path="/" element={<Gallery.WithPagination />} />
              <Route path="/blocks" element={<Blocks />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/transactions/:txn" element={<Transaction.Component />} />
              <Route path="/blocks/:block" element={<Block />} />
              <Route path="/objects/:rev" element={<SmartObject.Component />} />
              <Route path="/modules/:rev" element={<Module />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </div>
        </ComputerContext.Provider>
      </UtilsContext.UtilsProvider>
    </BrowserRouter>
  )
}
