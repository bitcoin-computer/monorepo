import React, { useState } from "react";
import { Computer } from "@bitcoin-computer/lib";
import ArtworkForm from "./component/artworks/artworkForm";
import AllArtworks from "./component/artworks/allArtworks";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./common/RequireAuth";
import Login from "./auth/Login";
import ArtworkDetails from "./component/artworks/artworkDetails";
import NavbarWrapper from "./component/navbar/navbarWrapper";

const getConf = (network) => {
  if (network === "testnet")
    return {
      network: "testnet",
      url: "https://node.bitcoincomputer.io",
    };
  else if (network === "regtest")
    return {
      network: "regtest",
      url: "http://127.0.0.1:3000",
    };
  throw new Error("Unsupported configuration");
};

function App() {
  const [config] = useState({
    chain: "LTC",
    ...getConf("regtest"),
  });
  // travel upgrade inside soda birth essence junk merit never twenty system opinion
  // hover harsh text dice wealth pill across trade soccer olive view acquire
  // damp comfort scan couple absurd enter slogan cheap ketchup print syrup hurdle one document diamond
  const [computer, setComputer] = useState(
    new Computer({
      ...config,
      mnemonic: localStorage.getItem("BIP_39_KEY"),
    })
  );

  const [publicKey, setPublicKey] = useState("");

  return (
    <div>
      <BrowserRouter>
        <NavbarWrapper computer={computer} setPublicKey={setPublicKey} />
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
            <Route
              path="/"
              element={
                <AllArtworks publicKey={publicKey} computer={computer} />
              }
            />
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
