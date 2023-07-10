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
  const paymentModSpec = '9f9fab13889062f6cd90b328777c0648a83238a2bb8396a42ff4bbc9540f7187:0'
  const royaltyModSpec = '3ae01f554bf9c54bac7efda67d9caa8727285bcbeeb77c2dac1805c2bdc3e96f:0'
  const nftModSpec = '52729d1f3a6897edca772345257a1ac3644877a6577caae3ecbaefa86b613c18:0'
  const offerModSpec = 'c710bfa55e0dbec3868c98bcb4a56aca1af0cae26be3999ff073851c69157943:0'

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
          {['/', '/nfts'].map(path => (<Route
            path={path}
            key={path}
            element={<Nfts computer={computer} nftMod={nftModSpec} />}
          />))}
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
