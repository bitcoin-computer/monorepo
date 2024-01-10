import "./App.css"
import { useEffect } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import NavBar from "./components/Navbar"
import Block from "./components/Block"
import Blocks from "./components/Blocks"
import Wallet from "./components/Wallet"
import Module from "./components/Module"
import Playground from "./components/playground/Playground"
import { initFlowbite } from "flowbite"
import {
  Auth,
  Gallery,
  SmartObject,
  Transaction,
  Error404,
  UtilsContext,
} from "@bitcoin-computer/components"
export default function App() {
  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <BrowserRouter>
      <span className="bg-gray-900/50 dark:bg-gray-900/80 z-30 inset-0 sr-only"></span>
      <UtilsContext.UtilsProvider>
        <Auth.LoginModal />
        <Wallet />
        <NavBar />
        <div className="p-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
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
      </UtilsContext.UtilsProvider>
    </BrowserRouter>
  )
}
