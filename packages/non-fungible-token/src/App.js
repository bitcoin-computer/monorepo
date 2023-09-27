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
  const paymentModSpec = '2f00bfcf0c143b77541ae693d6dc2e450b3ce6cad516c133eb6f0bac4429dcf1:0'
  const royaltyModSpec = '7c07ae23b1b66d09a075a998d1e572a7d1369ffd523b802de87ac7c239a6e8b0:0'
  const nftModSpec = 'e7a4700d01def7cf485f252cb5e23fd2dfded9dca2a14442e1c3ce6106cfd789:0'
  const offerModSpec = 'f383920dbfee428380a2ddf237d4f3e0583dde3bfde00beb14058ec117a23b05:0'

  const mnemonic = localStorage.getItem("BIP_39_KEY") || ""
  const chain = localStorage.getItem("CHAIN") || ""
  const getConf = (network) => ({
    chain,
    network,
    mnemonic,
    url: network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031",
  })
  const config = getConf("testnet")
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
