import "./App.css"
import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { initFlowbite } from "flowbite"
import {
  Auth,
  Error404,
  UtilsContext,
  Wallet,
  SmartObject,
  Transaction,
  ComputerContext
} from "@bitcoin-computer/components"
import Mint from "./components/Mint"
import { Chats } from "./components/Chats"

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
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
            <Routes>
              <Route path="/" element={<Chats />} />
              <Route path="/new-chat" element={<Mint />} />
              <Route path="/objects/:rev" element={<SmartObject.Component />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chats/:id" element={<Chats />} />
              <Route path="/transactions/:txn" element={<Transaction.Component />} />
              <Route path="*" element={<Navigate to="/" replace={true} />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </div>
        </ComputerContext.Provider>
      </UtilsContext.UtilsProvider>
    </BrowserRouter>
  )
}
