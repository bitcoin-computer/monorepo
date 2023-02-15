import "./App.css";
import { Computer } from "@bitcoin-computer/lib";
import { useState } from "react";
import Counter from "./Counter";

/**
 * To run with a local Bitcoin Computer node set "network" to "regtest"
 * and "url" to "http://127.0.0.1:3000" below.
 */
function App() {
  const [computer] = useState(
    new Computer({
      mnemonic:
        "travel upgrade inside soda birth essence junk merit never twenty system opinion",
      chain: 'LTC',
      url: 'https://node.bitcoincomputer.io',
      network: "testnet",
    })
  );

  return (
    <div className="App">
      <Counter computer={computer}></Counter>
    </div>
  );
}

export default App;
