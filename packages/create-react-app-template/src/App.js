import "./App.css";
import { Computer } from "@bitcoin-computer/lib";
import { useState } from "react";
import Counter from "./Counter";

/**
 * To run with a local Bitcoin Computer node set "network" to "regtest"
 */
function App() {
  const getConf = (network) => ({
    chain: 'LTC',
    network,
    mnemonic: 'travel upgrade inside soda birth essence junk merit never twenty system opinion',
    url: network === "testnet" ? "https://node.bitcoincomputer.io" : "http://127.0.0.1:1031",
  })

  const config = getConf("testnet")
  const [computer] = useState(new Computer(config))
  return (
    <div className="App">
      <Counter computer={computer}></Counter>
    </div>
  );
}

export default App;
