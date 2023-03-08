import React, { useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import Mint from "./components/nfts/mintNft"
import Nfts from "./components/nfts/nfts"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Nft from "./components/nfts/nft"
import NavbarWrapper from "./components/navbar/navbarWrapper"
import Payments from "./components/payments"
import Offers from "./components/offers/offers"
import Royalties from "./components/royalties"
import OfferDetails from "./components/offers/offer"

function App() {
  const paymentModSpec = '40124396cf9f6fb42f5a0e92a6d611a737134fe4534fcc30a4abd35400da6a66:0'
  const royaltyModSpec = '52b998460110a313afbf6fbbdd1571138ca7adc88eaccb7b49dd4dc8acb29bbb:0'
  const nftModSpec = '39963c5c59d1753022a300accb5df229874fa093a9467994d1059192fbeffd2f:0'
  const offerModSpec = '1db83b88f20cb067475cf009cd52088b8493300d90cdcde44ce9c51a45c8b5a8:0'

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
