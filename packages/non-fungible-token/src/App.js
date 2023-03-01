import React, { useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import Mint from "./component/artworks/mint"
import AllArtworks from "./component/artworks/allArtworks"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Login from "./auth/Login"
import ArtworkDetails from "./component/artworks/artworkDetails"
import NavbarWrapper from "./component/navbar/navbarWrapper"
import Payments from "./component/payments"
import Offers from "./component/offers"
import Royalties from "./component/royalties"

function App() {
  const paymentModSpec = 'aff243f4bae633441d87654f921369c0a1c1642bf9311964e1a497c58472de1d/0'
  const royaltyModSpec = 'c4dc6a7636a073c39f5278fe6824a0abb3e9e5ec5894bebe89b000711015b6e6/0'
  const nftModSpec = 'abed8bc1892d2e1dbaee0503776ca435b41644a2d05eebfc30121a532a7694b1/0'
  const offerModSpec = 'd3629773a858489d3cd0593b942a6712394ff12aa197ca0b35861c9b43e5603e/0'

  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const getConf = (network) => ({
    chain: "LTC",
    network,
    mnemonic,
    url: network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:3000"
  })
  const config = getConf("regtest")
  const [computer, setComputer] = useState(mnemonic ? new Computer(config) : null)

  return (
    <div>
      <BrowserRouter>
        <NavbarWrapper computer={computer} />
        <Routes>
          <Route
            path="/auth/login"
            element={<Login config={config} setComputer={setComputer} />}
          />
          <Route
            path="/"
            element={<AllArtworks computer={computer} nftMod={nftModSpec} />}
          />
          <Route
            path="/:publicKey"
            element={<AllArtworks computer={computer} nftMod={nftModSpec} />}
          />
          <Route
            path="/art/:txnId/:outNum"
            element={<ArtworkDetails computer={computer} nftModSpec={nftModSpec} paymentModSpec={paymentModSpec} offerModSpec={offerModSpec} />}
          />
          <Route
            path="/art/mint"
            element={<Mint computer={computer} nftModSpec={nftModSpec} />}
          />
          <Route
            path="/payments"
            element={<Payments computer={computer} paymentModSpec={paymentModSpec} />}
          />
          <Route
            path="/offers"
            element={<Offers computer={computer} offerModSpec={offerModSpec} />}
          />
          <Route
            path="/royalties"
            element={<Royalties computer={computer} royaltyModSpec={royaltyModSpec} />}
          />
          <Route path="*" render={() => <Navigate to="/auth/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
