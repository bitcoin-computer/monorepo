import "./App.css"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import NavBar from "./components/Navbar"
import { Login } from "./components/Login"
import Transaction from "./components/Transaction"
import Block from "./components/Block"
import Blocks from "./components/Blocks"
import SmartObject from "./components/SmartObject"
import Home from "./components/Home"
import Wallet from "./components/Wallet"
import Module from "./components/Module"
import Playground from "./components/playground/Playground"

function App() {
  console.log('App')
  return (
    <BrowserRouter>
      <span className="bg-gray-900/50 dark:bg-gray-900/80 sr-only"></span>
      <Wallet />
      <Login />
      <NavBar />
      <div className="p-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/transactions/:txn" element={<Transaction />} />
          <Route path="/blocks/:block" element={<Block />} />
          <Route path="/objects/:rev" element={<SmartObject />} />
          <Route path="/modules/:rev" element={<Module />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
