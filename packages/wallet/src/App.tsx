import "./App.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import {
  Auth,
  SmartObject,
  Transaction,
  Error404,
  UtilsContext,
  ComputerContext
} from "@bitcoin-computer/components"
import { useState } from "react"
import { Send } from "./components/Send"
import { Details } from "./components/Details"
import Transactions from "./components/Transactions"
import { Assets } from "./components/Assets"
import { SideBar } from "./components/Sidebar"
import { Faucet } from "./components/Faucet"

export default function App() {
  const [computer] = useState(Auth.getComputer())

  if (!Auth.isLoggedIn())
    return (
      <UtilsContext.UtilsProvider>
        <div className="p-8 mt-16 max-w-screen-md mx-auto">
          <h2 className="text-4xl mb-8 text-center font-bold dark:text-white">TBC Wallet</h2>
          <Auth.LoginForm />
        </div>
      </UtilsContext.UtilsProvider>
    )

  return (
    <BrowserRouter>
      <UtilsContext.UtilsProvider>
        <ComputerContext.Provider value={computer}>
          <SideBar />
          <div className="p-4 sm:ml-64">
            <div className="p-8 max-w-screen-xl">
              <Routes>
                <Route path="/" element={<Send />} />
                <Route path="/send" element={<Send />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/objects/:rev" element={<SmartObject.Component />} />
                <Route path="/transactions/:txn" element={<Transaction.Component />} />
                <Route path="/details" element={<Details />} />
                <Route path="/faucet" element={<Faucet />} />
                <Route path="*" element={<Error404 />} />
              </Routes>
              <Auth.LoginModal />
            </div>
          </div>
        </ComputerContext.Provider>
      </UtilsContext.UtilsProvider>
    </BrowserRouter>
  )
}
