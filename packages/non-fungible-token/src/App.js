import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Computer } from "@bitcoin-computer/lib";
import "./App.css";
import ArtworkForm from "./artworkForm";
import Artworks from "./artworks";
import WalletInfo from "./walletInfo";
function App() {
  const navigate = useNavigate();

  const [config] = useState({
    chain: "LTC",
    // network: "testnet",
    // url: "https://node.bitcoincomputer.io",
    // to run locally, change network and url:
    network: "regtest",
    url: "http://127.0.0.1:3000",
  });
  // travel upgrade inside soda birth essence junk merit never twenty system opinion
  const [computer, setComputer] = useState(
    new Computer({
      ...config,
      mnemonic: localStorage.getItem("BIP_39_KEY"),
    })
  );

  const logout = () => {
    localStorage.removeItem("BIP_39_KEY");
    localStorage.removeItem("CHAIN");
    navigate("/auth/login");
  };

  return (
    <div className="App">
      {
        <div>
          <button
            style={{
              position: "relative",
              float: "right",
              padding: "5px",
              fontSize: "16px",
            }}
            onClick={() => logout()}
          >
            Logout
          </button>
          <WalletInfo computer={computer} />
          <button
            type="submit"
            onClick={() => setComputer(new Computer(config))}
          >
            Generate New Wallet
          </button>
          <ArtworkForm computer={computer} />
          <Artworks computer={computer} />
        </div>
      }
    </div>
  );
}

export default App;
