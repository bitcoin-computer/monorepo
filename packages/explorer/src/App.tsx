import "./App.css"
import { Computer } from "@bitcoin-computer/lib"
import { useState } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import NavBar from "./components/Navbar"
import Login from "./components/Login"
import Transaction from "./components/Transaction"
import Block from "./components/Block"
import Blocks from "./components/Blocks"
import SmartObject from "./components/SmartObject"
import Home from "./components/Home"
import Wallet from "./components/Wallet"
import Module from "./components/Module"
import Playground from "./components/playground/Playground"
// import Drawer from "./components/Drawer"

function App() {
  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""

  const url = (network: string) =>
    network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031"
  const getConf = (network: string) => ({ chain, network, mnemonic, url: url(network) })
  const config = getConf("regtest")
  const [computer, setComputer] = useState(new Computer(config))

  return (
    <BrowserRouter>
      <NavBar computer={computer} />
      <div className="p-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        {/* <Drawer /> */}
        <Wallet id={"wallet"} computer={computer} />
        <Routes>
          <Route path="/" element={<Home computer={computer}></Home>} />
          <Route path="/blocks" element={<Blocks computer={computer}></Blocks>} />
          <Route path="/playground" element={<Playground computer={computer} />} />
          <Route
            path="/transactions/:txn"
            element={<Transaction computer={computer}></Transaction>}
          />
          <Route path="/blocks/:block" element={<Block computer={computer}></Block>} />
          <Route path="/objects/:rev" element={<SmartObject computer={computer}></SmartObject>} />
          <Route path="/modules/:rev" element={<Module computer={computer}></Module>} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
        <Login
          config={config}
          setComputer={setComputer}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
