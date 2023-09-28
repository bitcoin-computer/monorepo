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
import SmartContracts from "./components/SmartContracts"

function App() {
  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const getConf = (network: string) => ({
    chain,
    network,
    mnemonic,
    url: network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031",
  })
  const config: Config = getConf("testnet")
  const [computer, setComputer] = useState(new Computer(config))
  return (
    <div className="px-2 sm:px-4 py-2.5">
      <BrowserRouter>
        <NavbarWrapper computer={computer} config={config} setComputer={setComputer} />
        <Routes>
          <Route path="/" element={<SmartContracts computer={computer}></SmartContracts>} />
          <Route path="/blocks" element={<Blocks computer={computer}></Blocks>} />
          <Route
            path="/transactions/:txn"
            element={<Transaction computer={computer}></Transaction>}
          />
          <Route path="/blocks/:block" element={<Block computer={computer}></Block>} />
          <Route path="/outputs/:rev" element={<Output computer={computer}></Output>} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
