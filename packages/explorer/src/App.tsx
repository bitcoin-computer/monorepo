import "./App.css"
import { useState } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import NavBar from "./components/Navbar"
import { Login, getComputer } from "./components/Login"
import Transaction from "./components/Transaction"
import Block from "./components/Block"
import Blocks from "./components/Blocks"
import SmartObject from "./components/SmartObject"
import Home from "./components/Home"
import Wallet from "./components/Wallet"
import Module from "./components/Module"
import Playground from "./components/playground/Playground"

function App() {
  const [computer, setComputer] = useState(getComputer())

  return (
    <BrowserRouter>
      <span className="bg-gray-900/50 dark:bg-gray-900/80 sr-only"></span>
      <Wallet id={"wallet"} computer={computer} />
      <Login setComputer={setComputer} />
      <NavBar computer={computer} />
      <div className="p-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <Routes>
          <Route path="/" element={<Home computer={computer}></Home>} />
          <Route path="/blocks" element={<Blocks computer={computer}></Blocks>} />
          <Route path="/playground" element={<Playground computer={computer} />} />
          <Route path="/transactions/:txn" element={<Transaction computer={computer}></Transaction>} />
          <Route path="/blocks/:block" element={<Block computer={computer}></Block>} />
          <Route path="/objects/:rev" element={<SmartObject computer={computer}></SmartObject>} />
          <Route path="/modules/:rev" element={<Module computer={computer}></Module>} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
