import React, { useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import Mint from "./components/nfts/mintNft"
import Nfts from "./components/nfts/nfts"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Nft from "./components/nfts/nft"
import NavbarWrapper from "./components/navbar/navbarWrapper"
import Payments from "./components/payments/payments"
import Payment from "./components/payments/payment"
import Offers from "./components/offers/offers"
import Royalties from "./components/royalties"
import OfferDetails from "./components/offers/offer"

function App() {
  const paymentModSpec = "d4380bdb071475bcb7975514aa173dbfcfd7f578ac203296d683e0ccc648ae8d:0"
  const royaltyModSpec = "6b20a30bde6dc645c64fd260b793abddcbbc24da466f787cda7fc550de1ac548:0"
  const nftModSpec = "fde028bbf91207748b48f2439653d3a1cf8d4141d3506503dd0a92921520385c:0"
  const offerModSpec = "5980d89adc4cb58f519793fb5bd79c4df18fc87a5c012ce772d866ca13ecf248:0"

  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const getConf = (network) => ({
    chain,
    network,
    mnemonic,
    url: network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:3000",
  })
  const config = getConf("regtest")
  const [computer, setComputer] = useState(mnemonic ? new Computer(config) : null)

  return (
    <div>
      <BrowserRouter>
        <NavbarWrapper computer={computer} config={config} setComputer={setComputer} />
        <Routes>
          {["/", "/nfts"].map((path) => (
            <Route
              path={path}
              key={path}
              element={<Nfts computer={computer} nftMod={nftModSpec} />}
            />
          ))}
          <Route
            path="/art/:rev"
            element={
              <Nft
                computer={computer}
                nftModSpec={nftModSpec}
                paymentModSpec={paymentModSpec}
                offerModSpec={offerModSpec}
              />
            }
          />
          <Route path="/art/mint" element={<Mint computer={computer} nftModSpec={nftModSpec} />} />
          <Route
            path="/payments"
            element={<Payments computer={computer} paymentModSpec={paymentModSpec} />}
          />
          <Route
            path="/payment/:rev"
            element={<Payment computer={computer} paymentModSpec={paymentModSpec} />}
          />
          <Route
            path="/offers"
            element={<Offers computer={computer} offerModSpec={offerModSpec} />}
          />
          <Route
            path="/offer/:rev"
            element={<OfferDetails computer={computer} offerModSpec={offerModSpec} />}
          />
          <Route
            path="/royalties"
            element={<Royalties computer={computer} royaltyModSpec={royaltyModSpec} />}
          />
          <Route path="*" render={() => <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
