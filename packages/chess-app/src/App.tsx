import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { initFlowbite } from 'flowbite'
import { Auth, UtilsContext, Wallet, ComputerContext } from '@bitcoin-computer/components'
import { ChessBoard } from './components/ChessBoard'

import { Navbar } from './components/Navbar'
import { MyGames } from './components/MyGames/index'
import { Home } from './components/Home'

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
          <Navbar />
          <div className="w-full h-screen bg-white border-gray-200 dark:bg-gray-900 px-4 lg:px-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:id" element={<ChessBoard />} />
              <Route path="/my-games" element={<MyGames />} />
              <Route path="*" element={<Navigate to="/" replace={true} />} />
            </Routes>
          </div>
        </ComputerContext.Provider>
      </UtilsContext.UtilsProvider>
    </BrowserRouter>
  )
}
