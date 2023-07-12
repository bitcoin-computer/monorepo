import { Computer } from "@bitcoin-computer/lib"
import { useState } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import "./App.css"
import NavbarWrapper from "./components/NavbarWrapper"
import Counter from "./components/Counter"
import { Config } from "./types/common"

function App() {
  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const getConf = (network: string) => ({
    chain,
    network,
    mnemonic,
    url: network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:3000",
  })
  const config: Config = getConf("regtest")
  const [computer, setComputer] = useState(new Computer(config))
  return (
    <>
      <BrowserRouter>
        <NavbarWrapper computer={computer} config={config} setComputer={setComputer} />
        <Routes>
          <Route path="/" element={<Counter computer={computer}></Counter>} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
