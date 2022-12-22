import "./App.css";
import { Computer } from "@bitcoin-computer/lib";
import { useState } from "react";
import Counter from "./Counter";

function App() {
  const [computer] = useState(
    new Computer({
      mnemonic:
        "travel upgrade inside soda birth essence junk merit never twenty system opinion",
      chain: "LTC",
      url: "http://127.0.0.1:3000",
      network: "regtest",
    })
  );

  return (
    <div className="App">
      <Counter computer={computer}></Counter>
    </div>
  );
}

export default App;
