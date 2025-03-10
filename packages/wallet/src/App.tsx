import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {
  Auth,
  SmartObject,
  Transaction,
  Error404,
  UtilsContext,
  ComputerContext,
} from '@bitcoin-computer/components'
import { useState } from 'react'
import { Send } from './components/Send'
import { Details } from './components/Details'
import Transactions from './components/Transactions'
import { Assets } from './components/Assets'
import { SideBar } from './components/Sidebar'

export default function App() {
  try {
    const [computer] = useState(Auth.getComputer())

    if (!Auth.isLoggedIn())
      return (
        <UtilsContext.UtilsProvider>
          <div className="p-8 mx-auto max-w-screen w-screen dark:bg-gray-800 min-h-screen h-screen">
            <h2 className="text-4xl mb-24 text-center font-bold dark:text-white">
              Bitcoin Computer Wallet
            </h2>
            <Auth.LoginForm />
          </div>
        </UtilsContext.UtilsProvider>
      )

    return (
      <BrowserRouter>
        <UtilsContext.UtilsProvider>
          <ComputerContext.Provider value={computer}>
            <SideBar />
            <div className="p-4 sm:ml-64 dark:bg-gray-800">
              <div className="p-8 max-w-screen-xl min-h-screen">
                <Routes>
                  <Route path="/" element={<Send />} />
                  <Route path="/send" element={<Send />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/objects/:rev" element={<SmartObject.Component />} />
                  <Route path="/transactions/:txn" element={<Transaction.Component />} />
                  <Route path="/details" element={<Details />} />
                  <Route path="*" element={<Error404 />} />
                </Routes>
                <Auth.LoginModal />
              </div>
            </div>
          </ComputerContext.Provider>
        </UtilsContext.UtilsProvider>
      </BrowserRouter>
    )
  } catch (err) {
    if (err instanceof Error) return <Error404 message={err.message} />
    return <Error404 />
  }
}
