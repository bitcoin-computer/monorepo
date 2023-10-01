import { Computer } from "@bitcoin-computer/lib"
import { useState } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import "./App.css"
import NavbarWrapper from "./components/NavbarWrapper"
import { Config } from "./types/common"
import Transaction from "./components/Transaction"
import Block from "./components/Block"
import Blocks from "./components/Blocks"
import Output from "./components/Output"
import Home from "./components/Home"

function App() {
  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const getConf = (network: string) => ({
    chain,
    network,
    mnemonic,
    url: network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031",
  })
  const config: Config = getConf("regtest")
  const [computer, setComputer] = useState(new Computer(config))
  return (
    <BrowserRouter>
      <NavbarWrapper computer={computer} config={config} setComputer={setComputer} />
      <div className="p-8">
        <Routes>
          <Route path="/" element={<Home computer={computer}></Home>} />
          <Route path="/blocks" element={<Blocks computer={computer}></Blocks>} />
          <Route
            path="/transactions/:txn"
            element={<Transaction computer={computer}></Transaction>}
          />
          <Route path="/blocks/:block" element={<Block computer={computer}></Block>} />
          <Route path="/outputs/:rev" element={<Output computer={computer}></Output>} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
