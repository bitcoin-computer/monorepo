import React, { useState, useEffect, useRef } from "react";
import { Computer } from "@bitcoin-computer/lib";
import "./App.css";

/**
 * This is a simple wallet app that demonstrates how to use the @bitcoin-computer/lib.
 *
 * To connect the app to a local Bitcoin Computer node set "network to "regtest" and
 * "url" to "http://127.0.0.1:3000" in the "opts" object below.
 */
function App() {
  const opts = {
    mnemonic:
      "travel upgrade inside soda birth essence junk merit never twenty system opinion",
    chain: "LTC",
    network: "testnet",
    url: "https://node.bitcoincomputer.io",
  }
  const [computer] = useState(
    new Computer(opts)
  );
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [to, setTo] = useState("");

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  useEffect(() => {
    async function refresh() {
      if (computer) setBalance(await computer.getBalance());
    }
    refresh();
  }, [computer]);

  useInterval(async () => {
    try {
      if (computer) {
        const newBalance = await computer.getBalance();
        setBalance(newBalance);
      }
    } catch (err) {
      console.log("error occurred while fetching wallet details: ", err);
    }
  }, 20000);


  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const txId = await computer.send(parseInt(amount * 1e8, 10), to);
    const message = `Sent\n${amount}\n\nTo\n${to}\n\nTransaction id\n${txId}`;
    console.log(message);
    alert(message);
  };

  return (
    <div className="App">
      <h2>Wallet</h2>

      <div className="row">
        <div className="col-25"><b>Address</b></div>
        <div className="col-75">{computer.getAddress()}</div>
      </div>
      <div className="row">
        <div className="col-25"><b>Public Key</b></div>
        <div className="col-75">{computer.getPublicKey()}</div>
      </div>

      <div className="row">
        <div className="col-25"><b>Balance</b></div>
        <div className="col-75">{balance / 1e8} {computer.getChain()} ({computer.getNetwork()})</div>
      </div>

      <h3>Send</h3>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-25">
            <label><b>Amount</b></label>
            <br />
          </div>
          <div className="col-75">
            <input
              type="number"
              value={amount}
              min="0.00"
              step="0.001"
              presicion={2}
              onChange={(e) => setAmount(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="row">
          <div className="col-25">
            <label><b>To</b></label>
            <br />
          </div>
          <div className="col-75">
            <input
              type="string"
              style={{ width: "300px" }}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="row">
          <div className="col-25">&nbsp;</div>
          <div className="col-75">
            <input type="submit" value="Send"></input>
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;
