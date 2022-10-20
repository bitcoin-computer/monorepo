import React, { useState } from "react";
import { Computer } from "@bitcoin-computer/lib";
import ArtworkForm from "./component/artworks/artworkForm";
import Artworks from "./component/artworks/artworks";
import WalletInfo from "./component/wallet/walletInfo";
import Navbar from "./component/navbar/navbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./common/RequireAuth";
import Login from "./auth/Login";
import ArtworkDetails from "./component/artworks/artworkDetails";


const getConf = (network) => {
  if(network === "testnet")
    return {
      network: "testnet",
      url: "https://node.bitcoincomputer.io",  
    }
  else if(network === "regtest")
    return {
      network: "regtest",
      url: "http://127.0.0.1:3000",
    }
  throw new Error("Unsupported configuration")
}

function App() {
  const [config] = useState({
    chain: "LTC",
    ...getConf("testnet")
  });
  // travel upgrade inside soda birth essence junk merit never twenty system opinion
  const [computer, setComputer] = useState(
    new Computer({
      ...config,
      mnemonic: localStorage.getItem("BIP_39_KEY"),
    })
  );
  return (
    <div>
      <BrowserRouter>
        <Navbar computer={computer} />
        <Routes>
          <Route
            path="/auth/login"
            element={<Login config={config} setComputer={setComputer} />}
          />
          <Route
            path="/art/artworkform"
            element={<RequireAuth redirectTo="/auth/login" />}
          >
            <Route
              path="/art/artworkform"
              element={<ArtworkForm computer={computer} />}
            />
          </Route>

          <Route path="/" element={<RequireAuth redirectTo="/auth/login" />}>
            <Route path="/" element={<Artworks computer={computer} />} />
          </Route>

          <Route
            path="/art/:txnId/:outNum"
            element={<RequireAuth redirectTo="/auth/login" />}
          >
            <Route
              path="/art/:txnId/:outNum"
              element={<ArtworkDetails computer={computer} />}
            />
          </Route>

          <Route
            path="/wallet"
            element={<RequireAuth redirectTo="/auth/login" />}
          >
            <Route
              path="/wallet"
              element={<WalletInfo computer={computer} />}
            />
          </Route>

          {/* <Route
            exact
            path="/art/artworkform"
            element={<ArtworkForm computer={computer} />}
          /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
