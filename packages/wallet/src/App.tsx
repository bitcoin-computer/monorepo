import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import "./App.css"
import { initFlowbite } from "flowbite"
import NavBar from "./components/Navbar"
import Login from "./components/Login"
import SmartObject from "./components/SmartObject"
import Home from "./components/Home"
import { CustomDrawer } from "./components/Utils/Drawer"
import Module from "./components/Module"
import { Transfer } from "./components/Utils/Transfer"

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
      <NavBar setShowLogin={setShowLogin} computer={computer} />
      <div className="p-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <CustomDrawer id={"wallet"} computer={computer} />
        <Transfer id={"transfer"} computer={computer} />
        <Routes>
          <Route path="/" element={<Home computer={computer}></Home>} />
          <Route path="/objects/:rev" element={<SmartObject computer={computer}></SmartObject>} />
          <Route path="/modules/:rev" element={<Module computer={computer}></Module>} />
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
