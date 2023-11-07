import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import "./App.css"
import { initFlowbite } from "flowbite"
import NavBar from "./components/Navbar"
import Wallet from "./components/Wallet"
import Login from "./components/Login"
import Transaction from "./components/Transaction"
import Block from "./components/Block"
import Blocks from "./components/Blocks"
import Output from "./components/Output"
import Home from "./components/Home"
import Test from "./components/Test"

function App() {
  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const [showLogin, setShowLogin] = useState(false)

  const url = (network: string) =>
    network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031"
  const getConf = (network: string) => ({ chain, network, mnemonic, url: url(network) })
  const config = getConf("regtest")
  const [computer, setComputer] = useState(new Computer(config))
  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <BrowserRouter>
      <NavBar setShowLogin={setShowLogin} />
      <div className="p-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <Wallet computer={computer} />
        <Routes>
          <Route path="/" element={<Home computer={computer}></Home>} />
          <Route path="/blocks" element={<Blocks computer={computer}></Blocks>} />
          <Route path="/test" element={<Test computer={computer}></Test>} />
          <Route
            path="/transactions/:txn"
            element={<Transaction computer={computer}></Transaction>}
          />
          <Route path="/blocks/:block" element={<Block computer={computer}></Block>} />
          <Route path="/outputs/:rev" element={<Output computer={computer}></Output>} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
        <Login
          showLogin={showLogin}
          config={config}
          setComputer={setComputer}
          setShowLogin={setShowLogin}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
