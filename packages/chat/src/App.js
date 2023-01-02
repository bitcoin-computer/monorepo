import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Computer } from "@bitcoin-computer/lib";
import Wallet from "./Wallet";
import Chat from "./Chat";
import SideBar from "./SideBar";
import useInterval from "./useInterval";

/**
 * This is a simple chat app that demonstrates how to use the @bitcoin-computer/lib.
 *
 * To connect the app to a local Bitcoin Computer node set "network" to "regtest" and
 * "url" to "http://127.0.0.1:3000" in the "opts" object below.
 */
function App() {
  const opts = {
    chain: "LTC",
    network: "regtest", // "testnet",
    url: "http://127.0.0.1:3000" // "https://node.bitcoincomputer.io",
  }

  const [computer, setComputer] = useState(null);
  const [chats, setChats] = useState([]);
  const [chain, setChain] = useState("LTC");

  useInterval(() => {
    // the BIP_39_KEY is set on login and we fetch it from local storage
    const password = window.localStorage.getItem("BIP_39_KEY");
    // the chain has also been stored in local storage on login, we need
    // to store the chain in the state because we pass it to Wallet
    setChain(window.localStorage.getItem("CHAIN"));

    const isLoggedIn = password && chain;

    // if you are currently logging in
    if (isLoggedIn && !computer) {
      setComputer(new Computer(opts))
      console.log("Bitcoin Computer created on chain " + chain);
      // if you are currently logging out
    } else if (!isLoggedIn && computer) {
      console.log("You have been logged out");
      setComputer(null);
    }
  }, 5000);

  useInterval(() => {
    const refresh = async () => {
      if (computer) {
        const revs = await computer.getRevs(computer.getPublicKey());
        setChats(
          await Promise.all(revs.map(async (rev) => computer.sync(rev)))
        );
      }
    };
    refresh();
  }, 7000);

  return (
    <Router>
      <div className="App">
        {/* bind the value of chain stored in the state to the child component */}
        <Wallet computer={computer} chain={chain}></Wallet>
        <SideBar computer={computer} chats={chats}></SideBar>

        <div className="main">
          <Routes>
            <Route
              path="/chat/:id/:outIndex"
              element={<Chat computer={computer}></Chat>}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
