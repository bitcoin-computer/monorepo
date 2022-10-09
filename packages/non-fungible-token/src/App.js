import React, { useState } from "react";
import { Computer } from "@bitcoin-computer/lib";
import "./App.css";
import ArtworkForm from "./artworkForm";
import Artworks from "./artworks";
import WalletInfo from "./walletInfo";
function App() {
  const [config] = useState({
    chain: "LTC",
    // network: "testnet",
    // url: "https://node.bitcoincomputer.io",
    // to run locally, change network and url:
    network: "regtest",
    url: "http://127.0.0.1:3000",
  });
  const [computer, setComputer] = useState(
    new Computer({
      ...config,
      mnemonic:
        "travel upgrade inside soda birth essence junk merit never twenty system opinion",
    })
  );

  return (
    <div className="App">
      {
        <div>
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
